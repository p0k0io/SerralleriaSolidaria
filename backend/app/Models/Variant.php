<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Variant extends Model
{
    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'active',
        'image',
        'destacado',
        'stock_status',
    ];

    protected $casts = [
        'active'       => 'boolean',
        'destacado'    => 'boolean',
        'stock_status' => 'string',
    ];

    protected $appends = ['image_url'];

    /*
    |--------------------------------------------------------------------------
    | ACCESSOR — image_url
    |--------------------------------------------------------------------------
    | Devuelve siempre una URL absoluta lista para el frontend.
    | Si la imagen ya es una URL completa (enhanced por IA), la devuelve tal cual.
    | Si es una ruta relativa guardada en storage, construye la URL pública.
    | Si no hay imagen, devuelve null.
    |--------------------------------------------------------------------------
    */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        // Si ya es una URL completa (http/https), devolverla tal cual
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        // Ruta relativa guardada en storage/app/public
        return Storage::disk('public')->url($this->image);
    }

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attributes()
    {
        return $this->hasMany(VariantAttribute::class);
    }

    public function discounts()
    {
        return $this->hasMany(ProductDiscount::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helper — eliminar imagen del disco
    |--------------------------------------------------------------------------
    | Llámalo antes de cambiar o borrar la variante.
    | Solo actúa si la imagen es una ruta local (no URL externa de IA).
    |--------------------------------------------------------------------------
    */
    public function deleteImage(): void
    {
        if ($this->image && !str_starts_with($this->image, 'http')) {
            Storage::disk('public')->delete($this->image);
        }
    }
}