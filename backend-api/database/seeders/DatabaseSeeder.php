<?php

namespace Database\Seeders;

use App\Models\AboutSection;
use App\Models\CafeTable;
use App\Models\Feature;
use App\Models\Gallery;
use App\Models\HeroSection;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\OpeningHour;
use App\Models\Promo;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@tortuga.test'],
            [
                'name' => 'Tortuga Admin',
                'password' => Hash::make('admin12345'),
            ],
        );

        SiteSetting::updateOrCreate(
            ['id' => 1],
            [
                'site_name' => 'TORTUGA AREA',
                'tagline' => 'Coffee, Space, and Island Vibes',
                'description' => 'Ruang hangat untuk kopi, makanan ringan, kerja singkat, dan percakapan yang pelan.',
                'address' => "Jl. Kopi Nusantara No. 8\nJakarta Selatan",
                'phone' => '+62 812-3456-7890',
                'whatsapp' => '+6281234567890',
                'email' => 'hello@tortugaarea.test',
                'instagram_url' => 'https://instagram.com/tortugaarea',
                'tiktok_url' => 'https://tiktok.com/@tortugaarea',
                'google_maps_url' => 'https://maps.google.com/?q=Tortuga+Area',
            ],
        );

        HeroSection::updateOrCreate(
            ['id' => 1],
            [
                'headline' => 'TORTUGA AREA',
                'subheadline' => 'Welcome to your favourite place',
                'description' => 'Freshly brewed coffee, curated comfort food, and a calm corner for every kind of day.',
                'primary_button_text' => 'Lihat Menu',
                'primary_button_url' => '#menu',
                'secondary_button_text' => 'Lokasi',
                'secondary_button_url' => '#location',
                'hero_media_type' => 'video',
                'overlay_opacity' => 0.55,
                'is_active' => true,
            ],
        );

        $features = [
            ['Specialty Coffee', 'Biji kopi pilihan dan seduhan yang konsisten untuk espresso, filter, dan menu susu.'],
            ['Fresh Bites', 'Pastry dan makanan ringan yang cocok untuk sarapan, meeting, atau jeda sore.'],
            ['Cozy Space', 'Tempat duduk nyaman, meja kerja, dan suasana santai untuk datang sendiri atau bersama teman.'],
        ];

        foreach ($features as $index => [$title, $description]) {
            Feature::updateOrCreate(
                ['title' => $title],
                [
                    'description' => $description,
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ],
            );
        }

        AboutSection::updateOrCreate(
            ['id' => 1],
            [
                'title' => 'Cerita TORTUGA',
                'subtitle' => 'Dibuat untuk kopi yang baik dan momen yang terasa dekat.',
                'content' => "TORTUGA AREA lahir dari ide sederhana: coffee shop yang terasa akrab, rapi, dan mudah kembali dikunjungi.\n\nKami mengatur menu, jam buka, promo, galeri, dan ulasan dari dashboard admin agar web publik selalu mengikuti kondisi terbaru di outlet.\n\nSetiap perubahan di dashboard langsung menjadi bahan tampilan publik, mulai dari hero, menu unggulan, cerita, sampai informasi lokasi.",
                'button_text' => 'Lihat Menu',
                'button_url' => '#menu',
                'is_active' => true,
            ],
        );

        $categories = [
            'Coffee' => [
                ['Espresso', 'Single shot dengan karakter tegas dan bersih.', 18000, true],
                ['Cappuccino', 'Espresso, susu steamed, dan foam lembut.', 32000, true],
                ['Cafe Latte', 'Kopi susu hangat dengan tekstur halus.', 34000, true],
            ],
            'Cold Drinks' => [
                ['Iced Americano', 'Espresso dingin yang ringan dan menyegarkan.', 28000, true],
                ['Cold Brew', 'Kopi dingin slow steep dengan rasa smooth.', 35000, true],
                ['Matcha Latte', 'Matcha creamy dengan susu dingin.', 38000, false],
            ],
            'Food' => [
                ['Butter Croissant', 'Croissant flaky dengan aroma butter.', 28000, true],
                ['Chocolate Brownie', 'Brownie cokelat padat dan lembut.', 30000, true],
            ],
        ];

        $categoryOrder = 1;
        foreach ($categories as $categoryName => $items) {
            $category = MenuCategory::updateOrCreate(
                ['slug' => Str::slug($categoryName)],
                [
                    'name' => $categoryName,
                    'description' => "Pilihan {$categoryName} dari TORTUGA AREA.",
                    'sort_order' => $categoryOrder++,
                    'is_active' => true,
                ],
            );

            foreach ($items as $index => [$name, $description, $price, $featured]) {
                MenuItem::updateOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'menu_category_id' => $category->id,
                        'name' => $name,
                        'description' => $description,
                        'price' => $price,
                        'is_available' => true,
                        'is_featured' => $featured,
                        'sort_order' => $index + 1,
                    ],
                );
            }
        }

        $hours = [
            ['Senin', '08:00', '21:00', false, 1],
            ['Selasa', '08:00', '21:00', false, 2],
            ['Rabu', '08:00', '21:00', false, 3],
            ['Kamis', '08:00', '21:00', false, 4],
            ['Jumat', '08:00', '22:00', false, 5],
            ['Sabtu', '09:00', '22:00', false, 6],
            ['Minggu', '09:00', '20:00', false, 7],
        ];

        foreach ($hours as [$day, $open, $close, $closed, $sort]) {
            OpeningHour::updateOrCreate(
                ['day' => $day],
                [
                    'open_time' => $open,
                    'close_time' => $close,
                    'is_closed' => $closed,
                    'sort_order' => $sort,
                ],
            );
        }

        Promo::updateOrCreate(
            ['title' => 'Morning Coffee Set'],
            [
                'description' => 'Kopi panas dan pastry pilihan untuk mulai hari.',
                'button_text' => 'Pesan Sekarang',
                'button_url' => '/order',
                'is_active' => true,
            ],
        );

        Gallery::updateOrCreate(
            ['title' => 'Main Bar'],
            [
                'image' => 'gallery/main-bar-placeholder.jpg',
                'caption' => 'Area bar tempat kopi dibuat setiap hari.',
                'sort_order' => 1,
                'is_active' => false,
            ],
        );

        Testimonial::updateOrCreate(
            ['customer_name' => 'Ayu Prameswari'],
            [
                'customer_position' => 'Regular customer',
                'rating' => 5,
                'message' => 'Tempatnya nyaman, menu jelas, dan pesanan meja terasa praktis.',
                'is_active' => true,
            ],
        );

        foreach ([
            ['Table 1', 'TBL-001', 1, 'Main floor', 2],
            ['Table 2', 'TBL-002', 2, 'Main floor', 4],
            ['Window Table', 'WINDOW-01', 3, 'Window side', 2],
        ] as [$name, $code, $number, $location, $capacity]) {
            CafeTable::updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'number' => $number,
                    'location' => $location,
                    'capacity' => $capacity,
                    'is_active' => true,
                ],
            );
        }
    }
}
