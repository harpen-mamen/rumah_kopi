<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CafeTableResource extends JsonResource
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
            'name' => $this->name,
            'code' => $this->code,
            'number' => $this->number,
            'location' => $this->location,
            'capacity' => $this->capacity,
            'qr_code_path' => $this->qr_code_path ? url('storage/' . $this->qr_code_path) : null,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
