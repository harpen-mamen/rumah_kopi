<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'menu_item_id',
        'menu_name_snapshot',
        'price_snapshot',
        'quantity',
        'note',
        'subtotal',
    ];

    protected $casts = [
        'price_snapshot' => 'float',
        'subtotal' => 'float',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function menuItem()
    {
        return $this->belongsTo(MenuItem::class);
    }
}
