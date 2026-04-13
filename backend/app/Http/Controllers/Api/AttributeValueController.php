<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttributeValue;
use Illuminate\Http\Request;

class AttributeValueController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'attribute_type_id' => 'required|exists:attribute_types,id',
            'value' => 'required|string|max:255',
        ]);

        $value = AttributeValue::create([
            'attribute_type_id' => $request->attribute_type_id,
            'value' => $request->value
        ]);

        return response()->json($value, 201);
    }

    public function update(Request $request, $id)
    {
        $value = AttributeValue::findOrFail($id);

        $value->update([
            'value' => $request->value
        ]);

        return response()->json($value);
    }

    public function destroy($id)
    {
        AttributeValue::destroy($id);

        return response()->json([
            'message' => 'Attribute value deleted'
        ]);
    }
}