<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Variant;

class VariantController extends Controller
{
    // -------------------------------------------------------------------------
    // Helper
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
            'image'        => $variant->image,
            'stock_status' => $variant->stock_status,
            'display'      => ($variant->product->name ?? 'Producto') . ' — SKU: ' . ($variant->sku ?? 'N/A'),
            'product'      => $variant->product ?? null,
            'created_at'   => $variant->created_at,
            'updated_at'   => $variant->updated_at,
        ];
    }

    // -------------------------------------------------------------------------
    // CRUD
    // -------------------------------------------------------------------------

    /**
     * GET /api/variants
     * Soporta filtros via query string:
     *   - search       : SKU o nombre de producto
     *   - active       : 1 | 0
     *   - featured     : 1 | 0
     *   - stock_status : available | out_of_stock | next_batch
     *   - product_id   : integer
     */
    public function index(Request $request)
    {
        $query = Variant::with('product');

        // Búsqueda por SKU o nombre de producto
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhereHas('product', fn($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        // Filtro por activo
        if ($request->has('active') && $request->active !== '') {
            $query->where('active', (bool) $request->active);
        }

        // Filtro por destacado
        if ($request->has('featured') && $request->featured !== '') {
            $query->where('destacado', (bool) $request->featured);
        }

        // Filtro por stock_status
        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }

        // Filtro por producto
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $variants = $query->get()->map(fn($v) => $this->formatVariant($v));

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
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id'   => 'required|exists:products,id',
            'sku'          => 'nullable|string|unique:variants,sku',
            'price'        => 'required|numeric|min:0',
            'active'       => 'boolean',
            'destacado'    => 'boolean',
            'stock_status' => 'nullable|in:available,out_of_stock,next_batch',
            'image'        => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
        ]);

        $path = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('variant_images', 'public');
        }

        $variant = Variant::create([
            'product_id'   => $validated['product_id'],
            'sku'          => $validated['sku'] ?? null,
            'price'        => $validated['price'],
            'active'       => $validated['active'] ?? true,
            'destacado'    => $validated['destacado'] ?? false,
            'stock_status' => $validated['stock_status'] ?? 'available',
            'image'        => $path,
        ]);

        return response()->json([
            'message' => 'Variant created',
            'data'    => $this->formatVariant($variant->load('product')),
        ], 201);
    }

    /**
     * PUT /api/variants/{id}
     */
    public function update(Request $request, $id)
    {
        $variant = Variant::findOrFail($id);

        $validated = $request->validate([
            'sku'          => 'nullable|string|unique:variants,sku,' . $variant->id,
            'price'        => 'sometimes|numeric|min:0',
            'active'       => 'boolean',
            'destacado'    => 'boolean',
            'stock_status' => 'nullable|in:available,out_of_stock,next_batch',
            'image'        => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Eliminar imagen antigua si existe
            if ($variant->image) {
                \Storage::disk('public')->delete($variant->image);
            }
            $validated['image'] = $request->file('image')->store('variant_images', 'public');
        }

        $variant->update($validated);

        return response()->json([
            'message' => 'Variant updated',
            'data'    => $this->formatVariant($variant->fresh('product')),
        ]);
    }

    /**
     * DELETE /api/variants/{id}
     */
    public function destroy($id)
    {
        $variant = Variant::findOrFail($id);

        if ($variant->image) {
            \Storage::disk('public')->delete($variant->image);
        }

        $variant->delete();

        return response()->json(['message' => 'Variant deleted']);
    }

    // -------------------------------------------------------------------------
    // Listados especiales
    // -------------------------------------------------------------------------

    /**
     * GET /api/variants/active
     * Variantes activas con atributos, producto y categoría.
     * Soporta filtros:
     *   - search       : SKU o nombre de producto
     *   - stock_status : available | out_of_stock | next_batch
     *   - featured     : 1 | 0
     */
    public function getActiveVariants(Request $request)
    {
        $query = Variant::with(['product.category', 'attributes.attributeValue.type'])
            ->where('active', true);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhereHas('product', fn($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }

        if ($request->has('featured') && $request->featured !== '') {
            $query->where('destacado', (bool) $request->featured);
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
                ->filter(fn($item) => $item['type'] && $item['value'])
                ->values();

            return $base;
        });

        return response()->json($variants);
    }

    /**
     * GET /api/variants/search
     * Búsqueda rápida de variantes (para autocomplete / filtros de frontend).
     * Query params:
     *   - q            : texto libre (SKU o nombre de producto)
     *   - active       : 1 | 0
     *   - featured     : 1 | 0
     *   - stock_status : available | out_of_stock | next_batch
     *   - product_id   : integer
     */
    public function search(Request $request)
    {
        $query = Variant::with('product');

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($builder) use ($q) {
                $builder->where('sku', 'like', "%{$q}%")
                        ->orWhereHas('product', fn($pq) => $pq->where('name', 'like', "%{$q}%"));
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

        $results = $query->get()->map(fn($v) => $this->formatVariant($v));

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
        $variant = Variant::findOrFail($id);
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
        $variant = Variant::findOrFail($id);
        $variant->destacado = !$variant->destacado;
        $variant->save();

        return response()->json([
            'message'  => 'Featured toggled',
            'featured' => $variant->destacado,
            'data'     => $this->formatVariant($variant->fresh('product')),
        ]);
    }

    // -------------------------------------------------------------------------
    // Cambio de stock
    // -------------------------------------------------------------------------

    /**
     * PATCH /api/variants/{id}/stock
     * Body: { "stock_status": "available" | "out_of_stock" | "next_batch" }
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
