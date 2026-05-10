<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## TORTUGA AREA Backend

Backend Laravel + Filament untuk website publik "TORTUGA AREA".

Quickstart

- `composer install`
- `cp .env.example .env` (Windows: copy)
- Set `DB_` environment variables untuk MySQL
- Tambahkan `FRONTEND_URL` di `.env`, contoh: `FRONTEND_URL=http://localhost:3000`
- `php artisan key:generate`
- `php artisan migrate --seed`
- `php artisan storage:link`
- `php artisan serve`

API (public) contoh:
- `GET /api/site-setting`
- `GET /api/home`
- `GET /api/menu`
- `GET /api/menu/categories`
- `GET /api/menu/items`
- `GET /api/tables/{code}`
- `POST /api/orders`
- `GET /api/orders/{order_number}`

Frontend Next.js harus mengarah ke `NEXT_PUBLIC_API_URL`, contoh `http://localhost:8000/api`.
