<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Variant;
use App\Models\AttributeType;
use App\Models\AttributeValue;
use App\Models\VariantAttribute;

class ProductSeeder extends Seeder
{
    //php artisan db:seed
    public function run()
    {
        // -------------------
        // Producto 1: Bombín
        // -------------------
        $product1 = Product::create([
            'name' => 'Bombín de seguridad',
            'description' => 'Bombín resistente para puertas de seguridad',
            'manufacturer' => 'SegurLock',
            'category_id' => 1,
            'active' => true,
        ]);

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

        // -------------------
        // Producto 2: Escudo
        // -------------------
        $product2 = Product::create([
            'name' => 'Escudo protector',
            'description' => 'Escudo metálico para reforzar cerraduras',
            'manufacturer' => 'ProLock',
            'category_id' => 1,
            'active' => true,
        ]);

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

        // -------------------
        // Producto 3: Cerradura
        // -------------------
        $product3 = Product::create([
            'name' => 'Cerradura de embutir',
            'description' => 'Cerradura para puertas interiores',
            'manufacturer' => 'LockMaster',
            'category_id' => 1,
            'active' => true,
        ]);

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
    }
}
