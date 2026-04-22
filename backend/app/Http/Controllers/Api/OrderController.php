<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * LISTADO PARA ADMIN (KANBAN)
     */
    public function index()
    {
        try {
            $orders = Order::with(['user', 'items', 'payment'])->get();

            return response()->json($orders);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ], 500);
        }
    }

    /**
     * DETALLE DE UN PEDIDO
     */
    public function show($id)
    {
        try {
            $order = Order::with(['user', 'items', 'payment'])->findOrFail($id);

            return response()->json($this->formatOrder($order));

        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Pedido no encontrado',
                'debug' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * ACTUALIZAR ESTADO (KANBAN DRAG & DROP)
     */
    public function update(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);

            $validated = $request->validate([
                'status' => 'required|in:nuevo,en_preparacion,empaquetando,listo_envio,enviado,completado,cancelado'
            ]);

            $order->update([
                'status' => $validated['status']
            ]);

            return response()->json([
                'message' => 'Pedido actualizado correctamente',
                'order' => $this->formatOrder(
                    $order->fresh()->load(['user', 'items', 'payment'])
                )
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Error actualizando pedido',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ELIMINAR PEDIDO
     */
    public function destroy($id)
    {
        try {
            Order::findOrFail($id)->delete();

            return response()->json([
                'message' => 'Pedido eliminado correctamente'
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Error eliminando pedido',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * FORMATEO SEGURO PARA FRONTEND (SIN CRASHES)
     */
    private function formatOrder(Order $order): array
    {
        return [
            'id'           => $order->id,
            'full_name'    => $order->full_name ?? '',
            'email'        => $order->email ?? '',
            'phone'        => $order->phone ?? '',
            'address'      => $order->address ?? '',
            'postal_code'  => $order->postal_code ?? '',
            'city'         => $order->city ?? '',
            'country'      => $order->country ?? '',
            'status'       => $order->status ?? 'nuevo',
            'total_amount' => (float) ($order->total_amount ?? 0),

            'created_at'   => $order->created_at,
            'updated_at'   => $order->updated_at,

            'user' => $order->user ? [
                'id'    => $order->user->id,
                'name'  => $order->user->name,
                'email' => $order->user->email,
            ] : null,

            'payment' => $order->payment ? [
                'provider'       => $order->payment->provider ?? null,
                'payment_status' => $order->payment->payment_status ?? null,
                'transaction_id' => $order->payment->transaction_id ?? null,
            ] : null,

            'items' => $order->items ? $order->items->map(fn ($item) => [
                'id'           => $item->id,
                'product_name' => $item->product_name ?? 'Producto',
                'quantity'     => $item->quantity ?? 1,
                'unit_price'   => (float) ($item->unit_price ?? 0),
                'status'       => $item->status ?? null,
                'variant_id'   => $item->variant_id ?? null,
                'pack_id'      => $item->pack_id ?? null,
            ])->values()->toArray() : [],
        ];
    }
}