<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        // 🚨 LIMPIEZA PREVIA PARA EVITAR ENLACES ROTOS O DUPLICADOS
        // Esto asegura que el catálogo se genere limpio e impecable
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        PropertyImage::truncate();
        Property::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Recuperar o crear al dueño
        $owner = User::firstOrCreate(
            ['email' => 'carlos@nestly.com'],
            [
                'name' => 'Carlos Inmobiliaria',
                'password' => Hash::make('password123'),
            ]
        );

        // 🏠 LAS 15 PROPIEDADES CON IMÁGENES DE SERVIDORES ABIERTOS PARA LOCALHOST
        // Cada propiedad tiene dos imágenes completamente distintas que simulan casas reales
        $propiedadesInfo = [
            [
                'title' => 'Chalet independiente con piscina',
                'location' => 'Las Rozas, Madrid',
                'price_cents' => 68000000,
                'rooms' => 4,
                'bathrooms' => 3,
                'area' => 250,
                'status' => 'available',
                'description' => 'Hermoso chalet familiar en zona residencial muy tranquila. Cuenta con jardín privado, piscina, garaje para dos coches y sistema de seguridad integrado.',
                'images' => [
                    'https://loremflickr.com/800/600/house,villa?lock=1',
                    'https://loremflickr.com/800/600/pool,villa?lock=11'
                ]
            ],
            [
                'title' => 'Ático dúplex de lujo en el centro',
                'location' => 'Paseo de la Castellana, Madrid',
                'price_cents' => 45000000,
                'rooms' => 3,
                'bathrooms' => 2,
                'area' => 120,
                'status' => 'available',
                'description' => 'Espectacular ático con terraza de 40m². Vistas panorámicas a la ciudad, cocina equipada con electrodomésticos de alta gama y calefacción central. Muy luminoso.',
                'images' => [
                    'https://loremflickr.com/800/600/apartment,luxury?lock=2',
                    'https://loremflickr.com/800/600/terrace,apartment?lock=22'
                ]
            ],
            [
                'title' => 'Estudio moderno ideal inversores',
                'location' => 'Malasaña, Madrid',
                'price_cents' => 19500000,
                'rooms' => 1,
                'bathrooms' => 1,
                'area' => 42,
                'status' => 'available',
                'description' => 'Estudio totalmente reformado y amueblado con un estilo óptimo y diáfano. Excelente rentabilidad en alquiler. A pasos del metro y zonas de ocio.',
                'images' => [
                    'https://loremflickr.com/800/600/loft,interior?lock=3',
                    'https://loremflickr.com/800/600/studio,room?lock=33'
                ]
            ],
            [
                'title' => 'Piso familiar junto al Retiro',
                'location' => 'Niño Jesús, Madrid',
                'price_cents' => 52000000,
                'rooms' => 3,
                'bathrooms' => 2,
                'area' => 115,
                'status' => 'available',
                'description' => 'Vivienda exterior muy amplia con suelos de parqué, calefacción individual y portero físico. Ubicación inmejorable a escasos 2 minutos andando del Parque del Retiro.',
                'images' => [
                    'https://loremflickr.com/800/600/livingroom?lock=4',
                    'https://loremflickr.com/800/600/kitchen?lock=44'
                ]
            ],
            [
                'title' => 'Loft de diseño industrial',
                'location' => 'Poblenou, Barcelona',
                'price_cents' => 38500000,
                'rooms' => 2,
                'bathrooms' => 1,
                'area' => 95,
                'status' => 'available',
                'description' => 'Techos altos con vigas de hierro vistas y grandes ventanales. Espacio abierto muy luminoso, cocina americana y acabados de microcemento pulido.',
                'images' => [
                    'https://loremflickr.com/800/600/industrial,loft?lock=5',
                    'https://loremflickr.com/800/600/modern,kitchen?lock=55'
                ]
            ],
            [
                'title' => 'Chalet adosado con jardín privado',
                'location' => 'Majadahonda, Madrid',
                'price_cents' => 59000000,
                'rooms' => 4,
                'bathrooms' => 3,
                'area' => 190,
                'status' => 'available',
                'description' => 'Ubicado en urbanización cerrada con zonas comunes, pistas de pádel y piscina comunitaria. Dispone de sótano acondicionado, buhardilla y terraza.',
                'images' => [
                    'https://loremflickr.com/800/600/suburban,house?lock=6',
                    'https://loremflickr.com/800/600/garden?lock=66'
                ]
            ],
            [
                'title' => 'Apartamento con vistas al mar',
                'location' => 'La Malagueta, Málaga',
                'price_cents' => 31000000,
                'rooms' => 2,
                'bathrooms' => 1,
                'area' => 75,
                'status' => 'available',
                'description' => 'Apartamento en primera línea de playa. Terraza acristalada con vistas espectaculares a la bahía. Reformado recientemente, aire acondicionado centralizado.',
                'images' => [
                    'https://loremflickr.com/800/600/beach,apartment?lock=7',
                    'https://loremflickr.com/800/600/sea,view?lock=77'
                ]
            ],
            [
                'title' => 'Piso de lujo en el Barrio de Salamanca',
                'location' => 'Calle Goya, Madrid',
                'price_cents' => 125000000,
                'rooms' => 5,
                'bathrooms' => 4,
                'area' => 280,
                'status' => 'available',
                'description' => 'Propiedad exclusiva en finca clásica. Techos altos con molduras originales, balcones a la calle principal, gran salón señorial y zona de servicio independiente.',
                'images' => [
                    'https://loremflickr.com/800/600/palace,interior?lock=8',
                    'https://loremflickr.com/800/600/diningroom?lock=88'
                ]
            ],
            [
                'title' => 'Planta baja con impresionante terraza',
                'location' => 'Sanchinarro, Madrid',
                'price_cents' => 42000000,
                'rooms' => 3,
                'bathrooms' => 2,
                'area' => 105,
                'status' => 'rented',
                'description' => 'Estupendo bajo con un jardín/terraza pavimentada de 60m². Incluye plaza de garaje grande y trastero en el precio. Urbanización con seguridad 24 horas.',
                'images' => [
                    'https://loremflickr.com/800/600/terrace,garden?lock=9',
                    'https://loremflickr.com/800/600/apartment,building?lock=99'
                ]
            ],
            [
                'title' => 'Ático minimalista con piscina privada',
                'location' => 'Eixample, Barcelona',
                'price_cents' => 89000000,
                'rooms' => 3,
                'bathrooms' => 3,
                'area' => 160,
                'status' => 'available',
                'description' => 'Ático de concepto abierto. Terraza perimetral con piscina privada tipo jacuzzi y vistas panorámicas a la Sagrada Familia. Acabados premium.',
                'images' => [
                    'https://loremflickr.com/800/600/minimalist,penthouse?lock=10',
                    'https://loremflickr.com/800/600/jacuzzi?lock=101'
                ]
            ],
            [
                'title' => 'Casa rústica reformada',
                'location' => 'Valldemossa, Mallorca',
                'price_cents' => 72000000,
                'rooms' => 4,
                'bathrooms' => 2,
                'area' => 210,
                'status' => 'available',
                'description' => 'Fachada de piedra tradicional mallorquina combinada con un interior moderno y acogedor. Patio interior con porche, vigas de madera y chimenea en el salón.',
                'images' => [
                    'https://loremflickr.com/800/600/cottage,stone?lock=12',
                    'https://loremflickr.com/800/600/rustic,fireplace?lock=122'
                ]
            ],
            [
                'title' => 'Piso céntrico y económico',
                'location' => 'Delicias, Madrid',
                'price_cents' => 24500000,
                'rooms' => 2,
                'bathrooms' => 1,
                'area' => 65,
                'status' => 'available',
                'description' => 'Ideal como primera vivienda. Distribución cuadrada muy bien aprovechada. Cocina independiente amueblada y armarios empotrados. Finca con ascensor.',
                'images' => [
                    'https://loremflickr.com/800/600/flat?lock=13',
                    'https://loremflickr.com/800/600/bedroom?lock=133'
                ]
            ],
            [
                'title' => 'Chalet de lujo de obra nueva',
                'location' => 'La Moraleja, Madrid',
                'price_cents' => 210000000,
                'rooms' => 6,
                'bathrooms' => 6,
                'area' => 540,
                'status' => 'available',
                'description' => 'Arquitectura vanguardista y máxima eficiencia energética. Domótica integral, piscina infinity, gimnasio privado, bodega y seguridad privada avanzada.',
                'images' => [
                    'https://loremflickr.com/800/600/mansion,modern?lock=14',
                    'https://loremflickr.com/800/600/infinity,pool?lock=144'
                ]
            ],
            [
                'title' => 'Duplex reformado en zona universitaria',
                'location' => 'Benimaclet, Valencia',
                'price_cents' => 21500000,
                'rooms' => 3,
                'bathrooms' => 2,
                'area' => 90,
                'status' => 'sold',
                'description' => 'Perfecto para alquiler de estudiantes o jóvenes profesionales. Muy alegre y juvenil, cocina tipo office integrada en el salón y aire acondicionado.',
                'images' => [
                    'https://loremflickr.com/800/600/room,student?lock=15',
                    'https://loremflickr.com/800/600/desk,interior?lock=155'
                ]
            ],
            [
                'title' => 'Bungalow en urbanización costera',
                'location' => 'San Juan, Alicante',
                'price_cents' => 28000000,
                'rooms' => 3,
                'bathrooms' => 2,
                'area' => 130,
                'status' => 'available',
                'description' => 'Bungalow de dos plantas con porche delantero y salida directa a los jardines comunitarios. A 10 minutos a pie de la playa de San Juan.',
                'images' => [
                    'https://loremflickr.com/800/600/bungalow?lock=16',
                    'https://loremflickr.com/800/600/resort?lock=166'
                ]
            ]
        ];

        // 🔄 INSERCIÓN COMPLETA DESDE CERO
        foreach ($propiedadesInfo as $info) {
            $property = Property::create([
                'user_id'     => $owner->id,
                'title'       => $info['title'],
                'location'    => $info['location'],
                'price_cents' => $info['price_cents'],
                'rooms'       => $info['rooms'],
                'bathrooms'   => $info['bathrooms'],
                'area'        => $info['area'],
                'status'      => $info['status'],
                'description' => $info['description'],
            ]);

            // 📸 Imagen Principal
            PropertyImage::create([
                'property_id' => $property->id,
                'path'        => $info['images'][0],
                'is_primary'  => 1,
                'sort_order'  => 0,
            ]);

            // 📸 Imagen Secundaria
            PropertyImage::create([
                'property_id' => $property->id,
                'path'        => $info['images'][1],
                'is_primary'  => 0,
                'sort_order'  => 1,
            ]);
        }
    }
}