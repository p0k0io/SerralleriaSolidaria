<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Obtener carrito
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'error' => 'No autenticado'
            ], 401);
        }

        $cart = Cart::where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($cart);
    }

    /*
    |--------------------------------------------------------------------------
    | Guardar producto en carrito
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        try {

            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'error' => 'No autenticado'
                ], 401);
            }

            $validated = $request->validate([
                'variant_id'   => 'required|integer',
                'sku'          => 'nullable|string',
                'product_name' => 'required|string',
                'price'        => 'required|numeric',
                'qty'          => 'required|integer|min:1',
                'installation_requested' => 'nullable|boolean',
            ]);

            $cartItem = Cart::where('user_id', $user->id)
                ->where('variant_id', $validated['variant_id'])
                ->first();

            if ($cartItem) {

                $cartItem->increment('qty', $validated['qty']);

                if (array_key_exists('installation_requested', $validated)) {
                    $cartItem->update([
                        'installation_requested' => $validated['installation_requested'],
                    ]);
                }

            } else {

                Cart::create([
                    'user_id'     => $user->id,
                    'variant_id'  => $validated['variant_id'],
                    'sku'         => $validated['sku'] ?? null,
                    'product_name' => $validated['product_name'],
                    'price'       => $validated['price'],
                    'qty'         => $validated['qty'],
                    'installation_requested' => $validated['installation_requested'] ?? false,
                ]);

            }

        } catch (\Exception $e) {

            Log::error('Error al guardar en el carrito: ' . $e->getMessage());

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Actualizar cantidad
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $cartItem = Cart::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'qty' => 'required|integer|min:1',
            'installation_requested' => 'nullable|boolean',
        ]);

        $cartItem->update($validated);

        return response()->json([
            'success' => true
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Eliminar item
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $user = Auth::user();

        Cart::where('user_id', $user->id)
            ->where('id', $id)
            ->delete();

        return response()->json([
            'success' => true
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Vaciar carrito
    |--------------------------------------------------------------------------
    */

    public function clear()
    {
        $user = Auth::user();

        Cart::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true
        ]);
    }
}