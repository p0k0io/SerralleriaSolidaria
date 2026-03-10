<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pack;
use App\Models\PackItem;
use App\Models\Variant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PackController extends Controller
{
    /**
     * Listar todos los packs (con sus items y variantes)
     */
    public function index()
    {
        $packs = Pack::with('items.variant.product')->get();
        return response()->json($packs);
    }

    /**
     * Crear un nuevo pack con sus items
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'boolean',
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:variants,id',
            'items.*.quantity' => 'required|integer|min:1'
        ]);

        // Verificar que no haya variant_id duplicados
        $variantIds = collect($request->items)->pluck('variant_id');
        if ($variantIds->count() !== $variantIds->unique()->count()) {
            throw ValidationException::withMessages([
                'items' => 'No puedes incluir la misma variante más de una vez en el pack.'
            ]);
        }

        try {
            DB::beginTransaction();

            // Crear el pack
            $pack = Pack::create([
                'name' => $request->name,
                'description' => $request->description,
                'active' => $request->active ?? true
            ]);

            // Crear los items del pack
            foreach ($request->items as $item) {
                PackItem::create([
                    'pack_id' => $pack->id,
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity']
                ]);
            }

            DB::commit();

            // Cargar relaciones para la respuesta
            $pack->load('items.variant.product');

            return response()->json($pack, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al crear el pack',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un pack específico
     */
    public function show(string $id)
    {
        $pack = Pack::with('items.variant.product')->find($id);
        
        if (!$pack) {
            return response()->json(['error' => 'Pack no encontrado'], 404);
        }

        return response()->json($pack);
    }

    /**
     * Actualizar un pack (reemplaza todos los items)
     */
    public function update(Request $request, string $id)
    {
        $pack = Pack::find($id);
        
        if (!$pack) {
            return response()->json(['error' => 'Pack no encontrado'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'active' => 'boolean',
            'items' => 'sometimes|array|min:1',
            'items.*.variant_id' => 'required_with:items|exists:variants,id',
            'items.*.quantity' => 'required_with:items|integer|min:1'
        ]);

        if ($request->has('items')) {
            $variantIds = collect($request->items)->pluck('variant_id');
            if ($variantIds->count() !== $variantIds->unique()->count()) {
                throw ValidationException::withMessages([
                    'items' => 'No puedes incluir la misma variante más de una vez en el pack.'
                ]);
            }
        }

        try {
            DB::beginTransaction();

            // Actualizar datos del pack
            $pack->update($request->only(['name', 'description', 'active']));

            // Si se enviaron items, reemplazar todos
            if ($request->has('items')) {
                // Eliminar items actuales
                $pack->items()->delete();

                // Crear los nuevos
                foreach ($request->items as $item) {
                    PackItem::create([
                        'pack_id' => $pack->id,
                        'variant_id' => $item['variant_id'],
                        'quantity' => $item['quantity']
                    ]);
                }
            }

            DB::commit();

            $pack->load('items.variant.product');

            return response()->json($pack);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al actualizar el pack',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un pack
     */
    public function destroy(string $id)
    {
        $pack = Pack::find($id);
        
        if (!$pack) {
            return response()->json(['error' => 'Pack no encontrado'], 404);
        }

        $pack->delete();

        return response()->json(null, 204);
    }
}