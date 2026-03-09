<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin
        User::firstOrCreate([
            'email' => 'admin@example.com',
        ], [
            'username' => 'admin', 
            'password_hash' => Hash::make('admin123'), 
            'role' => 'admin',
        ]);

        // Usuario normal
        User::firstOrCreate([
            'email' => 'user@example.com',
        ], [
            'username' => 'user', 
            'password_hash' => Hash::make('user123'), 
            'role' => 'user',
        ]);
    }
}