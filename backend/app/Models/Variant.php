<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Variant extends Model
{
    protected $fillable = ['product_id', 'sku', 'price', 'active', 'image', 'destacado', 'stock_status'];
    
    protected $casts = [
        'destacado' => 'boolean',
        'stock_status' => 'string',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attributes()
    {
        return $this->hasMany(VariantAttribute::class);
    }

    public function discounts()
    {
        return $this->hasMany(ProductDiscount::class);
    }
}
