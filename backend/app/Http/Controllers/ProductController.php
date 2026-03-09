<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

/**
 * @OA\Info(
 *   title="Serralleria Solidaria API",
 *   version="1.0.0",
 *   description="Documentación de la API de Serralleria Solidaria"
 * )
 * @OA\Server(
 *   url="http://localhost",
 *   description="Servidor local"
 * )
 * @OA\Schema(
 *   schema="Product",
 *   type="object",
 *   @OA\Property(property="id", type="integer", example=1),
 *   @OA\Property(property="name", type="string", example="Producto de prueba"),
 *   @OA\Property(property="description", type="string", example="Descripción del producto"),
 *   @OA\Property(property="manufacturer", type="string", example="Fabricante S.A."),
 *   @OA\Property(property="category_id", type="integer", example=1),
 *   @OA\Property(property="active", type="boolean", example=true),
 *   @OA\Property(property="created_at", type="string", format="date-time"),
 *   @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * @OA\Post(
     *   path="/api/products",
     *   summary="Crear un nuevo producto",
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(ref="#/components/schemas/Product")
     *   ),
     *   @OA\Response(
     *     response=201,
     *     description="Producto creado",
     *     @OA\JsonContent(ref="#/components/schemas/Product")
     *   ),
     *   @OA\Response(
     *     response=422,
     *     description="Errores de validación"
     *   )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'manufacturer' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'active' => 'boolean',
        ]);

        $product = Product::create($request->all());

        return response()->json($product, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
