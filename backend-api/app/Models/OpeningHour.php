<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpeningHour extends Model
{
    protected $fillable = [
        'day',
        'open_time',
        'close_time',
        'is_closed',
        'sort_order',
    ];

    protected $casts = [
        'is_closed' => 'boolean',
    ];
}
