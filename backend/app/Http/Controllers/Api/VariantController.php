<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Variant;

class VariantController extends Controller
{
    public function index()
    {
        $variants = Variant::with('product')->get();
        return response()->json($variants);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'sku' => 'nullable|string|unique:variants,sku',
            'price' => 'required|numeric|min:0',
            'active' => 'boolean'
        ]);

        $variant = Variant::create($validated);

        return response()->json([
            'message' => 'Variant created',
            'data' => $variant
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $variant = Variant::findOrFail($id);

        $validated = $request->validate([
            'sku' => 'nullable|string|unique:variants,sku,' . $variant->id,
            'price' => 'sometimes|numeric|min:0',
            'active' => 'boolean'
        ]);

        $variant->update($validated);

        return response()->json([
            'message' => 'Variant updated',
            'data' => $variant
        ]);
    }

    public function destroy($id)
    {
        $variant = Variant::findOrFail($id);
        $variant->delete();

        return response()->json([
            'message' => 'Variant deleted'
        ]);
    }

    public function disable($id)
    {
        $variant = Variant::findOrFail($id);
        $variant->update(['active' => false]);

        return response()->json([
            'message' => 'Variante deshabilitada'
        ]);
    }

    public function enable($id)
    {
        $variant = Variant::findOrFail($id);
        $variant ->update(['active' => true]);

        return response()->json([
            'message' => 'Variante activada'
        ]);
    }
}