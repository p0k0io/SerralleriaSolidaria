<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\AttributeValue;

class AttributeType extends Model
{
    protected $fillable = ['name'];

    /**
     * Un tipo de atributo tiene muchos valores
     */
    public function values()
    {
        return $this->hasMany(AttributeValue::class, 'attribute_type_id');
    }
}