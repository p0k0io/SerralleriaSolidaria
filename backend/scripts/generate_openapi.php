<?php
require __DIR__ . '/../vendor/autoload.php';

try {
    $generator = new \OpenApi\Generator();
    $openapi = $generator->generate([__DIR__ . '/../swagger-annotations.php'], null, true);
    file_put_contents(__DIR__ . '/../public/docs/openapi.json', $openapi->toJson());
    echo "WROTE\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString();
    exit(1);
}
