<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'variant_id',
        'sku',
        'product_name',
        'qty',
        'price',
        'installation_requested',
    ];

    protected $casts = [
        'installation_requested' => 'boolean',
    ];
}