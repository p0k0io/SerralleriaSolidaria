<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Discount extends Model
{
    public function products()
    {
        return $this->hasMany(ProductDiscount::class);
    }
}
