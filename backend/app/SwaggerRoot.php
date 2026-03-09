<?php

namespace App;

/**
 * @OA\OpenApi(
 *   @OA\Info(
 *     title="Serralleria Solidaria API",
 *     version="1.0.0",
 *     description="Documentación de la API de Serralleria Solidaria"
 *   ),
 *   @OA\Server(
 *     url="http://localhost",
 *     description="Servidor local"
 *   ),
 *   @OA\PathItem(
 *     path="/api/test",
 *     @OA\Get(
 *       summary="Test endpoint",
 *       @OA\Response(response=200, description="OK")
 *     )
 *   ),
 *   @OA\PathItem(
 *     path="/api/user",
 *     @OA\Get(
 *       summary="Obtener usuario autenticado",
 *       security={{"sanctum":{}}},
 *       @OA\Response(
 *         response=200,
 *         description="Datos del usuario",
 *         @OA\JsonContent(
 *           @OA\Property(property="id", type="integer"),
 *           @OA\Property(property="name", type="string"),
 *           @OA\Property(property="email", type="string")
 *         )
 *       ),
 *       @OA\Response(response=401, description="No autorizado")
 *     )
 *   )
 * )
 */

// file contains only annotations for swagger-php

class SwaggerRoot {}
