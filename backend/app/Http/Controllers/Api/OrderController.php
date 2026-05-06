<?php

namespace App\Http\Controllers\Api;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;


class OrderController extends Controller
{
    /**
     * GET /api/orders/prepared
     * Obtiene las órdenes preparadas para enviar con todos sus items y servicios
     */
    public function getPreparedOrders()
    {
        $orders = Order::where('status', 'listo_envio')
            ->with([
                'items.variant.product',
                'items.pack',
                'services.service'
            ])
            ->get();

        return response()->json($orders->map(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => 'PED-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                'client' => $order->full_name ?? 'Cliente',
                'email' => $order->email,
                'phone' => $order->phone,
                'city' => $order->city,
                'total_amount' => $order->total_amount,
                'items_count' => $order->items->count(),
                'services_count' => $order->services->count(),
                'items' => $order->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'variant' => $item->variant ? [
                            'id' => $item->variant->id,
                            'sku' => $item->variant->sku,
                            'product_name' => $item->variant->product->name ?? 'Producto',
                            'image' => $item->variant->image,
                        ] : null,
                        'pack' => $item->pack ? [
                            'id' => $item->pack->id,
                            'name' => $item->pack->name,
                        ] : null,
                    ];
                })->all(),
                'services' => $order->services->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'service_name' => $service->service->name ?? 'Servicio',
                        'price' => $service->price,
                    ];
                })->all(),
                'created_at' => $order->created_at,
            ];
        }));
    }

    // ─── LISTADO ADMIN (Kanban) ──────────────────────────────────────────────

    public function index(): JsonResponse
    {
        try {
            $orders = Order::with(['user', 'items.variant.product', 'items.pack', 'payment'])
                ->latest()
                ->get()
                ->map(fn ($order) => $this->formatOrder($order))
                ->values();

            return response()->json($orders);

        } catch (\Throwable $e) {
            return $this->serverError($e);
        }
    }

    // ─── DETALLE ADMIN ───────────────────────────────────────────────────────

    public function show(int $id): JsonResponse
    {
        try {
            $order = Order::with([
                'user',
                'items.variant.product',
                'items.pack',
                'services.service',
                'payment',
            ])->findOrFail($id);

            return response()->json($this->formatOrder($order));

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);

        } catch (\Throwable $e) {
            return $this->serverError($e);
        }
    }

    // ─── TRACKING PÚBLICO — GET /api/orders/track/{tracking} ─────────────────

    public function track(string $tracking): JsonResponse
    {
        $tracking = strtoupper(trim($tracking));

        $order = Order::with(['items.variant.product', 'items.pack'])
            ->where('order_tracking', $tracking)
            ->first();

        if (! $order) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);
        }

        try {
            return response()->json([
                'id'             => $order->id,
                'order_tracking' => $order->order_tracking,
                'status'         => $order->status ?? 'nuevo',
                'total_amount'   => (float) ($order->total_amount ?? 0),
                'created_at'     => $order->created_at,
                'address'        => $order->address ?? '',
                'city'           => $order->city ?? '',
                'country'        => $order->country ?? '',
                'items'          => $this->formatItems($order->items),
                'timeline'       => $this->buildTimeline($order),
            ]);

        } catch (\Throwable $e) {
            return $this->serverError($e);
        }
    }

    // ─── PEDIDOS DEL USUARIO AUTENTICADO — GET /api/orders/my ───────────────
    // Nueva ruta necesaria para OrdersPage.jsx

    public function myOrders(Request $request): JsonResponse
    {
        try {
            $orders = Order::with(['items'])
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get()
                ->map(fn ($order) => [
                    'id'             => $order->id,
                    'order_tracking' => $order->order_tracking ?? null,
                    'full_name'      => $order->full_name ?? '',
                    'status'         => $order->status ?? 'nuevo',
                    'total_amount'   => (float) ($order->total_amount ?? 0),
                    'created_at'     => $order->created_at,
                    'items_count'    => $order->items?->count() ?? 0,
                ])
                ->values();

            return response()->json($orders);

        } catch (\Throwable $e) {
            return $this->serverError($e);
        }
    }

    // ─── ACTUALIZAR ESTADO (Kanban) ──────────────────────────────────────────

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $order = Order::findOrFail($id);

            $validated = $request->validate([
                'status' => 'required|in:nuevo,en_preparacion,empaquetando,listo_envio,enviado,completado,cancelado',
            ]);

            $order->update(['status' => $validated['status'],]);

            return response()->json([
                'message' => 'Pedido actualizado correctamente',
                'order'   => $this->formatOrder(
                    $order->fresh()->load(['user', 'items.variant.product', 'items.pack', 'services.service.variant.product', 'items.pack', 'payment'])
                ),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Estado no válido', 'details' => $e->errors()], 422);

        } catch (\Throwable $e) {
            return response()->json(['error' => 'Error actualizando pedido', 'debug' => $e->getMessage(),], 500);
        }
    }

    // ─── ELIMINAR ────────────────────────────────────────────────────────────

    public function destroy(int $id): JsonResponse
    {
        try {
            Order::findOrFail($id)->delete();
            return response()->json(['message' => 'Pedido eliminado correctamente',]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return response()->json(['error' => 'Pedido no encontrado'], 404);

        } catch (\Throwable $e) {
            return response()->json(['error' => 'Error eliminando pedido', 'debug' => $e->getMessage(),], 500);
        }
    }

    // ─── PRIVADOS ────────────────────────────────────────────────────────────

    // ─── PRIVADOS ────────────────────────────────────────────────────────────

    /**
     * Timeline sintético basado en el estado actual del pedido.
     * Todos los pasos anteriores (incluyendo el actual) se muestran con
     * updated_at como fecha, que es lo más aproximado disponible sin una
     * tabla de historial dedicada.
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
        if ($currentIdx === false) {
            return [];
        }

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
     * Formatea los items resolviendo el nombre desde variant→product o pack.
     */
    private function formatItems($items): array
    {
        if (! $items) {
            return [];
        }

        return $items->map(function ($item) {
            $name = match (true) {
                $item->variant?->product !== null => $item->variant->product->name ?? 'Producto',
                $item->pack !== null             => $item->pack->name ?? 'Pack',
                (bool) $item->product_name       => $item->product_name,
                default                          => 'Producto',
            };

            return [
                'id'           => $item->id,
                'product_name' => $name,
                'quantity'     => $item->quantity ?? 1,
                'unit_price'   => (float) ($item->price ?? $item->unit_price ?? 0),
            ];
        })
        ->values()
        ->toArray();
    }

    /**
     * Normaliza todos los campos de un pedido para el panel admin.
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
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
            ] : null,
            'payment' => $order->payment ? [
                'provider' => $order->payment->provider ?? null,
                'payment_status' => $order->payment->payment_status ?? null,
                'transaction_id' => $order->payment->transaction_id ?? null,
            ] : null,

            'items' => $this->formatItems($order->items),
        ];
    }

    /**
     * Respuesta de error 500 estandarizada.
     * En producción no expone debug; en local sí.
     */
    private function serverError(\Throwable $e): JsonResponse
    {
        $body = ['error' => 'Error interno del servidor'];

        if (config('app.debug')) {
            $body['debug']   = $e->getMessage();
            $body['file']    = $e->getFile();
            $body['line']    = $e->getLine();
        }

        return response()->json($body, 500);
    }
}
