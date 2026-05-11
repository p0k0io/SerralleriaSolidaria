<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        Order::factory(50)
            ->create()
            ->each(function ($order) {

                $total = 0;

                $itemsCount = rand(1, 5);

                for ($i = 0; $i < $itemsCount; $i++) {

                    $price = fake()->randomFloat(2, 5, 120);
                    $qty   = rand(1, 3);

                    OrderItem::create([
                        'order_id'    => $order->id,

                        // si tienes variantes reales puedes usar:
                        // 'variant_id' => Variant::inRandomOrder()->first()?->id,

                        'product_name' => fake()->words(3, true),

                        'quantity'    => $qty,

                        // IMPORTANTE:
                        // guardar precio UNITARIO
                        'unit_price'  => $price,

                        'status'      => match ($order->status) {
                            'cancelado' => 'cancelado',
                            'nuevo'     => 'pendiente',
                            default     => 'preparando',
                        },
                    ]);

                    // total = unit_price × quantity
                    $total += ($price * $qty);
                }

                // actualizar total del pedido
                $order->update([
                    'total_amount' => $total
                ]);

                // crear payment asociado
                Payment::create([
                    'order_id' => $order->id,

                    'provider' => 'stripe',

                    'payment_status' => match ($order->status) {
                        'cancelado' => 'expired',
                        'nuevo'     => 'pending',
                        default     => 'paid',
                    },

                    'transaction_id' => 'pi_' . strtoupper(fake()->bothify('############')),
                ]);
            });
    }
}