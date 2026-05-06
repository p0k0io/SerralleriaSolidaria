<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderItemController extends Controller
{
    /**
     * Listar items de una order concreta.
     * GET /orders/{order}/items
     */
    public function index(Order $order)
    {
        // Solo el dueño de la order (o admin) puede verlos
        if (Auth::id() !== $order->user_id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $items = $order->items()->with(['variant', 'pack'])->get();

        return response()->json($items);
    }

    /**
     * Ver un item concreto.
     * GET /orders/{order}/items/{item}
     */
    public function show(Order $order, OrderItem $item)
    {
        if ($item->order_id !== $order->id) {
            return response()->json(['error' => 'Item no pertenece a esta order'], 404);
        }

        if (Auth::id() !== $order->user_id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        return response()->json($item->load(['variant', 'pack']));
    }

    /**
     * Actualizar el status de un item (uso interno / admin).
     * PATCH /orders/{order}/items/{item}/status
     */
    public function updateStatus(Request $request, Order $order, OrderItem $item)
    {
        if ($item->order_id !== $order->id) {
            return response()->json(['error' => 'Item no pertenece a esta order'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:pendiente,preparando,enviado,entregado,cancelado',
        ]);

        $item->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Estado actualizado',
            'item'    => $item->fresh(['variant', 'pack']),
        ]);
    }

    /**
     * Actualizar status de TODOS los items de una order a la vez.
     * PATCH /orders/{order}/items/status/bulk
     */
    public function bulkUpdateStatus(Request $request, Order $order)
    {
        if (Auth::id() !== $order->user_id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:pendiente,preparando,enviado,entregado,cancelado',
        ]);

        $order->items()->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Todos los items actualizados',
            'items'   => $order->items()->with(['variant', 'pack'])->get(),
        ]);
    }

    /**
     * Eliminar un item (solo si la order está en estado 'nuevo').
     * DELETE /orders/{order}/items/{item}
     */
    public function destroy(Order $order, OrderItem $item)
    {
        if ($item->order_id !== $order->id) {
            return response()->json(['error' => 'Item no pertenece a esta order'], 404);
        }

        if ($order->status !== 'nuevo') {
            return response()->json(['error' => 'No se puede eliminar un item de una order ya procesada'], 422);
        }

        $item->delete();

        return response()->json(['message' => 'Item eliminado']);
    }
}