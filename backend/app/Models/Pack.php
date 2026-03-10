<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pack extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'active'
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Items del pack (variantes con cantidad)
     */
    public function items()
    {
        return $this->hasMany(PackItem::class);
    }

    /**
     * Calcular precio total del pack
     */
    public function getTotalPriceAttribute()
    {
        return $this->items->sum(function ($item) {
            return $item->variant->price * $item->quantity;
        });
    }
}