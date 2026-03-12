<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Listar todas las categorías
     */
    public function index()
    {
        try {
            $categories = Category::with([
                'parent:id,name',
                'children:id,name,parent_id'
            ])->get(['id', 'name', 'description', 'parent_id']);

            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener categorías',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar una categoría específica
     */
    public function show($id)
    {
        try {
            $category = Category::with([
                'parent:id,name',
                'children:id,name,parent_id',
                'products:id,name,category_id'
            ])->find($id, ['id', 'name', 'description', 'parent_id']);

            if (!$category) {
                return response()->json(['message' => 'Categoría no encontrada'], 404);
            }

            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la categoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear categoría
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id'),
            ],
        ]);

        try {
            $category = Category::create($validated);
            return response()->json($category, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear la categoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar categoría
     */
    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Categoría no encontrada'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->whereNot('id', $id),
            ],
        ]);

        try {
            $category->update($validated);
            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la categoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar categoría
     */
    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Categoría no encontrada'], 404);
        }

        try {
            $category->delete();
            return response()->json(['message' => 'Categoría eliminada correctamente']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar la categoría',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}