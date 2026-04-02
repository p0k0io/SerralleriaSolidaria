<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AttributeType;

class AttributeValue extends Model
{
    protected $fillable = [
        'attribute_type_id',
        'value'
    ];

    /**
     * Cada valor pertenece a un tipo de atributo
     */
    public function type()
    {
        return $this->belongsTo(AttributeType::class, 'attribute_type_id');
    }
}