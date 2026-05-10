<?php

namespace App\Filament\Resources\CafeTableResource\Pages;

use App\Filament\Resources\CafeTableResource;
use Filament\Resources\Pages\EditRecord;

class EditCafeTable extends EditRecord
{
    protected static string $resource = CafeTableResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Custom actions if needed
        ];
    }
}
