<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Order;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        Log::info("🟡 Checkout iniciado");

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $user = Auth::user();
            Log::info("👤 Usuario recibido:", ['user' => $user]);

            if (!$user) {
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

                if (!isset($item['price'], $item['qty'])) {
                    throw new \Exception("Item inválido");
                }

                $amount = intval($item['price'] * 100);

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
                'user_id'        => $user->id,
                'status'         => 'nuevo',
                'order_tracking' => $tracking,
                'full_name'      => $request->full_name,
                'email'          => $request->email,
                'phone'          => $request->phone,
                'address'        => $request->address,
                'postal_code'    => $request->postal_code,
                'city'           => $request->city,
                'country'        => $request->country,
                'total_amount'   => $total,
            ]);

            Log::info("🧾 Order creada:", ['order_id' => $order->id, 'tracking' => $tracking]);
            Log::info("🌍 FRONT URL:", ['front_url' => config('app.front_url')]);

            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items'           => $line_items,
                'mode'                 => 'payment',
                'client_reference_id'  => $user->id,
                'metadata'             => [
                    'user_id'        => $user->id,
                    'order_id'       => $order->id,
                    'order_tracking' => $tracking,
                ],
                'success_url' => config('app.front_url') . '/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'  => config('app.front_url') . '/carrito',
            ]);

            Log::info("💳 Stripe session creada:", ['session_id' => $session->id]);

            Payment::create([
                'order_id'       => $order->id,
                'provider'       => 'stripe',
                'payment_status' => 'paid',
                'transaction_id' => $session->id,
            ]);

            Log::info("💾 Payment guardado");

            DB::commit();
            Log::info("🟢 Checkout OK");

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

    public function checkSession($id)
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $session = \Stripe\Checkout\Session::retrieve($id);

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
        $secret    = env('STRIPE_WEBHOOK_SECRET');

        \Log::info('📩 Webhook recibido');

        if (!$sigHeader) {
            \Log::error('❌ No Stripe-Signature header');
            return response()->json(['error' => 'no signature'], 400);
        }

        try {
            $event = \Stripe\Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            \Log::error('❌ Webhook inválido', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'invalid signature'], 400);
        }

        \Log::info('✅ Evento válido: ' . $event->type);

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            \Log::info('💳 Pago completado', ['session_id' => $session->id]);
        }

        return response()->json(['ok' => true]);
    }
}