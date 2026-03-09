# Swagger / OpenAPI — Backend

Este fichero explica cómo funciona la integración de Swagger/OpenAPI en el backend (carpeta `backend`), cómo editar la especificación y cómo regenerarla.

## Paso a paso básico 🛠️

1. **Arranca el servidor Laravel** desde la carpeta `backend`:
   ```bash
   cd backend
   php artisan serve
   ```

### Apartado de USER 👤

En los ejemplos anteriores hemos documentado un endpoint de prueba (`/api/test`).
Aquí tienes la misma idea aplicada al recurso de usuario autenticado:

```php
/**
 * @OA\Get(
 *   path="/api/user",
 *   summary="Obtener usuario autenticado",
 *   @OA\Response(
 *     response=200,
 *     description="Datos del usuario",
 *     @OA\JsonContent(
 *       @OA\Property(property="id", type="integer"),
 *       @OA\Property(property="name", type="string"),
 *       @OA\Property(property="email", type="string")
 *     )
 *   ),
 *   @OA\Response(response=401, description="No autorizado")
 * )
 */
```

Agrega esa anotación en cualquier fichero que escanee el generador (por ejemplo `swagger-annotations.php`),
regenera la spec y recarga la UI para ver el apartado "User" con su operación.


2. **Abre la UI** en el navegador:
   `http://127.0.0.1:8000/docs/`.

3. **Documenta un endpoint** mediante anotaciones `@OA\...` encima de tu controlador o en
   `swagger-annotations.php`. Ejemplo mínimo:
   ```php
   /**
    * @OA\Get(
    *   path="/api/test",
    *   summary="Test endpoint",
    *   @OA\Response(response=200, description="OK")
    * )
    */
   ```

4. **Regenera la especificación**:
   ```bash
   cd backend
   composer dump-autoload -o              # refresca PSR-4
   composer run-script generate-openapi   # o php scripts/generate_openapi.php
   ```

   - Si el generador acaba con advertencias (`Required @OA... not found`), revisa que
     tus anotaciones estén en rutas escaneadas (normalmente `app/` o
     `swagger-annotations.php`).
   - También puedes escribir/editar `public/docs/openapi.json` manualmente si la
generación falla.

5. **Recarga la UI** en el navegador para ver los nuevos endpoints.

6. **Resolución de problemas**:
   - Si la UI muestra `No operations defined` o falla la carga, comprueba el JSON con
     `curl` o abrelo en un editor. Debe incluir `
Resumen rápido
- UI (Swagger): `public/docs/index.html` — se sirve estáticamente bajo `/api/`.
- Spec JSON: `public/docs/openapi.json` — especificación OpenAPI usada por la UI.
- Generación automática: `vendor/bin/openapi` (package `zircote/swagger-php`) y el script PHP `scripts/generate_openapi.php` (programático).

Abrir la UI
1. Arranca el servidor de desarrollo en la carpeta `backend`:

```bash
cd backend
php artisan serve
```

2. Abrir en el navegador:

```
http://127.0.0.1:8000/docs/
```

Estado actual
- Hay una especificación mínima válida en `public/docs/openapi.json`. Esto sirve como "fallback" y permite usar la UI aunque la generación automática falle.
- La UI carga la spec desde `/docs/openapi.json` (ruta absoluta relativa al servidor) para evitar problemas de CORS/host.

Editar la documentación

Opción A — editar el JSON estático (rápido)
- Edita `public/docs/openapi.json` directamente. Es la forma más rápida si quieres añadir/ajustar endpoints y esquemas manualmente.

Opción B — anotaciones en el código PHP (autogeneración)
- Añade anotaciones OA en los ficheros PHP (docblocks con `@OA\\...`) dentro de `app/`.
- Archivos de ejemplo que existen en el repo: `app/SwaggerRoot.php`, `app/Http/Controllers/SwaggerAnnotations.php`, `app/OpenApi/OpenApi.php`, `app/Http/Controllers/OpenApiInfo.php`.

Generar la spec automáticamente

1) Regenerar autoload (recomendado después de mover/renombrar clases/archivos):

```bash
cd backend
composer dump-autoload -o
```

2) Intentar generación con el binario (script `composer` ya incluido):

```bash
cd backend
composer run-script generate-openapi
# ó directamente
vendor/bin/openapi --bootstrap vendor/autoload.php --output public/docs/openapi.json app/
```

3) Alternativa programática (escribe el fichero o muestra errores más claros):

```bash
php scripts/generate_openapi.php
```

Notas sobre fallos comunes al generar
- Advertencias como `Required @OA\\Info() not found` o `Required @OA\\PathItem() not found` significan que el generador no detecta anotaciones raíz. Asegúrate de tener un fichero con las anotaciones principales (por ejemplo `@OA\\OpenApi` o `@OA\\Info`) en un archivo que el generador escanee.
- Problemas de PSR-4/autoload pueden hacer que clases con anotaciones sean ignoradas. Ejecuta `composer dump-autoload -o` y revisa los namespaces y nombres de clase (archivo y clase deben coincidir con el namespace `App\\\\...`).
- Si el generador falla por dependencias del entorno (p. ej. falta PDO sqlite en este entorno) puedes:
  - generar la spec en otra máquina con PDO instalado y copiar `public/docs/openapi.json` al proyecto, o
  - usar la opción programática/--bootstrap para minimizar carga de la app, y mantener la especificación estática si prefieres.

Por qué usamos un JSON estático aquí
- En este entorno la generación automática produjo advertencias y no generó spec completa; para que la UI funcione sin dependencias del sistema, se añadió `public/docs/openapi.json` con una spec mínima válida. Esto no requiere permisos de administrador.

Solución de errores en la UI
- Si la UI muestra "Failed to load API definition" o "NetworkError when attempting to fetch resource":
  - Comprueba que `http://127.0.0.1:8000/docs/openapi.json` devuelve `200` y JSON válido.
  - Fuerza recarga del navegador (Ctrl+F5) para evitar caché de la UI.
  - Asegúrate de que la especificación usa servers relativos (`"url": "/"`) si la UI y la API están en la misma origen/puerto.
  - Si la UI se sirve desde otro host/puerto, configura CORS en Laravel (archivo `config/cors.php` o middleware `HandleCors`). No edites `.env` a menos que sea necesario.

Comprobaciones rápidas
- Verificar JSON desde terminal (sin Python):

```bash
curl -s http://127.0.0.1:8000/docs/openapi.json | php -r '$s = stream_get_contents(STDIN); echo json_encode(json_decode($s), JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);'
```

Archivos importantes
- `public/docs/index.html` — UI estática (CDN swagger-ui)
- `public/docs/openapi.json` — especificación usada por la UI
- `vendor/bin/openapi` — generador `zircote/swagger-php` (dev dependency)
- `scripts/generate_openapi.php` — script PHP programático para generar `openapi.json`
- `composer.json` script: `generate-openapi` (invoca `vendor/bin/openapi`)

Consejos finales
- Si quieres que me encargue de que la generación automática funcione en este entorno, puedo revisar las anotaciones y corregir PSR-4/archivos concretos; ten en cuenta que algunos problemas pueden venir del entorno (drivers PDO) y, en ese caso, la opción práctica es generar en una máquina con los requisitos y copiar `openapi.json` al repo.

Si quieres, actualizo `public/docs/openapi.json` con más endpoints o intento arreglar la generación automática ahora.

*** Fin README
