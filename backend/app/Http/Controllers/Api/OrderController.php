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
            $orders = Order::with(['user', 'items.variant', 'items.pack', 'payment'])->get();

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
            $order = Order::with(['user', 'items.variant', 'items.pack', 'payment'])->findOrFail($id);
            return response()->json($this->formatOrder($order));
        } catch (\Throwable $e) {
            return response()->json(['error' => 'Pedido no encontrado', 'debug' => $e->getMessage()], 404);
        }
    }

    /**
     * SEGUIMIENTO PÚBLICO — busca por order_tracking (ej: TRK-XXXXXXXX)
     * Ruta pública: GET /api/orders/track/{tracking}
     */
    public function track($tracking)
    {
        // Sanitizar la entrada por si viene con espacios o en minúsculas
        $tracking = strtoupper(trim($tracking));

        $order = Order::with(['items.variant', 'items.pack', 'payment'])
            ->where('order_tracking', $tracking)
            ->first();

        // Si no existe devolvemos 404 manualmente (sin firstOrFail para evitar
        // que el catch genérico lo enmascare como 500)
        if (!$order) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);
        }

        try {
            return response()->json([
                'id'             => $order->id,
                'order_tracking' => $order->order_tracking,
                'full_name'      => $order->full_name ?? '',
                'email'          => $order->email ?? '',
                'status'         => $order->status ?? 'nuevo',
                'total_amount'   => (float) ($order->total_amount ?? 0),
                'created_at'     => $order->created_at,
                'address'        => $order->address ?? '',
                'city'           => $order->city ?? '',
                'country'        => $order->country ?? '',

                'items' => $order->items
                    ? $order->items->map(function ($item) {
                        $name = 'Producto';
                        if ($item->variant && $item->variant->product) {
                            $name = $item->variant->product->name ?? 'Producto';
                        } elseif ($item->pack) {
                            $name = $item->pack->name ?? 'Pack';
                        } elseif ($item->product_name) {
                            $name = $item->product_name;
                        }

                        return [
                            'id'           => $item->id,
                            'product_name' => $name,
                            'quantity'     => $item->quantity ?? 1,
                            'unit_price'   => (float) ($item->price ?? $item->unit_price ?? 0),
                        ];
                    })->values()->toArray()
                    : [],

                'timeline' => $this->buildTimeline($order),
            ]);

        } catch (\Throwable $e) {
            return response()->json(['error' => 'Error interno', 'debug' => $e->getMessage()], 500);
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
                    $order->fresh()->load(['user', 'items.variant', 'items.pack', 'payment'])
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
     * TIMELINE SINTÉTICO
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
            'id'             => $order->id,
            'order_tracking' => $order->order_tracking ?? null,
            'full_name'      => $order->full_name ?? '',
            'email'          => $order->email ?? '',
            'phone'          => $order->phone ?? '',
            'address'        => $order->address ?? '',
            'postal_code'    => $order->postal_code ?? '',
            'city'           => $order->city ?? '',
            'country'        => $order->country ?? '',
            'status'         => $order->status ?? 'nuevo',
            'total_amount'   => (float) ($order->total_amount ?? 0),
            'created_at'     => $order->created_at,
            'updated_at'     => $order->updated_at,

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
                ? $order->items->map(function ($item) {
                    $name = 'Producto';
                    if ($item->variant && $item->variant->product) {
                        $name = $item->variant->product->name ?? 'Producto';
                    } elseif ($item->pack) {
                        $name = $item->pack->name ?? 'Pack';
                    } elseif ($item->product_name) {
                        $name = $item->product_name;
                    }

                    return [
                        'id'           => $item->id,
                        'product_name' => $name,
                        'quantity'     => $item->quantity ?? 1,
                        'unit_price'   => (float) ($item->price ?? $item->unit_price ?? 0),
                        'variant_id'   => $item->variant_id,
                        'pack_id'      => $item->pack_id,
                    ];
                })->values()->toArray()
                : [],
        ];
    }
}