<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Order;
use App\Models\Payment;

class PaymentController extends Controller
{
    public function checkout(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        // ✅ Usuario autenticado
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // ✅ Validación básica
        $request->validate([
            'items' => 'required|array|min:1',
            'full_name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'address' => 'required|string',
            'postal_code' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
        ]);

        $cart = $request->items;

        $line_items = [];
        $total = 0;

        foreach ($cart as $item) {
            $amount = intval($item['price'] * 100);

            $line_items[] = [
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => [
                        'name' => $item['product_name'],
                    ],
                    'unit_amount' => $amount,
                ],
                'quantity' => $item['qty'],
            ];

            $total += ($item['price'] * $item['qty']);
        }

        DB::beginTransaction();

        try {
            // ✅ 1. Crear ORDEN
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'full_name' => $request->full_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'postal_code' => $request->postal_code,
                'city' => $request->city,
                'country' => $request->country,
                'total_amount' => $total,
            ]);

            // ✅ 2. Crear sesión Stripe
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => $line_items,
                'mode' => 'payment',

                // 🔥 CLAVE: relacionar todo
                'client_reference_id' => $user->id,

                'metadata' => [
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                ],

                'success_url' => config('app.front_url') . '/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('app.front_url') . '/carrito',
            ]);

            // ✅ 3. Crear registro de PAGO
            Payment::create([
                'order_id' => $order->id,
                'provider' => 'stripe',
                'payment_status' => 'pending',
                'transaction_id' => $session->id,
            ]);

            DB::commit();

            return response()->json([
                'url' => $session->url
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Error al crear el checkout',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function success(Request $request)
    {
        return response()->json([
            'message' => 'Pago iniciado correctamente, pendiente de confirmación'
        ]);
    }
}