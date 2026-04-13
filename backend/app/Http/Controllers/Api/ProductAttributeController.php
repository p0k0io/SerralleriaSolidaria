<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductAttributeController extends Controller
{
    public function assign(Request $request, $productId)
    {
        $request->validate([
            'attribute_value_ids' => 'required|array',
            'attribute_value_ids.*' => 'exists:attribute_values,id'
        ]);

        $product = Product::findOrFail($productId);

        $product->attributeValues()->sync($request->attribute_value_ids);

        return response()->json([
            'message' => 'Attributes assigned successfully'
        ]);
    }

    public function getAttributes($productId)
    {
        $product = Product::with('attributeValues.attributeType')->findOrFail($productId);

        return response()->json($product->attributeValues);
    }
}