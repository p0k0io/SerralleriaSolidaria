<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttributeType;
use Illuminate\Http\Request;

class AttributeTypeController extends Controller
{
    public function index()
    {
        return AttributeType::with('values')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $type = AttributeType::create([
            'name' => $request->name
        ]);

        return response()->json($type, 201);
    }

    public function show($id)
    {
        return AttributeType::with('values')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $type = AttributeType::findOrFail($id);

        $type->update([
            'name' => $request->name
        ]);

        return response()->json($type);
    }

    public function destroy($id)
    {
        AttributeType::destroy($id);

        return response()->json([
            'message' => 'Attribute type deleted'
        ]);
    }
}