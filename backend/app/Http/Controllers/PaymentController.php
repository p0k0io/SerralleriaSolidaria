<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Order;
use App\Models\Payment;
use App\Models\OrderItem;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        Log::info("🟡 Checkout iniciado");

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            // FIX 1: usar $request->user() en lugar de Auth::user()
            // En rutas API con Sanctum/Passport, Auth::user() puede ser null
            // incluso con el token correcto. $request->user() es siempre fiable.
            $user = $request->user();

            Log::info("👤 Usuario recibido:", ['user_id' => $user?->id]);

            if (! $user) {
                Log::warning("❌ Usuario NO autenticado");
                return response()->json(['error' => 'No autenticado'], 401);
            }

            Log::info("📦 Request data:", $request->all());

            $validated = $request->validate([
                'items'       => 'required|array|min:1',
                'full_name'   => 'required|string',
                'email'       => 'required|email',
                'phone'       => 'required|string',
                'address'     => 'required|string',
                'postal_code' => 'required|string',
                'city'        => 'required|string',
                'country'     => 'required|string',
            ]);

            Log::info("✅ Validación OK");

            $cart       = $request->items;
            $line_items = [];
            $total      = 0;

            foreach ($cart as $item) {
                Log::info("🛒 Item:", $item);

                if (! isset($item['price'], $item['qty'])) {
                    throw new \Exception("Item inválido: faltan campos 'price' o 'qty'");
                }

                $amount = intval(round($item['price'] * 100));

                $line_items[] = [
                    'price_data' => [
                        'currency'     => 'eur',
                        'product_data' => ['name' => $item['product_name'] ?? 'Producto'],
                        'unit_amount'  => $amount,
                    ],
                    'quantity' => $item['qty'],
                ];

                $total += ($item['price'] * $item['qty']);
            }

            Log::info("💰 Total calculado: " . $total);

            DB::beginTransaction();

            // Generar número de seguimiento único: TRK-XXXXXXXX
            do {
                $tracking = 'TRK-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
            } while (Order::where('order_tracking', $tracking)->exists());

            Log::info("🔖 Tracking generado: " . $tracking);

            $order = Order::create([
                'user_id'        => $user->id,   // garantizado no-null por el guard de arriba
                'status'         => 'nuevo',
                'order_tracking' => $tracking,
                'full_name'      => $validated['full_name'],
                'email'          => $validated['email'],
                'phone'          => $validated['phone'],
                'address'        => $validated['address'],
                'postal_code'    => $validated['postal_code'],
                'city'           => $validated['city'],
                'country'        => $validated['country'],
                'total_amount'   => $total,
            ]);

            Log::info("🧾 Order creada:", ['order_id' => $order->id, 'tracking' => $tracking]);

            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items'           => $line_items,
                'mode'                 => 'payment',
                'client_reference_id'  => (string) $user->id,
                'metadata'             => [
                    'user_id'        => $user->id,
                    'order_id'       => $order->id,
                    'order_tracking' => $tracking,
                ],
                'success_url' => config('app.front_url') . '/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'  => config('app.front_url') . '/carrito',
            ]);

            Log::info("💳 Stripe session creada:", ['session_id' => $session->id]);

            // FIX 2: el Payment se crea con estado 'pending', NO 'paid'.
            // El estado 'paid' lo confirma el webhook cuando Stripe lo notifica.
            // Si se marca 'paid' aquí el usuario podría cerrar el navegador sin pagar
            // y el pedido quedaría marcado como pagado incorrectamente.
            Payment::create([
                'order_id'       => $order->id,
                'provider'       => 'stripe',
                'payment_status' => 'pending',      // ← corregido de 'paid' a 'pending'
                'transaction_id' => $session->id,
            ]);

            // FIX 3: unit_price debe ser el precio unitario, NO precio × cantidad
            OrderItem::insert(
                collect($cart)->map(function ($item) use ($order) {
                    return [
                        'order_id'     => $order->id,
                        'variant_id'   => $item['id'] ?? null,
                        'product_name' => $item['product_name'] ?? 'Producto',
                        'quantity'     => $item['qty'],
                        'unit_price'   => $item['price'],         // ← precio unitario, sin multiplicar
                        'status'       => 'pendiente',
                        'created_at'   => now(),
                        'updated_at'   => now(),
                    ];
                })->toArray()
            );

            Log::info("💾 OrderItems guardados");

            DB::commit();
            Log::info("🟢 Checkout OK — order_id: {$order->id}");

            return response()->json(['url' => $session->url]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error("❌ Error de validación", $e->errors());
            return response()->json(['error' => 'Validación fallida', 'details' => $e->errors()], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("💥 ERROR GENERAL: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Error al crear el checkout', 'message' => $e->getMessage()], 500);
        }
    }

    public function checkSession(string $id)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $session = Session::retrieve($id);

        return response()->json([
            'status'         => $session->payment_status,
            'order_id'       => $session->metadata->order_id ?? null,
            'order_tracking' => $session->metadata->order_tracking ?? null,
        ]);
    }

    public function webhook(Request $request)
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = config('services.stripe.webhook_secret');   // usar config(), no env()

        Log::info('📩 Webhook recibido');

        if (! $sigHeader) {
            Log::error('❌ No Stripe-Signature header');
            return response()->json(['error' => 'no signature'], 400);
        }

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            Log::error('❌ Webhook inválido', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'invalid signature'], 400);
        }

        Log::info('✅ Evento válido: ' . $event->type);

        // FIX 4: el webhook ahora actualiza el pedido y el pago cuando Stripe confirma.
        // Antes este bloque estaba vacío — los pedidos nunca se confirmaban.
        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;

            $orderId = $session->metadata->order_id ?? null;

            Log::info('💳 Pago completado', [
                'session_id' => $session->id,
                'order_id'   => $orderId,
            ]);

            if ($orderId) {
                // Actualizar el estado del pedido a 'en_preparacion' (ya pagado)
                Order::where('id', $orderId)->update([
                    'status'     => 'en_preparacion',
                    'updated_at' => now(),
                ]);

                // Confirmar el pago
                Payment::where('transaction_id', $session->id)->update([
                    'payment_status' => 'paid',
                    'updated_at'     => now(),
                ]);

                Log::info("✅ Pedido #{$orderId} confirmado como pagado");
            }
        }

        // Pago fallido o cancelado
        if ($event->type === 'checkout.session.expired') {
            $session = $event->data->object;
            $orderId = $session->metadata->order_id ?? null;

            if ($orderId) {
                Order::where('id', $orderId)->update([
                    'status'     => 'cancelado',
                    'updated_at' => now(),
                ]);

                Payment::where('transaction_id', $session->id)->update([
                    'payment_status' => 'expired',
                    'updated_at'     => now(),
                ]);

                Log::info("❌ Sesión expirada — pedido #{$orderId} cancelado");
            }
        }

        return response()->json(['ok' => true]);
    }
}