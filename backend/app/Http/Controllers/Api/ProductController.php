<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use App\Models\Variant;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    // =========================================================================
    // Helpers
    // =========================================================================

    private function formatProduct(Product $product): array
    {
        return [
            'id'                 => $product->id,
            'name'               => $product->name,
            'description'        => $product->description,
            'manufacturer'       => $product->manufacturer,
            'category_id'        => $product->category_id,
            'active'             => $product->active,
            'shipping_price'     => $product->shipping_price,
            'installation_price' => $product->installation_price,
            'stock_status'       => $product->stock_status,
            'has_extra_keys'     => $product->has_extra_keys,
            'extra_key_price'    => $product->extra_key_price,
            'created_at'         => $product->created_at,
            'updated_at'         => $product->updated_at,
            'category'           => $product->category ?? null,
            'variants'           => isset($product->variants)
                ? $product->variants->map(fn($v) => $this->formatVariant($v))
                : [],
        ];
    }

    private function formatVariant(Variant $variant): array
    {
        return [
            'id'           => $variant->id,
            'product_id'   => $variant->product_id,
            'sku'          => $variant->sku,
            'price'        => $variant->price,
            'active'       => $variant->active,
            'featured'     => $variant->destacado,
            'image'        => $variant->image,
            'stock_status' => $variant->stock_status,
            'created_at'   => $variant->created_at,
            'updated_at'   => $variant->updated_at,
        ];
    }

    // =========================================================================
    // Sube imagen a Imgur (anónimo) y devuelve URL pública directa.
    // Necesita en .env:  IMGUR_CLIENT_ID=xxxxxxxxxxxxxxx
    // Crea app gratis en https://api.imgur.com/oauth2/addclient
    // =========================================================================

    private function uploadToImgur(string $realPath): string
    {
        $response = Http::timeout(60)
            ->withHeaders([
                'Authorization' => 'Client-ID ' . env('IMGUR_CLIENT_ID'),
            ])
            ->post('https://api.imgur.com/3/image', [
                'image' => base64_encode(file_get_contents($realPath)),
                'type'  => 'base64',
            ]);

        $data = $response->json();

        Log::info('[Enhance] Respuesta Imgur', [
            'status_code' => $response->status(),
            'success'     => $data['success'] ?? false,
            'link'        => $data['data']['link'] ?? null,
        ]);

        if (!($data['success'] ?? false) || empty($data['data']['link'])) {
            throw new \Exception('Imgur upload failed: ' . json_encode($data['data'] ?? $data));
        }

        return $data['data']['link'];
    }

    // =========================================================================
    // CRUD básico
    // =========================================================================

    public function index(Request $request)
    {
        $query = Product::with(['variants', 'category']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('manufacturer', 'like', "%{$search}%")
                  ->orWhereHas('variants', function ($q2) use ($search) {
                      $q2->where('sku', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('active') && $request->active !== '') {
            $query->where('active', (bool) $request->active);
        }
        if ($request->filled('stock_status')) {
            $query->where('stock_status', $request->stock_status);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('has_extra_keys') && $request->has_extra_keys !== '') {
            $query->where('has_extra_keys', (bool) $request->has_extra_keys);
        }

        return response()->json(
            $query->get()->map(fn($p) => $this->formatProduct($p))
        );
    }

    public function show($id)
    {
        $product = Product::with(['variants', 'category'])->findOrFail($id);
        return response()->json($this->formatProduct($product));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'               => 'required|string|max:255',
            'description'        => 'nullable|string',
            'manufacturer'       => 'nullable|string|max:255',
            'category_id'        => 'required|exists:categories,id',
            'active'             => 'boolean',
            'shipping_price'     => 'nullable|numeric|min:0',
            'installation_price' => 'nullable|numeric|min:0',
            'stock_status'       => 'nullable|in:available,out_of_stock,next_batch',
            'has_extra_keys'     => 'boolean',
            'extra_key_price'    => 'nullable|numeric|min:0|required_if:has_extra_keys,true',
        ]);

        $product = Product::create([
            'name'               => $validated['name'],
            'description'        => $validated['description'] ?? null,
            'manufacturer'       => $validated['manufacturer'] ?? null,
            'category_id'        => $validated['category_id'],
            'active'             => $validated['active'] ?? true,
            'shipping_price'     => $validated['shipping_price'] ?? 0,
            'installation_price' => $validated['installation_price'] ?? 0,
            'stock_status'       => $validated['stock_status'] ?? 'available',
            'has_extra_keys'     => $validated['has_extra_keys'] ?? false,
            'extra_key_price'    => ($validated['has_extra_keys'] ?? false)
                                        ? ($validated['extra_key_price'] ?? null)
                                        : null,
        ]);

        return response()->json([
            'message' => 'Product created',
            'data'    => $this->formatProduct($product->load(['variants', 'category'])),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        Log::info('--- UPDATE PRODUCT START ---');
        Log::info('Product ID:', ['id' => $id]);
        Log::info('Request data:', $request->all());

        try {
            $validated = $request->validate([
                'name'               => 'sometimes|string|max:255',
                'description'        => 'nullable|string',
                'manufacturer'       => 'nullable|string|max:255',
                'category_id'        => 'sometimes|exists:categories,id',
                'active'             => 'boolean',
                'shipping_price'     => 'nullable|numeric|min:0',
                'installation_price' => 'nullable|numeric|min:0',
                'stock_status'       => 'nullable|in:available,out_of_stock,next_batch',
                'has_extra_keys'     => 'boolean',
                'extra_key_price'    => 'nullable|numeric|min:0',
            ]);

            Log::info('Validated data:', $validated);

        } catch (ValidationException $e) {
            Log::error('Validation failed:', $e->errors());
            return response()->json([
                'message' => 'Validation error',
                'errors'  => $e->errors(),
            ], 422);
        }

        $product = Product::findOrFail($id);

        if (isset($validated['has_extra_keys']) && !$validated['has_extra_keys']) {
            $validated['extra_key_price'] = null;
        }

        $product->update($validated);
        $product->refresh();
        Log::info('--- UPDATE PRODUCT END ---');

        return response()->json([
            'message' => 'Product updated',
            'data'    => $this->formatProduct($product->fresh(['variants', 'category'])),
        ]);
    }

    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    // =========================================================================
    // Activar / Desactivar
    // =========================================================================

    public function enable($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['active' => true]);
        return response()->json([
            'message' => 'Producto activado',
            'product' => $this->formatProduct($product->fresh(['variants', 'category'])),
        ]);
    }

    public function disable($id)
    {
        $product = Product::findOrFail($id);
        $product->update(['active' => false]);
        return response()->json([
            'message' => 'Producto desactivado',
            'product' => $this->formatProduct($product->fresh(['variants', 'category'])),
        ]);
    }

    // =========================================================================
    // Crear producto + variantes
    // =========================================================================

    public function storeWithVariants(Request $request)
    {
        Log::info('--- STORE WITH VARIANTS START ---');
        Log::info('Request fields:', array_keys($request->all()));

        $request->validate([
            'name'                            => 'required|string|max:255',
            'category_id'                     => 'required|integer|exists:categories,id',
            'description'                     => 'nullable|string',
            'manufacturer'                    => 'nullable|string|max:255',
            'active'                          => 'nullable|boolean',
            'shipping_price'                  => 'nullable|numeric|min:0',
            'installation_price'              => 'nullable|numeric|min:0',
            'stock_status'                    => 'nullable|in:available,out_of_stock,next_batch',
            'has_extra_keys'                  => 'nullable|boolean',
            'extra_key_price'                 => 'nullable|numeric|min:0',
            'variants'                        => 'nullable|array',
            'variants.*.sku'                  => 'nullable|string',
            'variants.*.price'                => 'required|numeric|min:0',
            'variants.*.active'               => 'nullable|boolean',
            'variants.*.stock_status'         => 'nullable|in:available,out_of_stock,next_batch',
            'variants.*.image'                => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'variants.*.enhanced_image_url'   => 'nullable|url',
        ]);

        DB::beginTransaction();

        try {
            $hasExtraKeys = $request->boolean('has_extra_keys', false);

            $product = Product::create([
                'name'               => $request->name,
                'description'        => $request->description,
                'manufacturer'       => $request->manufacturer,
                'category_id'        => $request->category_id,
                'active'             => $request->boolean('active', true),
                'shipping_price'     => $request->input('shipping_price', 0),
                'installation_price' => $request->input('installation_price', 0),
                'stock_status'       => $request->input('stock_status', 'available'),
                'has_extra_keys'     => $hasExtraKeys,
                'extra_key_price'    => $hasExtraKeys ? $request->input('extra_key_price') : null,
            ]);

            Log::info('Producto creado ID:', ['id' => $product->id]);

            foreach (($request->variants ?? []) as $key => $v) {
                $imagePath = null;

                $enhancedUrl = $v['enhanced_image_url'] ?? null;
                if ($enhancedUrl) {
                    Log::info("Variante $key: descargando imagen mejorada", ['url' => $enhancedUrl]);
                    try {
                        $contents  = Http::timeout(30)->get($enhancedUrl)->body();
                        $filename  = 'variant_images/' . uniqid('enhanced_', true) . '.jpg';
                        Storage::disk('public')->put($filename, $contents);
                        $imagePath = $filename;
                    } catch (\Exception $e) {
                        Log::warning("Variante $key: fallo descarga imagen mejorada", ['error' => $e->getMessage()]);
                    }
                }

                if (!$imagePath && $request->hasFile("variants.$key.image")) {
                    $imagePath = $request->file("variants.$key.image")
                        ->store('variant_images', 'public');
                }

                $variant = Variant::create([
                    'product_id'   => $product->id,
                    'sku'          => $v['sku'] ?? null,
                    'price'        => $v['price'],
                    'active'       => $v['active'] ?? true,
                    'stock_status' => $v['stock_status'] ?? 'available',
                    'image'        => $imagePath,
                ]);

                Log::info("Variante $key creada", ['id' => $variant->id]);
            }

            DB::commit();
            Log::info('--- STORE WITH VARIANTS OK ---');

            return response()->json([
                'status'  => 'success',
                'message' => 'Producto y variantes creados correctamente',
                'data'    => $this->formatProduct($product->load(['variants', 'category'])),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('--- STORE WITH VARIANTS ERROR ---', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // ENHANCE IMAGE — ModelsLab vía Imgur
    // POST /api/enhance-image
    //
    // Flujo:
    //   1. Recibe archivo imagen (multipart)
    //   2. Sube a Imgur anónimamente → URL pública real (no localhost)
    //   3. Pasa esa URL a ModelsLab image-to-image
    //   4. Polling si status=processing
    //   5. Descarga resultado → storage/public/variant_images/
    //   6. Retorna { enhanced_url }
    //
    // .env requerido:
    //   IMGUR_CLIENT_ID=xxxxxxxxxxxxxxx       (https://api.imgur.com/oauth2/addclient)
    //   MODELSLAB_API_KEY=tu_api_key
    // =========================================================================

    public function enhanceImage(Request $request)
{
    Log::info('=== ENHANCE IMAGE START ===');

    $request->validate([
        'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:8192',
    ]);

    try {
        // ── 1. Guardar imagen en temp con URL pública del túnel ───────────
        $file     = $request->file('image');
        $ext      = $file->getClientOriginalExtension() ?: 'jpg';
        $tempPath = 'temp/' . uniqid('enhance_', true) . '.' . $ext;

        Storage::disk('public')->put($tempPath, file_get_contents($file->getRealPath()));

        // URL pública accesible por ModelsLab (túnel Cloudflare)
        $publicUrl = 'https://pennsylvania-emotions-substance-object.trycloudflare.com' . '/storage/' . $tempPath;

        Log::info('[Enhance] Imagen guardada en temp', [
            'path' => $tempPath,
            'url'  => $publicUrl,
        ]);

        // ── 2. Llamar a ModelsLab igual que el curl que funciona ─────────
        $response = Http::timeout(120)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post('https://modelslab.com/api/v7/images/image-to-image', [
                'key'          => 'XeOjZ9tCqeOULnGmTRcMO76jWOHn8IWBPIBfTmGv1H3boi9Q59Zsi11gErfM',
                'model_id'     => 'gemini-3.1-i2i',
                'prompt'       => 'Transform this image into a clean professional studio product photo while '
                                . 'preserving the exact same object, proportions, composition, camera angle, '
                                . 'perspective, pose, framing, orientation, textures, colors, and all original '
                                . 'details. Replace the background with a pure white seamless background (#FFFFFF) '
                                . 'and apply soft, uniform studio lighting with balanced exposure and minimal '
                                . 'shadows. Improve sharpness, clarity, and overall image quality without changing '
                                . "the product's design or appearance. Keep the image realistic, natural, "
                                . 'high-resolution, and optimized for e-commerce/product listing use. '
                                . 'Do not alter the shape, angle, position, branding, materials, or dimensions '
                                . 'of the object in any way',
                'init_image'   => [$publicUrl],
                'aspect_ratio' => '1:1',
            ]);

        $data = $response->json();

        Log::info('[Enhance] Respuesta ModelsLab inicial', [
            'status_code' => $response->status(),
            'body'        => $data,
        ]);

        if (!$response->successful()) {
            throw new \Exception('ModelsLab HTTP ' . $response->status() . ': ' . ($data['message'] ?? 'sin mensaje'));
        }

        // ── 3. Resultado inmediato o polling ──────────────────────────────
        $enhancedImageUrl = null;

        if (!empty($data['output'][0])) {
            $enhancedImageUrl = $data['output'][0];
            Log::info('[Enhance] Imagen lista de inmediato', ['url' => $enhancedImageUrl]);

        } elseif (($data['status'] ?? '') === 'processing' && !empty($data['fetch_result'])) {
            $fetchUrl  = $data['fetch_result'];
            $maxPolls  = 20;
            $pollDelay = 5;

            Log::info('[Enhance] Polling...', ['fetch_url' => $fetchUrl]);

            for ($i = 1; $i <= $maxPolls; $i++) {
                sleep($pollDelay);

                $pollRes  = Http::timeout(30)
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post($fetchUrl, [
                        'key' => 'XeOjZ9tCqeOULnGmTRcMO76jWOHn8IWBPIBfTmGv1H3boi9Q59Zsi11gErfM',
                    ]);
                $pollData = $pollRes->json();

                Log::info("[Enhance] Poll $i/$maxPolls", [
                    'status' => $pollData['status'] ?? 'unknown',
                    'body'   => $pollData,
                ]);

                if (!empty($pollData['output'][0])) {
                    $enhancedImageUrl = $pollData['output'][0];
                    Log::info("[Enhance] Lista en poll $i", ['url' => $enhancedImageUrl]);
                    break;
                }

                if (($pollData['status'] ?? '') === 'error') {
                    throw new \Exception('ModelsLab polling error: ' . ($pollData['message'] ?? 'sin mensaje'));
                }
            }

            if (!$enhancedImageUrl) {
                throw new \Exception("Timeout: sin imagen tras $maxPolls polls");
            }

        } else {
            throw new \Exception('Respuesta inesperada de ModelsLab: ' . json_encode($data));
        }

        // ── 4. Descargar imagen mejorada y guardar en storage ─────────────
        $contents          = Http::timeout(60)->get($enhancedImageUrl)->body();
        $enhancedPath      = 'variant_images/' . uniqid('ai_', true) . '.jpg';
        Storage::disk('public')->put($enhancedPath, $contents);
        $enhancedPublicUrl = Storage::disk('public')->url($enhancedPath);

        Log::info('[Enhance] Imagen mejorada guardada', [
            'path' => $enhancedPath,
            'url'  => $enhancedPublicUrl,
        ]);

        // ── 5. Limpiar temp ───────────────────────────────────────────────
        Storage::disk('public')->delete($tempPath);
        Log::info('[Enhance] Temp eliminado');

        Log::info('=== ENHANCE IMAGE OK ===');

        return response()->json([
            'success'      => true,
            'enhanced_url' => $enhancedPublicUrl,
        ]);

    } catch (\Exception $e) {
        Log::error('=== ENHANCE IMAGE ERROR ===', ['message' => $e->getMessage()]);

        if (isset($tempPath)) {
            Storage::disk('public')->delete($tempPath);
        }

        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
        ], 500);
    }
}

    // =========================================================================
    // Añadir variante a producto existente
    // =========================================================================

    public function addVariant(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'sku'          => 'nullable|string|unique:variants,sku',
            'price'        => 'required|numeric|min:0',
            'active'       => 'boolean',
            'stock_status' => 'nullable|in:available,out_of_stock,next_batch',
            'image'        => 'nullable|image|max:4096',
        ]);

        $path = $request->hasFile('image')
            ? $request->file('image')->store('variant_images', 'public')
            : null;

        $variant = $product->variants()->create([
            'sku'          => $validated['sku'] ?? null,
            'price'        => $validated['price'],
            'active'       => $validated['active'] ?? true,
            'stock_status' => $validated['stock_status'] ?? 'available',
            'image'        => $path,
            'destacado'    => false,
        ]);

        return response()->json([
            'message' => 'Variant added',
            'data'    => $this->formatVariant($variant),
        ]);
    }

    // =========================================================================
    // Endpoints especiales
    // =========================================================================

    public function featured()
    {
        $products = Product::with(['variants', 'category'])
            ->whereHas('variants', fn($q) => $q->where('destacado', true)->where('active', true))
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        return response()->json($products);
    }

    public function search(Request $request)
    {
        $query = Product::with(['variants', 'category']);

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($b) use ($q) {
                $b->where('name', 'like', "%{$q}%")
                  ->orWhere('manufacturer', 'like', "%{$q}%")
                  ->orWhereHas('variants', fn($vq) => $vq->where('sku', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('category_id'))  $query->where('category_id', $request->category_id);
        if ($request->filled('stock_status'))  $query->where('stock_status', $request->stock_status);
        if ($request->has('active') && $request->active !== '') {
            $query->where('active', (bool) $request->active);
        }

        return response()->json($query->get()->map(fn($p) => $this->formatProduct($p)));
    }
}
