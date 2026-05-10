<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'site_name',
        'tagline',
        'description',
        'logo',
        'favicon',
        'address',
        'phone',
        'whatsapp',
        'email',
        'instagram_url',
        'tiktok_url',
        'google_maps_url',
    ];
}
