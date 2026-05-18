<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Variant;
use App\Models\Pack;

class VariantController extends Controller
{
    // -------------------------------------------------------------------------
    // Helper — formatear variante para el frontend
    // -------------------------------------------------------------------------

    private function formatVariant(Variant $variant): array
    {
        return [
            'id'           => $variant->id,
            'product_id'   => $variant->product_id,
            'sku'          => $variant->sku,
            'price'        => $variant->price,
            'active'       => $variant->active,
            'featured'     => $variant->destacado,
<<<<<<< Updated upstream
            'image'        => $variant->image,
            'image_url' => $variant->image_url,
=======
            'image'        => $variant->image,          // ruta relativa (para uso interno)
            'image_url'    => $variant->image_url,      // URL absoluta lista para <img>
>>>>>>> Stashed changes
            'stock_status' => $variant->stock_status,
            'display'      => ($variant->product->name ?? 'Producto') . ' — SKU: ' . ($variant->sku ?? 'N/A'),
            'product'      => $variant->product ?? null,
            'created_at'   => $variant->created_at,
            'updated_at'   => $variant->updated_at,
        ];
    }

    private function formatPackAsVariant(Pack $pack): array
    {
        $totalPrice = $pack->items->reduce(function ($sum, $item) {
            return $sum + ((float) ($item->variant->price ?? 0) * (int) $item->quantity);
        }, 0);

        $outOfStock = $pack->items->contains(function ($item) {
            return ($item->variant->stock_status ?? '') === 'out_of_stock';
        });

        return [
            'id'              => "pack-{$pack->id}",
            'product_id'      => null,
            'sku'             => "PACK-{$pack->id}",
            'price'           => $totalPrice,
            'active'          => $pack->active,
            'featured'        => false,
            'image'           => null,
            'image_url'       => null,
            'stock_status'    => $outOfStock ? 'out_of_stock' : 'available',
            'display'         => $pack->name . ' — Pack',
            'product'         => [
                'name'     => $pack->name,
                'category' => ['name' => 'Packs'],
            ],
            'created_at'      => $pack->created_at,
            'updated_at'      => $pack->updated_at,
            'pack'            => true,
            'pack_description'=> $pack->description,
            'pack_items'      => $pack->items->map(function ($item) {
                return [
                    'variant_id' => $item->variant_id,
                    'quantity'   => $item->quantity,
                    'variant'    => $item->variant ? [
                        'id'           => $item->variant->id,
                        'sku'          => $item->variant->sku,
                        'price'        => $item->variant->price,
                        'image_url'    => $item->variant->image_url,
                        'product'      => $item->variant->product ? [
                            'id'   => $item->variant->product->id,
                            'name' => $item->variant->product->name,
                        ] : null,
                        'stock_status' => $item->variant->stock_status,
                    ] : null,
                ];
            })->toArray(),
            'attributes' => [],
        ];
    }

    // -------------------------------------------------------------------------
    // Helper — guardar imagen subida
    // -------------------------------------------------------------------------

    /**
     * Guarda el archivo en storage/app/public/variant_images
     * y devuelve la ruta relativa (lo que se guarda en BD).
     */
    private function storeImage($file): string
    {
        return $file->store('variant_images', 'public');
    }

    /**
     * Si el campo enhanced_image_url viene en el request (imagen mejorada por IA),
     * la descargamos y la guardamos en storage para tenerla localmente.
     * Así no dependemos de URLs externas que expiren.
     */
    private function downloadAndStoreImage(string $url): ?string
    {
        try {
            $contents = file_get_contents($url);
            if ($contents === false) {
                return null;
            }

            // Inferir extensión desde la URL o usar jpg por defecto
            $ext      = pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
            $filename = 'variant_images/' . uniqid('vi_', true) . '.' . $ext;

            Storage::disk('public')->put($filename, $contents);

            return $filename;
        } catch (\Throwable $e) {
            \Log::warning('VariantController: no se pudo descargar imagen mejorada', [
                'url'   => $url,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    // -------------------------------------------------------------------------
    // CRUD
    // -------------------------------------------------------------------------

    /**
     * GET /api/variants
     */
    public function index(Request $request)
    {
        $query = Variant::with('product');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhereHas('product', fn ($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->has('active') && $request->active !== '') {
            $query->where('active', (bool) $request->active);
        }

        if ($request->has('featured') && $request->featured !== '') {
            $query->where('destacado', (bool) $request->featured);
        }

        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $variants = $query->get()->map(fn ($v) => $this->formatVariant($v));

        return response()->json($variants);
    }

    /**
     * GET /api/variants/{id}
     */
    public function show($id)
    {
        $variant = Variant::with('product')->findOrFail($id);
        return response()->json($this->formatVariant($variant));
    }

    /**
     * POST /api/variants
     *
     * Acepta:
     *   - image              : archivo (multipart)
     *   - enhanced_image_url : URL de imagen mejorada por IA
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id'        => 'required|exists:products,id',
            'sku'               => 'nullable|string|unique:variants,sku',
            'price'             => 'required|numeric|min:0',
            'active'            => 'boolean',
            'destacado'         => 'boolean',
            'stock_status'      => 'nullable|in:available,out_of_stock,next_batch',
            'image'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'enhanced_image_url'=> 'nullable|url',
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $this->storeImage($request->file('image'));
        } elseif ($request->filled('enhanced_image_url')) {
            $imagePath = $this->downloadAndStoreImage($request->enhanced_image_url);
        }

        $variant = Variant::create([
            'product_id'   => $validated['product_id'],
            'sku'          => $validated['sku'] ?? null,
            'price'        => $validated['price'],
            'active'       => $validated['active'] ?? true,
            'destacado'    => $validated['destacado'] ?? false,
            'stock_status' => $validated['stock_status'] ?? 'available',
            'image'        => $imagePath,
        ]);

        return response()->json([
            'message' => 'Variant created',
            'data'    => $this->formatVariant($variant->load('product')),
        ], 201);
    }

    /**
     * PUT /api/variants/{id}
     *
     * Si viene una nueva imagen (archivo o URL mejorada), elimina la anterior.
     *
     * IMPORTANTE: Laravel no parsea multipart en PUT/PATCH.
     * El frontend debe enviar POST con _method=PUT (method spoofing)
     * o usar PATCH con FormData. En esta implementación aceptamos ambos.
     */
    public function update(Request $request, $id)
    {
        $variant = Variant::findOrFail($id);

        $validated = $request->validate([
            'sku'               => 'nullable|string|unique:variants,sku,' . $variant->id,
            'price'             => 'sometimes|numeric|min:0',
            'active'            => 'boolean',
            'destacado'         => 'boolean',
            'stock_status'      => 'nullable|in:available,out_of_stock,next_batch',
            'image'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'enhanced_image_url'=> 'nullable|url',
        ]);

        $newImagePath = null;

        if ($request->hasFile('image')) {
            // Eliminar imagen anterior antes de guardar la nueva
            $variant->deleteImage();
            $newImagePath = $this->storeImage($request->file('image'));
            $validated['image'] = $newImagePath;

        } elseif ($request->filled('enhanced_image_url')) {
            $variant->deleteImage();
            $newImagePath = $this->downloadAndStoreImage($request->enhanced_image_url);
            $validated['image'] = $newImagePath;
        }

        // Limpiar campos no permitidos en fillable antes de update
        unset($validated['enhanced_image_url']);

        $variant->update($validated);

        return response()->json([
            'message' => 'Variant updated',
            'data'    => $this->formatVariant($variant->fresh('product')),
        ]);
    }

    /**
     * DELETE /api/variants/{id}
     * Elimina también la imagen del disco.
     */
    public function destroy($id)
    {
        $variant = Variant::findOrFail($id);
        $variant->deleteImage();
        $variant->delete();

        return response()->json(['message' => 'Variant deleted']);
    }

    // -------------------------------------------------------------------------
    // Listados especiales
    // -------------------------------------------------------------------------

    /**
     * GET /api/variants/active
     */
    public function getActiveVariants(Request $request)
    {
        $query = Variant::with(['product.category', 'attributes.attributeValue.type'])
            ->where('active', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhereHas('product', fn ($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }

        if ($request->has('featured') && $request->featured !== '') {
            $query->where('destacado', (bool) $request->featured);
        }

        $packs = collect();
        if (!($request->has('featured') && $request->featured !== '' && (bool) $request->featured)) {
            $packQuery = Pack::with(['items.variant.product'])
                ->where('active', true);

            if ($request->filled('search')) {
                $search = $request->search;
                $packQuery->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->filled('stock_status')) {
                if ($request->stock_status === 'available') {
                    $packQuery->whereDoesntHave('items.variant', fn ($q) => $q->where('stock_status', 'out_of_stock'));
                } elseif ($request->stock_status === 'out_of_stock') {
                    $packQuery->whereHas('items.variant', fn ($q) => $q->where('stock_status', 'out_of_stock'));
                }
            }

            $packs = $packQuery->get()->map(fn ($pack) => $this->formatPackAsVariant($pack));
        }

        $variants = $query->get()->map(function ($variant) {
            $base = $this->formatVariant($variant);

            $base['attributes'] = $variant->attributes
                ->map(function ($attribute) {
                    return [
                        'type'  => $attribute->attributeValue->type->name ?? null,
                        'value' => $attribute->attributeValue->value ?? null,
                    ];
                })
                ->filter(fn ($item) => $item['type'] && $item['value'])
                ->values();

            return $base;
        });

        if ($packs->isNotEmpty()) {
            $variants = $variants->concat($packs);
        }

        return response()->json($variants);
    }

    /**
     * GET /api/variants/search
     */
    public function search(Request $request)
    {
        $query = Variant::with('product');

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($builder) use ($q) {
                $builder->where('sku', 'like', "%{$q}%")
                        ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$q}%"));
            });
        }

        if ($request->has('active') && $request->active !== '') {
            $query->where('active', (bool) $request->active);
        }

        if ($request->has('featured') && $request->featured !== '') {
            $query->where('destacado', (bool) $request->featured);
        }

        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $results = $query->get()->map(fn ($v) => $this->formatVariant($v));

        return response()->json($results);
    }

    // -------------------------------------------------------------------------
    // Activar / Desactivar
    // -------------------------------------------------------------------------

    public function enable($id)
    {
        $variant = Variant::findOrFail($id);
        $variant->update(['active' => true]);

        return response()->json([
            'message' => 'Variante activada',
            'data'    => $this->formatVariant($variant->fresh('product')),
        ]);
    }

    public function disable($id)
    {
        $variant = Variant::findOrFail($id);
        $variant->update(['active' => false]);

        return response()->json([
            'message' => 'Variante deshabilitada',
            'data'    => $this->formatVariant($variant->fresh('product')),
        ]);
    }

    // -------------------------------------------------------------------------
    // Toggles
    // -------------------------------------------------------------------------

    public function toggleActive($id)
    {
        $variant         = Variant::findOrFail($id);
        $variant->active = !$variant->active;
        $variant->save();

        return response()->json([
            'message' => 'Variant toggled',
            'active'  => $variant->active,
            'data'    => $this->formatVariant($variant->fresh('product')),
        ]);
    }

    public function toggleFeatured($id)
    {
        $variant           = Variant::findOrFail($id);
        $variant->destacado = !$variant->destacado;
        $variant->save();

        return response()->json([
            'message'  => 'Featured toggled',
            'featured' => $variant->destacado,
            'data'     => $this->formatVariant($variant->fresh('product')),
        ]);
    }

    // -------------------------------------------------------------------------
    // Stock
    // -------------------------------------------------------------------------

    /**
     * PATCH /api/variants/{id}/stock
     */
    public function updateStock(Request $request, $id)
    {
        $variant = Variant::findOrFail($id);

        $validated = $request->validate([
            'stock_status' => 'required|in:available,out_of_stock,next_batch',
        ]);

        $variant->update(['stock_status' => $validated['stock_status']]);

        return response()->json([
            'message'      => 'Stock actualizado',
            'stock_status' => $variant->stock_status,
            'data'         => $this->formatVariant($variant->fresh('product')),
        ]);
    }
}