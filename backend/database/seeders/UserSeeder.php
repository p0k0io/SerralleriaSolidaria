<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'admin',
                'password' => '123456', 
                'address' => 'Calle Admin 1',
                'role' => 'admin',
                'username' => "admin",
            ]
        );

        // Usuario normal
        User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'usuario',
                'password' => 'user123',        
                'address' => 'Calle Usuario 2',
                'role' => 'customer',
                'username' => "usercut",
            ]
        );
    }
}