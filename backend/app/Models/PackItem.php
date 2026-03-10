<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'pack_id',
        'variant_id',
        'quantity'
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function pack()
    {
        return $this->belongsTo(Pack::class);
    }

    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }
}