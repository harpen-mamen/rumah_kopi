<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'cafe_table_id',
        'table_code',
        'customer_name',
        'customer_note',
        'subtotal',
        'tax',
        'service_charge',
        'discount',
        'total',
        'status',
        'ordered_at',
        'completed_at',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'tax' => 'float',
        'service_charge' => 'float',
        'discount' => 'float',
        'total' => 'float',
        'ordered_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function cafeTable()
    {
        return $this->belongsTo(CafeTable::class, 'cafe_table_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
