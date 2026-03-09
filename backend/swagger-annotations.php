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
 *
 * @OA\Post(
 *   path="/api/execute-sql",
 *   summary="Ejecutar consulta SQL",
 *   @OA\RequestBody(
 *     required=true,
 *     @OA\JsonContent(
 *       @OA\Property(property="sql", type="string", example="SELECT * FROM products")
 *     )
 *   ),
 *   @OA\Response(
 *     response=200,
 *     description="Resultado de la consulta",
 *     @OA\JsonContent(
 *       oneOf={
 *         @OA\Schema(type="array", @OA\Items(type="object")),
 *         @OA\Schema(type="object", @OA\Property(property="affected_rows", type="integer"))
 *       }
 *     )
 *   ),
 *   @OA\Response(
 *     response=400,
 *     description="Error en la consulta",
 *     @OA\JsonContent(
 *       @OA\Property(property="error", type="string")
 *     )
 *   )
 * )
 */
