<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    public function zones()
    {
        return $this->hasMany(ServiceZone::class);
    }
}
