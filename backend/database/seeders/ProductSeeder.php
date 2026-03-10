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
        $category = Category::firstOrCreate([
            'id' => 1
        ], [
            'name' => 'Cerraduras',
            'description' => 'Categoría de productos de cerraduras y seguridad',
        ]);

        // ===============================
        // Producto 1
        // ===============================
        $product1 = Product::create([
            'name' => 'Bombín de seguridad',
            'description' => 'Bombín resistente para puertas de seguridad',
            'manufacturer' => 'SegurLock',
            'category_id' => $category->id,
            'active' => true,
        ]);

        // Variante 1
        $variant1 = Variant::create([
            'product_id' => $product1->id,
            'sku' => 'BOM-SEC-001',
            'price' => 25.50,
            'active' => true,
        ]);

        $attrType1 = AttributeType::firstOrCreate(['name' => 'Material']);
        $attrValue1 = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType1->id,
            'value' => 'Latón'
        ]);

        VariantAttribute::create([
            'variant_id' => $variant1->id,
            'attribute_value_id' => $attrValue1->id
        ]);

        // Variante 2
        $variant1b = Variant::create([
            'product_id' => $product1->id,
            'sku' => 'BOM-SEC-002',
            'price' => 27.00,
            'active' => true,
        ]);
        $attrValue1b = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType1->id,
            'value' => 'Acero'
        ]);
        VariantAttribute::create([
            'variant_id' => $variant1b->id,
            'attribute_value_id' => $attrValue1b->id
        ]);

        // Variante 3
        $variant1c = Variant::create([
            'product_id' => $product1->id,
            'sku' => 'BOM-SEC-003',
            'price' => 28.50,
            'active' => true,
        ]);
        $attrValue1c = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType1->id,
            'value' => 'Níquel'
        ]);
        VariantAttribute::create([
            'variant_id' => $variant1c->id,
            'attribute_value_id' => $attrValue1c->id
        ]);

        // ===============================
        // Producto 2
        // ===============================
        $product2 = Product::create([
            'name' => 'Escudo protector',
            'description' => 'Escudo metálico para reforzar cerraduras',
            'manufacturer' => 'ProLock',
            'category_id' => $category->id,
            'active' => true,
        ]);

        // Variante 1
        $variant2 = Variant::create([
            'product_id' => $product2->id,
            'sku' => 'ESC-PROT-001',
            'price' => 15.75,
            'active' => true,
        ]);
        $attrType2 = AttributeType::firstOrCreate(['name' => 'Color']);
        $attrValue2 = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType2->id,
            'value' => 'Negro'
        ]);
        VariantAttribute::create([
            'variant_id' => $variant2->id,
            'attribute_value_id' => $attrValue2->id
        ]);

        // Variante 2
        $variant2b = Variant::create([
            'product_id' => $product2->id,
            'sku' => 'ESC-PROT-002',
            'price' => 16.50,
            'active' => true,
        ]);
        $attrValue2b = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType2->id,
            'value' => 'Plateado'
        ]);
        VariantAttribute::create([
            'variant_id' => $variant2b->id,
            'attribute_value_id' => $attrValue2b->id
        ]);

        // Variante 3
        $variant2c = Variant::create([
            'product_id' => $product2->id,
            'sku' => 'ESC-PROT-003',
            'price' => 17.00,
            'active' => true,
        ]);
        $attrValue2c = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType2->id,
            'value' => 'Bronce'
        ]);
        VariantAttribute::create([
            'variant_id' => $variant2c->id,
            'attribute_value_id' => $attrValue2c->id
        ]);

        // ===============================
        // Producto 3
        // ===============================
        $product3 = Product::create([
            'name' => 'Cerradura de embutir',
            'description' => 'Cerradura para puertas interiores',
            'manufacturer' => 'LockMaster',
            'category_id' => $category->id,
            'active' => true,
        ]);

        // Variante 1
        $variant3 = Variant::create([
            'product_id' => $product3->id,
            'sku' => 'CER-EMB-001',
            'price' => 40.00,
            'active' => true,
        ]);
        $attrType3 = AttributeType::firstOrCreate(['name' => 'Tipo de llave']);
        $attrValue3 = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType3->id,
            'value' => 'Llave estándar'
        ]);
        VariantAttribute::create([
            'variant_id' => $variant3->id,
            'attribute_value_id' => $attrValue3->id
        ]);

        // Variante 2
        $variant3b = Variant::create([
            'product_id' => $product3->id,
            'sku' => 'CER-EMB-002',
            'price' => 42.00,
            'active' => true,
        ]);
        $attrValue3b = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType3->id,
            'value' => 'Llave de seguridad'
        ]);
        VariantAttribute::create([
            'variant_id' => $variant3b->id,
            'attribute_value_id' => $attrValue3b->id
        ]);

        // Variante 3
        $variant3c = Variant::create([
            'product_id' => $product3->id,
            'sku' => 'CER-EMB-003',
            'price' => 44.00,
            'active' => true,
        ]);
        $attrValue3c = AttributeValue::firstOrCreate([
            'attribute_type_id' => $attrType3->id,
            'value' => 'Llave maestra'
        ]);
        VariantAttribute::create([
            'variant_id' => $variant3c->id,
            'attribute_value_id' => $attrValue3c->id
        ]);
    }
}