<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'manufacturer',
        'category_id',
        'active',
        'shipping_price',
        'installation_price',
        'stock_status',
        'has_extra_keys',
        'extra_key_price',
    ];

    protected $casts = [
        'active'            => 'boolean',
        'has_extra_keys'    => 'boolean',
        'shipping_price'    => 'decimal:2',
        'installation_price'=> 'decimal:2',
        'extra_key_price'   => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(Variant::class);
    }
}
