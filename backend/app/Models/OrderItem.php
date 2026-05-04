<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Order;
use App\Models\Variant;
use App\Models\Pack;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'variant_id',
        'pack_id',
        'quantity',
        'price'
    ];

    protected $with = ['variant', 'pack']; 

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function variant()
    {
        return $this->belongsTo(Variant::class);
    }

    public function pack()
    {
        return $this->belongsTo(Pack::class);
    }
}