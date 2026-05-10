<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CafeTable extends Model
{
    protected $table = 'cafe_tables';

    protected $fillable = [
        'name',
        'code',
        'number',
        'location',
        'capacity',
        'qr_code_path',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'cafe_table_id');
    }
}
