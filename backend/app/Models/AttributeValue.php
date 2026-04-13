<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributeValue extends Model
{
    protected $fillable = ['attribute_type_id', 'value'];

    public function type()
    {
        return $this->belongsTo(AttributeType::class, 'attribute_type_id');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_attribute_values');
    }
}