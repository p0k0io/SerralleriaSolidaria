<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

use Illuminate\Support\Facades\DB;
use App\Models\Variant;

class ProductController extends Controller
{

    public function index()
    {
        $products = Product::with('variants')->get();
        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with('variants')->findOrFail($id);
        return response()->json($product);
    }

    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'active' => 'boolean'
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created',
            'data' => $product
        ], 201);
    }


    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'active' => 'boolean'
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted'
        ]);
    }


    public function storeWithVariants(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'category_id' => 'required|integer',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string',
            'active' => 'boolean',
            'variants' => 'nullable|array',
            'variants.*.sku' => 'nullable|string',
            'variants.*.price' => 'required|numeric',
            'variants.*.active' => 'boolean'
        ]);

        DB::beginTransaction();

        try {
            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'manufacturer' => $request->manufacturer,
                'category_id' => $request->category_id,
                'active' => $request->active ?? true
            ]);

            if ($request->has('variants')) {
                foreach ($request->variants as $v) {
                    Variant::create([
                        'product_id' => $product->id,
                        'sku' => $v['sku'] ?? null,
                        'price' => $v['price'],
                        'active' => $v['active'] ?? true
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Producto y variantes creados correctamente',
                'data' => $product->load('variants')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function enable($id)
    {
        $product = Product::findOrFail($id);

        // Asegúrate de que la columna en tu tabla sea "active"
        $product->update(['active' => true]);

        return response()->json([
            'message' => 'Producto activado',
            'product' => $product
        ]);
    }

    // Desactivar producto
    public function disable($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['active' => false]);

        return response()->json([
            'message' => 'Producto desactivado',
            'product' => $product
        ]);
    }
}