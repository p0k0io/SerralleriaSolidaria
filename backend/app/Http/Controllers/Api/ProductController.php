<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use App\Models\Variant;

class ProductController extends Controller
{
    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Formatea un producto con sus variantes para la respuesta JSON.
     */
    private function formatProduct(Product $product): array
    {
        return [
            'id'                 => $product->id,
            'name'               => $product->name,
            'description'        => $product->description,
            'manufacturer'       => $product->manufacturer,
            'category_id'        => $product->category_id,
            'active'             => $product->active,
            'shipping_price'     => $product->shipping_price,
            'installation_price' => $product->installation_price,
            'stock_status'       => $product->stock_status,
            'has_extra_keys'     => $product->has_extra_keys,
            'extra_key_price'    => $product->extra_key_price,
            'created_at'         => $product->created_at,
            'updated_at'         => $product->updated_at,
            'category'           => $product->category ?? null,
            'variants'           => isset($product->variants)
                ? $product->variants->map(fn($v) => $this->formatVariant($v))
                : [],
        ];
    }

    /**
     * Formatea una variante para la respuesta JSON.
     */
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
            'created_at'   => $variant->created_at,
            'updated_at'   => $variant->updated_at,
        ];
    }

    // -------------------------------------------------------------------------
    // CRUD básico
    // -------------------------------------------------------------------------

    /**
     * GET /api/products
     * Devuelve todos los productos (activos e inactivos) con sus variantes y categoría.
     * Soporta filtros via query string:
     *   - search        : filtra por nombre de producto o SKU de variante
     *   - active        : 1 | 0 | '' (todos)
     *   - stock_status  : available | out_of_stock | next_batch
     *   - category_id   : integer
     *   - has_extra_keys: 1 | 0
     */
    public function index(Request $request)
    {
        $query = Product::with(['variants', 'category']);

        // Búsqueda por nombre o por SKU de variante
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('manufacturer', 'like', "%{$search}%")
                  ->orWhereHas('variants', function ($q2) use ($search) {
                      $q2->where('sku', 'like', "%{$search}%");
                  });
            });
        }

        // Filtro por estado activo/inactivo
        if ($request->has('active') && $request->active !== '') {
            $query->where('active', (bool) $request->active);
        }

        // Filtro por estado de stock
        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }

        // Filtro por categoría
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filtro por llaves extra
        if ($request->has('has_extra_keys') && $request->has_extra_keys !== '') {
            $query->where('has_extra_keys', (bool) $request->has_extra_keys);
        }

        $products = $query->get()->map(fn($p) => $this->formatProduct($p));

        return response()->json($products);
    }

    /**
     * GET /api/products/{id}
     */
    public function show($id)
    {
        $product = Product::with(['variants', 'category'])->findOrFail($id);
        return response()->json($this->formatProduct($product));
    }

    /**
     * POST /api/products
     * Crea un producto sin variantes.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'description'        => 'nullable|string',
            'manufacturer'       => 'nullable|string|max:255',
            'category_id'        => 'required|exists:categories,id',
            'active'             => 'boolean',
            'shipping_price'     => 'nullable|numeric|min:0',
            'installation_price' => 'nullable|numeric|min:0',
            'stock_status'       => 'nullable|in:available,out_of_stock,next_batch',
            'has_extra_keys'     => 'boolean',
            'extra_key_price'    => 'nullable|numeric|min:0|required_if:has_extra_keys,true',
        ]);

        $product = Product::create([
            'name'               => $validated['name'],
            'description'        => $validated['description'] ?? null,
            'manufacturer'       => $validated['manufacturer'] ?? null,
            'category_id'        => $validated['category_id'],
            'active'             => $validated['active'] ?? true,
            'shipping_price'     => $validated['shipping_price'] ?? 0,
            'installation_price' => $validated['installation_price'] ?? 0,
            'stock_status'       => $validated['stock_status'] ?? 'available',
            'has_extra_keys'     => $validated['has_extra_keys'] ?? false,
            'extra_key_price'    => ($validated['has_extra_keys'] ?? false)
                                        ? ($validated['extra_key_price'] ?? null)
                                        : null,
        ]);

        return response()->json([
            'message' => 'Product created',
            'data'    => $this->formatProduct($product->load(['variants', 'category'])),
        ], 201);
    }

    /**
     * PUT /api/products/{id}
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'               => 'sometimes|string|max:255',
            'description'        => 'nullable|string',
            'manufacturer'       => 'nullable|string|max:255',
            'category_id'        => 'sometimes|exists:categories,id',
            'active'             => 'boolean',
            'shipping_price'     => 'nullable|numeric|min:0',
            'installation_price' => 'nullable|numeric|min:0',
            'stock_status'       => 'nullable|in:available,out_of_stock,next_batch',
            'has_extra_keys'     => 'boolean',
            'extra_key_price'    => 'nullable|numeric|min:0',
        ]);

        // Si se desactivan las llaves extra, limpiar el precio
        if (isset($validated['has_extra_keys']) && !$validated['has_extra_keys']) {
            $validated['extra_key_price'] = null;
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated',
            'data'    => $this->formatProduct($product->fresh(['variants', 'category'])),
        ]);
    }

    /**
     * DELETE /api/products/{id}
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }

    // -------------------------------------------------------------------------
    // Activar / Desactivar
    // -------------------------------------------------------------------------

    public function enable($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['active' => true]);

        return response()->json([
            'message' => 'Producto activado',
            'product' => $this->formatProduct($product->fresh(['variants', 'category'])),
        ]);
    }

    public function disable($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['active' => false]);

        return response()->json([
            'message' => 'Producto desactivado',
            'product' => $this->formatProduct($product->fresh(['variants', 'category'])),
        ]);
    }

    // -------------------------------------------------------------------------
    // Crear producto con variantes en una sola petición
    // -------------------------------------------------------------------------

    /**
     * POST /api/products/products-with-variants
     */
    public function storeWithVariants(Request $request)
    {
        $request->validate([
            'name'               => 'required|string|max:255',
            'category_id'        => 'required|integer|exists:categories,id',
            'description'        => 'nullable|string',
            'manufacturer'       => 'nullable|string|max:255',
            'active'             => 'nullable|boolean',
            'shipping_price'     => 'nullable|numeric|min:0',
            'installation_price' => 'nullable|numeric|min:0',
            'stock_status'       => 'nullable|in:available,out_of_stock,next_batch',
            'has_extra_keys'     => 'nullable|boolean',
            'extra_key_price'    => 'nullable|numeric|min:0',

            'variants'                  => 'nullable|array',
            'variants.*.sku'            => 'nullable|string',
            'variants.*.price'          => 'required|numeric|min:0',
            'variants.*.active'         => 'nullable|boolean',
            'variants.*.stock_status'   => 'nullable|in:available,out_of_stock,next_batch',
            'variants.*.image'          => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        DB::beginTransaction();

        try {
            $hasExtraKeys = $request->boolean('has_extra_keys', false);

            $product = Product::create([
                'name'               => $request->name,
                'description'        => $request->description,
                'manufacturer'       => $request->manufacturer,
                'category_id'        => $request->category_id,
                'active'             => $request->boolean('active', true),
                'shipping_price'     => $request->input('shipping_price', 0),
                'installation_price' => $request->input('installation_price', 0),
                'stock_status'       => $request->input('stock_status', 'available'),
                'has_extra_keys'     => $hasExtraKeys,
                'extra_key_price'    => $hasExtraKeys ? $request->input('extra_key_price') : null,
            ]);

            if ($request->has('variants')) {
                foreach ($request->variants as $key => $v) {
                    $imagePath = null;

                    if ($request->hasFile("variants.$key.image")) {
                        $imagePath = $request->file("variants.$key.image")
                            ->store('variant_images', 'public');
                    }

                    Variant::create([
                        'product_id'   => $product->id,
                        'sku'          => $v['sku'] ?? null,
                        'price'        => $v['price'],
                        'active'       => $v['active'] ?? true,
                        'stock_status' => $v['stock_status'] ?? 'available',
                        'image'        => $imagePath,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Producto y variantes creados correctamente',
                'data'    => $this->formatProduct($product->load(['variants', 'category'])),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // -------------------------------------------------------------------------
    // Añadir variante a producto existente
    // -------------------------------------------------------------------------

    /**
     * POST /api/products/{id}/variants
     */
    public function addVariant(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'sku'          => 'nullable|string|unique:variants,sku',
            'price'        => 'required|numeric|min:0',
            'active'       => 'boolean',
            'stock_status' => 'nullable|in:available,out_of_stock,next_batch',
            'image'        => 'nullable|image|max:2048',
        ]);

        $path = $request->hasFile('image')
            ? $request->file('image')->store('variant_images', 'public')
            : null;

        $variant = $product->variants()->create([
            'sku'          => $validated['sku'] ?? null,
            'price'        => $validated['price'],
            'active'       => $validated['active'] ?? true,
            'stock_status' => $validated['stock_status'] ?? 'available',
            'image'        => $path,
        ]);

        return response()->json([
            'message' => 'Variant added',
            'data'    => $this->formatVariant($variant),
        ]);
    }

    // -------------------------------------------------------------------------
    // Endpoints especiales de listado
    // -------------------------------------------------------------------------

    /**
     * GET /api/products/featured
     * Productos que tienen al menos una variante destacada y activa.
     */
    public function featured()
    {
        $products = Product::with(['variants', 'category'])
            ->whereHas('variants', function ($q) {
                $q->where('destacado', true)->where('active', true);
            })
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        return response()->json($products);
    }

    /**
     * GET /api/products/search
     * Búsqueda rápida de productos (para autocomplete / filtros de frontend).
     * Query params:
     *   - q            : texto libre (nombre, fabricante, SKU de variante)
     *   - category_id  : integer
     *   - active       : 1 | 0
     *   - stock_status : available | out_of_stock | next_batch
     */
    public function search(Request $request)
    {
        $query = Product::with(['variants', 'category']);

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($builder) use ($q) {
                $builder->where('name', 'like', "%{$q}%")
                        ->orWhere('manufacturer', 'like', "%{$q}%")
                        ->orWhereHas('variants', fn($vq) => $vq->where('sku', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('active') && $request->active !== '') {
            $query->where('active', (bool) $request->active);
        }

        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }

        $results = $query->get()->map(fn($p) => $this->formatProduct($p));

        return response()->json($results);
    }
}
