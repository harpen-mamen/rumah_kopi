<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/site-setting', [\App\Http\Controllers\Api\PublicController::class, 'siteSetting']);
Route::get('/home', [\App\Http\Controllers\Api\PublicController::class, 'home']);
Route::get('/menu', [\App\Http\Controllers\Api\PublicController::class, 'menu']);
Route::get('/menu/categories', [\App\Http\Controllers\Api\PublicController::class, 'menuCategories']);
Route::get('/menu/items', [\App\Http\Controllers\Api\PublicController::class, 'menuItems']);
Route::get('/tables/{code}', [\App\Http\Controllers\Api\PublicController::class, 'getTableByCode']);
Route::post('/orders', [\App\Http\Controllers\Api\PublicController::class, 'createOrder']);
Route::get('/orders/{order_number}', [\App\Http\Controllers\Api\PublicController::class, 'getOrderStatus']);
