<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeValue extends Model
{
    public function type()
    {
        return $this->belongsTo(AttributeType::class);
    }
}
