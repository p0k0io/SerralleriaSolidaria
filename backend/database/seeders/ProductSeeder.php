<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Variant;
use App\Models\AttributeType;
use App\Models\AttributeValue;
use App\Models\VariantAttribute;
use App\Models\Category; 

class ProductSeeder extends Seeder
{
    public function run()
    {
        $category = Category::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Cerraduras',
                'description' => 'Categoría de productos de cerraduras y seguridad',
            ]
        );

        // ATRIBUTOS
        $material = AttributeType::firstOrCreate(['name' => 'Material']);
        $color = AttributeType::firstOrCreate(['name' => 'Color']);
        $tipoLlave = AttributeType::firstOrCreate(['name' => 'Tipo de llave']);
        $tamano = AttributeType::firstOrCreate(['name' => 'Tamaño']);

        // ===============================
        // PRODUCTO 1 - Bombín seguridad (KESO)
        // ===============================
        $p1 = Product::create([
            'name' => 'Bombín de seguridad',
            'description' => 'Bombín resistente para puertas de seguridad',
            'manufacturer' => 'KESO',
            'category_id' => $category->id,
            'active' => true,
        ]);

        $this->createVariant($p1, 'BOM-SEC-001', 25.50, $material, 'Latón', 'products/keso1.jpg');
        $this->createVariant($p1, 'BOM-SEC-002', 27.00, $material, 'Acero', 'products/keso2.jpg');
        $this->createVariant($p1, 'BOM-SEC-003', 28.50, $material, 'Níquel', 'products/keso3.jpg');

        // ===============================
        // PRODUCTO 2 - Escudo (M&C)
        // ===============================
        $p2 = Product::create([
            'name' => 'Escudo protector',
            'description' => 'Escudo metálico para reforzar cerraduras',
            'manufacturer' => 'M&C',
            'category_id' => $category->id,
            'active' => true,
        ]);

        $this->createVariant($p2, 'ESC-001', 15.75, $color, 'Negro', 'products/mc1.jpg');
        $this->createVariant($p2, 'ESC-002', 16.50, $color, 'Plateado', 'products/mc2.jpg');
        $this->createVariant($p2, 'ESC-003', 17.00, $color, 'Bronce', 'products/mc3.jpg');

        // ===============================
        // PRODUCTO 3 - Cerradura embutir
        // ===============================
        $p3 = Product::create([
            'name' => 'Cerradura de embutir',
            'description' => 'Cerradura para puertas interiores',
            'manufacturer' => 'Securemme',
            'category_id' => $category->id,
            'active' => true,
        ]);

        $this->createVariant($p3, 'CER-001', 40.00, $tipoLlave, 'Estándar', 'products/sec1.jpg');
        $this->createVariant($p3, 'CER-002', 42.00, $tipoLlave, 'Seguridad', 'products/sec2.jpg');
        $this->createVariant($p3, 'CER-003', 44.00, $tipoLlave, 'Maestra', 'products/sec3.jpg');

        // ===============================
        // PRODUCTO 4
        // ===============================
        $p4 = Product::create([
            'name' => 'Cerrojo adicional',
            'description' => 'Refuerzo extra para puertas',
            'manufacturer' => 'Securemme',
            'category_id' => $category->id,
            'active' => true,
        ]);

        $this->createVariant($p4, 'CER-ADD-001', 18.00, $color, 'Blanco', 'products/sec4.jpg');
        $this->createVariant($p4, 'CER-ADD-002', 19.50, $color, 'Negro', 'products/sec5.jpg');
        $this->createVariant($p4, 'CER-ADD-003', 21.00, $color, 'Cromado', 'products/sec6.jpg');

        // ===============================
        // PRODUCTO 5
        // ===============================
        $p5 = Product::create([
            'name' => 'Cerradura electrónica',
            'description' => 'Apertura digital avanzada',
            'manufacturer' => 'SmartLock',
            'category_id' => $category->id,
            'active' => true,
        ]);

        $this->createVariant($p5, 'ELE-001', 85.00, $tipoLlave, 'PIN', 'products/sec7.jpg');
        $this->createVariant($p5, 'ELE-002', 95.00, $tipoLlave, 'RFID', 'products/sec8.jpg');
        $this->createVariant($p5, 'ELE-003', 110.00, $tipoLlave, 'App', 'products/sec9.jpg');

        // ===============================
        // PRODUCTO 6
        // ===============================
        $p6 = Product::create([
            'name' => 'Bombín antibumping',
            'description' => 'Alta seguridad anti robo',
            'manufacturer' => 'KESO',
            'category_id' => $category->id,
            'active' => true,
        ]);

        $this->createVariant($p6, 'ANTI-001', 35.00, $material, 'Acero', 'products/keso4.jpg');
        $this->createVariant($p6, 'ANTI-002', 37.50, $material, 'Titanio', 'products/keso5.jpg');
        $this->createVariant($p6, 'ANTI-003', 39.00, $material, 'Níquel', 'products/keso6.jpg');

        // ===============================
        // PRODUCTO 7
        // ===============================
        $p7 = Product::create([
            'name' => 'Cerradura multipunto',
            'description' => 'Máxima seguridad',
            'manufacturer' => 'Securemme',
            'category_id' => $category->id,
            'active' => true,
        ]);

        $this->createVariant($p7, 'MULT-001', 120.00, $tamano, 'Pequeña', 'products/sec10.jpg');
        $this->createVariant($p7, 'MULT-002', 135.00, $tamano, 'Mediana', 'products/sec11.jpg');
        $this->createVariant($p7, 'MULT-003', 150.00, $tamano, 'Grande', 'products/sec12.jpg');

        // ===============================
        // PRODUCTO 8
        // ===============================
        $p8 = Product::create([
            'name' => 'Cerradura metálica',
            'description' => 'Para puertas blindadas',
            'manufacturer' => 'IronLock',
            'category_id' => $category->id,
            'active' => true,
        ]);

        $this->createVariant($p8, 'MET-001', 55.00, $material, 'Acero', 'products/mc4.jpg');
        $this->createVariant($p8, 'MET-002', 60.00, $material, 'Hierro', 'products/mc5.jpg');
        $this->createVariant($p8, 'MET-003', 65.00, $material, 'Aleación', 'products/mc6.jpg');

        // ===============================
        // PRODUCTO 9
        // ===============================
        $p9 = Product::create([
            'name' => 'Kit completo',
            'description' => 'Todo en uno',
            'manufacturer' => 'TotalSecure',
            'category_id' => $category->id,
            'active' => true,
        ]);

        $this->createVariant($p9, 'KIT-001', 70.00, $tipoLlave, 'Estándar', 'products/keso7.jpg');
        $this->createVariant($p9, 'KIT-002', 85.00, $tipoLlave, 'Seguridad', 'products/keso8.jpg');
        $this->createVariant($p9, 'KIT-003', 100.00, $tipoLlave, 'Premium', 'products/keso9.jpg');
    }

    private function createVariant($product, $sku, $price, $attrType, $value, $image)
    {
        $variant = Variant::create([
            'product_id' => $product->id,
            'sku' => $sku,
            'price' => $price,
            'active' => true,
            'image' => $image
        ]);

        $attrValue = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType->id,
            'value' => $value
        ]);

        VariantAttribute::create([
            'variant_id' => $variant->id,
            'attribute_value_id' => $attrValue->id
        ]);
    }
}