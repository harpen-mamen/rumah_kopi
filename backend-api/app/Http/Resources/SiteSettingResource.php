<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteSettingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_name' => $this->site_name,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'logo' => $this->logo ? url('storage/' . $this->logo) : null,
            'favicon' => $this->favicon ? url('storage/' . $this->favicon) : null,
            'address' => $this->address,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'email' => $this->email,
            'instagram_url' => $this->instagram_url,
            'tiktok_url' => $this->tiktok_url,
            'google_maps_url' => $this->google_maps_url,
        ];
    }
}
