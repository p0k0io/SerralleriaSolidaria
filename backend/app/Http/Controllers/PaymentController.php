<?php

namespace App\Http\Controllers;

use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        Log::info("🟡 Checkout iniciado");

        DB::beginTransaction();

        try {
            Stripe::setApiKey(config('services.stripe.secret'));

            $user = Auth::user();

            Log::info("👤 Usuario recibido:", [
                'user_id' => $user?->id
            ]);

            if (!$user) {
                Log::warning("❌ Usuario NO autenticado");

                return response()->json([
                    'error' => 'No autenticado'
                ], 401);
            }

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

            $cart       = $validated['items'];
            $line_items = [];
            $total      = 0;

            foreach ($cart as $item) {

                if (!isset($item['price'], $item['qty'])) {
                    throw new \Exception("Item inválido");
                }

                $amount   = intval($item['price'] * 100);
                $subtotal = $item['price'] * $item['qty'];

                $line_items[] = [
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => $item['product_name'] ?? 'Producto',
                        ],
                        'unit_amount' => $amount,
                    ],
                    'quantity' => $item['qty'],
                ];

                $total += $subtotal;
            }

            Log::info("💰 Total calculado", [
                'total' => $total
            ]);

            /*
            |--------------------------------------------------------------------------
            | Generar tracking único
            |--------------------------------------------------------------------------
            */

            do {
                $tracking = 'TRK-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
            } while (Order::where('order_tracking', $tracking)->exists());

            /*
            |--------------------------------------------------------------------------
            | Crear Order
            |--------------------------------------------------------------------------
            */

            $order = Order::create([
                'user_id'        => $user->id,
                'status'         => 'pending_payment',
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

            Log::info("🧾 Order creada", [
                'order_id' => $order->id,
                'tracking' => $tracking
            ]);

            /*
            |--------------------------------------------------------------------------
            | Crear Order Items en estado pendiente
            |--------------------------------------------------------------------------
            */

            $orderItems = collect($cart)->map(function ($item) use ($order) {

                return [
                    'order_id'     => $order->id,
                    'variant_id'   => $item['id'] ?? null,
                    'product_name' => $item['product_name'] ?? 'Producto',
                    'quantity'     => $item['qty'],
                    'unit_price'   => $item['price'],
                    'status'       => 'pending',
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];
            })->toArray();

            OrderItem::insert($orderItems);

            Log::info("📦 OrderItems creados");

            /*
            |--------------------------------------------------------------------------
            | Crear sesión Stripe
            |--------------------------------------------------------------------------
            */

            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items'           => $line_items,
                'mode'                 => 'payment',

                'client_reference_id'  => $user->id,

                'metadata' => [
                    'user_id'        => $user->id,
                    'order_id'       => $order->id,
                    'order_tracking' => $tracking,
                ],

                'success_url' => config('app.front_url')
                    . '/success?session_id={CHECKOUT_SESSION_ID}',

                'cancel_url'  => config('app.front_url')
                    . '/payment-cancelled?order_id=' . $order->id,
            ]);

            Log::info("💳 Stripe session creada", [
                'session_id' => $session->id
            ]);

            /*
            |--------------------------------------------------------------------------
            | Crear Payment en pending
            |--------------------------------------------------------------------------
            */

            Payment::create([
                'order_id'       => $order->id,
                'provider'       => 'stripe',
                'payment_status' => 'pending',
                'transaction_id' => $session->id,
            ]);

            DB::commit();

            Log::info("🟢 Checkout creado correctamente");

            return response()->json([
                'url'        => $session->url,
                'order_id'   => $order->id,
                'tracking'   => $tracking,
                'session_id' => $session->id,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {

            DB::rollBack();

            Log::error("❌ Error de validación", [
                'errors' => $e->errors()
            ]);

            return response()->json([
                'error'   => 'Validación fallida',
                'details' => $e->errors()
            ], 422);

        } catch (\Exception $e) {

            DB::rollBack();

            Log::error("💥 ERROR GENERAL: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error'   => 'Error al crear el checkout',
                'message' => $e->getMessage()
            ], 500);
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

    public function stripeWebhook(Request $request)
{
    Stripe::setApiKey(config('services.stripe.secret'));

    $payload = $request->getContent();
    $sigHeader = $request->server('HTTP_STRIPE_SIGNATURE');

    try {

        $event = \Stripe\Webhook::constructEvent(
            $payload,
            $sigHeader,
            config('services.stripe.webhook_secret')
        );

        /*
        |--------------------------------------------------------------------------
        | Pago completado
        |--------------------------------------------------------------------------
        */

        if ($event->type === 'checkout.session.completed') {

            $session = $event->data->object;

            $orderId = $session->metadata->order_id;

            $order = Order::find($orderId);

            if ($order) {

                $order->update([
                    'status' => 'completed'
                ]);

                Payment::where('order_id', $order->id)
                    ->update([
                        'payment_status' => 'paid'
                    ]);

                OrderItem::where('order_id', $order->id)
                    ->update([
                        'status' => 'completed'
                    ]);

                Log::info("✅ Pedido completado", [
                    'order_id' => $order->id
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Pago expirado o cancelado
        |--------------------------------------------------------------------------
        */

        if ($event->type === 'checkout.session.expired') {

            $session = $event->data->object;

            $orderId = $session->metadata->order_id;

            $order = Order::find($orderId);

            if ($order) {

                $order->update([
                    'status' => 'denied'
                ]);

                Payment::where('order_id', $order->id)
                    ->update([
                        'payment_status' => 'denied'
                    ]);

                OrderItem::where('order_id', $order->id)
                    ->update([
                        'status' => 'denied'
                    ]);

                Log::warning("❌ Pedido cancelado/expirado", [
                    'order_id' => $order->id
                ]);
            }
        }

        return response()->json([
            'received' => true
        ]);

    } catch (\Exception $e) {

        Log::error("❌ Webhook error", [
            'message' => $e->getMessage()
        ]);

        return response()->json([
            'error' => $e->getMessage()
        ], 400);
    }
}
}