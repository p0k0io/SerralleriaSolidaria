<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductDiscount extends Model
{
    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class);
    }
}
