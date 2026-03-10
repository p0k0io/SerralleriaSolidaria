<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pack extends Model
{
    public function variants()
    {
        return $this->hasMany(PackVariant::class);
    }
}
 