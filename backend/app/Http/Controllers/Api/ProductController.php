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
            'active' => 'nullable|boolean',

            'variants' => 'nullable|array',

            'variants.*.sku' => 'nullable|string',
            'variants.*.price' => 'required|numeric',
            'variants.*.active' => 'nullable|boolean',
            'variants.*.image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
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

            // Crear las variantes
            if ($request->has('variants')) {
                foreach ($request->variants as $key => $v) {
                    $imagePath = null;

                    // Subir la imagen si existe
                    if ($request->hasFile("variants.$key.image")) {
                        $imagePath = $request->file("variants.$key.image")->store('variant_images', 'public');
                    }

                    Variant::create([
                        'product_id' => $product->id,
                        'sku' => $v['sku'] ?? null,
                        'price' => $v['price'],
                        'active' => $v['active'] ?? true,
                        'image' => $imagePath
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

/**
 * @OA\Post(
 *     path="/api/products-with-variants",
 *     summary="Crear producto con variantes",
 *     tags={"Products"},
 *     @OA\RequestBody(
 *         required=true,
 *         @OA\MediaType(
 *             mediaType="multipart/form-data",
 *             @OA\Schema(
 *                 required={"name","category_id"},
 *                 @OA\Property(property="name", type="string", example="Camiseta"),
 *                 @OA\Property(property="description", type="string", example="Camiseta deportiva"),
 *                 @OA\Property(property="manufacturer", type="string", example="Nike"),
 *                 @OA\Property(property="category_id", type="integer", example=1),
 *                 @OA\Property(property="active", type="boolean", example=true),
 *                 
 *                 @OA\Property(
 *                     property="variants",
 *                     type="array",
 *                     @OA\Items(
 *                         @OA\Property(property="sku", type="string", example="TSHIRT-RED-M"),
 *                         @OA\Property(property="price", type="number", format="float", example=19.99),
 *                         @OA\Property(property="active", type="boolean", example=true),
 *                         @OA\Property(
 *                             property="image",
 *                             type="string",
 *                             format="binary"
 *                         )
 *                     )
 *                 )
 *             )
 *         )
 *     ),
 *     @OA\Response(
 *         response=201,
 *         description="Producto y variantes creados correctamente"
 *     ),
 *     @OA\Response(
 *         response=500,
 *         description="Error del servidor"
 *     )
 * )
 */




    
}