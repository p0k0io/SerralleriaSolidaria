<?php
namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *   title="Serralleria Solidaria API",
 *   version="1.0.0",
 *   description="Documentación de la API de Serralleria Solidaria"
 * )
 *
 * @OA\Server(
 *   url="http://localhost",
 *   description="Servidor local"
 * )
 */
class OpenApiInfoController
{
    // Este controlador solo contiene las anotaciones de OpenAPI.
}

