<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Variant;

class VariantController extends Controller
{
    public function index(Request $request)
    {
        $query = Variant::with('product');

        // Búsqueda por nombre de producto o SKU
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sku', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $variants = $query->get()->map(function ($variant) {
            return [
                'id'      => $variant->id,
                'sku'     => $variant->sku,
                'price'   => $variant->price,
                'active'  => $variant->active,
                'destacado' => $variant->destacado,
                'display' => ($variant->product->name ?? 'Producto') . ' — SKU: ' . $variant->sku,
                'product' => $variant->product,
            ];
        });

        return response()->json($variants);
    }

    public function show($id)
    {
        $variant = Variant::with('product')->findOrFail($id);
        return response()->json($variant);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'sku'        => 'nullable|string|unique:variants,sku',
            'price'      => 'required|numeric|min:0',
            'active'     => 'boolean',
            'destacado'  => 'boolean',
        ]);

        $variant = Variant::create($validated);

        return response()->json([
            'message' => 'Variant created',
            'data'    => $variant,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $variant = Variant::findOrFail($id);

        $validated = $request->validate([
            'sku'    => 'nullable|string|unique:variants,sku,' . $variant->id,
            'price'  => 'sometimes|numeric|min:0',
            'active' => 'boolean',
            'destacado' => 'boolean',
        ]);

        $variant->update($validated);

        return response()->json([
            'message' => 'Variant updated',
            'data'    => $variant,
        ]);
    }

    public function destroy($id)
    {
        $variant = Variant::findOrFail($id);
        $variant->delete();

        return response()->json([
            'message' => 'Variant deleted',
        ]);
    }

    public function getActiveVariants()
    {
        $variants = Variant::with(['product.category', 'attributes.attributeValue.type'])
            ->where('active', true)
            ->get()
            ->map(function ($variant) {
                return [
                    'id'           => $variant->id,
                    'sku'          => $variant->sku,
                    'price'        => $variant->price,
                    'active'       => $variant->active,
                    'destacado'    => $variant->destacado,
                    'product_name' => $variant->product->name,
                    'product'      => $variant->product,
                    'image'        => $variant->image,
                    'attributes'   => $variant->attributes->map(function ($attribute) {
                        return [
                            'type'  => $attribute->attributeValue->type->name ?? null,
                            'value' => $attribute->attributeValue->value ?? null,
                        ];
                    })->filter(function ($item) {
                        return $item['type'] && $item['value'];
                    })->values(),
                ];
            });

        return response()->json($variants);
    }

    public function disable($id)
    {
        $variant = Variant::findOrFail($id);
        $variant->update(['active' => false]);

        return response()->json([
            'message' => 'Variante deshabilitada',
        ]);
    }

    public function enable($id)
    {
        $variant = Variant::findOrFail($id);
        $variant->update(['active' => true]);

        return response()->json([
            'message' => 'Variante activada',
        ]);
    }
}