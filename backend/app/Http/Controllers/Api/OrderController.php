<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * LISTADO PARA ADMIN (KANBAN)
     */
    public function index()
    {
        try {
            $orders = Order::with(['user', 'items', 'payment'])->get();

            return response()->json(
                $orders->map(fn ($order) => $this->formatOrder($order))->values()
            );

        } catch (\Throwable $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line'  => $e->getLine(),
                'file'  => $e->getFile(),
            ], 500);
        }
    }

    /**
     * DETALLE DE UN PEDIDO (admin)
     */
    public function show($id)
    {
        try {
            $order = Order::with(['user', 'items', 'payment'])->findOrFail($id);
            return response()->json($this->formatOrder($order));
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Pedido no encontrado', 'debug' => $e->getMessage()], 404);
        }
    }

    /**
     * SEGUIMIENTO PÚBLICO — el cliente consulta su pedido sin auth
     */
    public function track($id)
    {
        try {
            $order = Order::with(['items', 'payment'])->findOrFail($id);

            return response()->json([
                'id'           => $order->id,
                'full_name'    => $order->full_name ?? '',
                'email'        => $order->email ?? '',
                'status'       => $order->status ?? 'nuevo',
                'total_amount' => (float) ($order->total_amount ?? 0),
                'created_at'   => $order->created_at,
                'address'      => $order->address ?? '',
                'city'         => $order->city ?? '',
                'country'      => $order->country ?? '',

                'items' => $order->items
                    ? $order->items->map(fn ($item) => [
                        'id'           => $item->id,
                        'product_name' => $item->product_name ?? 'Producto',
                        'quantity'     => $item->quantity ?? 1,
                        'unit_price'   => (float) ($item->unit_price ?? 0),
                    ])->values()->toArray()
                    : [],

                'timeline' => $this->buildTimeline($order),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Error interno'], 500);
        }
    }

    /**
     * ACTUALIZAR ESTADO (Kanban drag & drop / modal)
     */
    public function update(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);

            $validated = $request->validate([
                'status' => 'required|in:nuevo,en_preparacion,empaquetando,listo_envio,enviado,completado,cancelado',
            ]);

            $order->update(['status' => $validated['status']]);

            return response()->json([
                'message' => 'Pedido actualizado correctamente',
                'order'   => $this->formatOrder(
                    $order->fresh()->load(['user', 'items', 'payment'])
                ),
            ]);

        } catch (\Throwable $e) {
            return response()->json(['error' => 'Error actualizando pedido', 'debug' => $e->getMessage()], 500);
        }
    }

    /**
     * ELIMINAR PEDIDO
     */
    public function destroy($id)
    {
        try {
            Order::findOrFail($id)->delete();
            return response()->json(['message' => 'Pedido eliminado correctamente']);
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Error eliminando pedido', 'debug' => $e->getMessage()], 500);
        }
    }

    /**
     * TIMELINE SINTÉTICO — genera el historial a partir del estado actual.
     * Cuando tengas tabla de historial real, sustituye esto por la relación.
     */
    private function buildTimeline(Order $order): array
    {
        $statusOrder = ['nuevo', 'en_preparacion', 'empaquetando', 'listo_envio', 'enviado', 'completado'];

        $labels = [
            'nuevo'          => 'Pedido confirmado y pago procesado.',
            'en_preparacion' => 'Nuestro equipo ha comenzado la preparación.',
            'empaquetando'   => 'Tu pedido está siendo embalado.',
            'listo_envio'    => 'Tu pedido está listo para el transportista.',
            'enviado'        => 'Tu pedido está en camino.',
            'completado'     => 'Pedido entregado. ¡Gracias!',
        ];

        $currentIdx = array_search($order->status, $statusOrder);
        if ($currentIdx === false) return [];

        return collect(array_slice($statusOrder, 0, $currentIdx + 1))
            ->map(fn ($s) => [
                'status' => $s,
                'date'   => $order->updated_at->toISOString(),
                'note'   => $labels[$s] ?? '',
            ])
            ->values()
            ->toArray();
    }

    /**
     * FORMATEO SEGURO — normaliza los datos para el frontend admin
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

            'items' => $order->items
                ? $order->items->map(fn ($item) => [
                    'id'           => $item->id,
                    'product_name' => $item->product_name ?? 'Producto',
                    'quantity'     => $item->quantity ?? 1,
                    'unit_price'   => (float) ($item->unit_price ?? 0),
                    'status'       => $item->status ?? null,
                    'variant_id'   => $item->variant_id ?? null,
                    'pack_id'      => $item->pack_id ?? null,
                ])->values()->toArray()
                : [],
        ];
    }
}