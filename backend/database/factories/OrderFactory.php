<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->first()?->id
                ?? User::factory()->create()->id,

            'status' => fake()->randomElement([
                'nuevo',
                'en_preparacion',
                'enviado',
                'cancelado',
            ]),

            'order_tracking' => 'TRK-' . strtoupper(fake()->bothify('########')),

            'full_name' => fake()->name(),

            'email' => fake()->safeEmail(),

            'phone' => fake()->phoneNumber(),

            'address' => fake()->streetAddress(),

            'postal_code' => fake()->postcode(),

            'city' => fake()->city(),

            'country' => fake()->country(),

            'total_amount' => 0,
        ];
    }
}