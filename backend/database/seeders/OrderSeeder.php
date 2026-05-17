<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Variant;
use App\Models\User;

class OrderSeeder extends Seeder
{
    public function run()
    {
        // Obtener un usuario existente
        $user = User::first();

        // Obtener algunas variantes
        $variants = Variant::take(3)->get();

        // Crear una orden completada
        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'completed',
            'full_name' => 'Cliente de Prueba',
            'email' => 'cliente@test.com',
            'phone' => '123456789',
            'address' => 'Dirección de Prueba',
            'postal_code' => '08000',
            'city' => 'Barcelona',
            'country' => 'Spain',
            'order_tracking' => 'ORD-TEST-001',
            'total_amount' => 0, // Se calculará después
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $total = 0;
        foreach ($variants as $variant) {
            $quantity = rand(1, 5);
            $unitPrice = $variant->price;
            OrderItem::create([
                'order_id' => $order->id,
                'variant_id' => $variant->id,
                'product_name' => $variant->product->name ?? 'Producto',
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'status' => 'completed',
                'installation_requested' => rand(0, 1) === 1,
            ]);
            $total += $quantity * $unitPrice;
        }

        // Actualizar el total
        $order->update(['total_amount' => $total]);
    }
}