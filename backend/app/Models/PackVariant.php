<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PackVariant extends Model
{
    public function pack()
    {
        return $this->belongsTo(Pack::class);
    }

    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }
}
