<?php
// Este fichero se usa sólo para generación de OpenAPI.
// Se pueden dejar aquí las anotaciones principales.

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
 *
 * @OA\Get(
 *   path="/api/test",
 *   summary="Test endpoint",
 *   @OA\Response(
 *     response=200,
 *     description="OK",
 *     @OA\JsonContent(
 *       @OA\Property(property="status", type="string"),
 *       @OA\Property(property="message", type="string")
 *     )
 *   )
 * )
 */
