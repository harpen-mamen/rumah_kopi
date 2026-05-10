<?php

namespace App\Filament\Resources\CafeTableResource\Pages;

use App\Filament\Resources\CafeTableResource;
use Filament\Resources\Pages\ListRecords;

class ListCafeTables extends ListRecords
{
    protected static string $resource = CafeTableResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Custom actions if needed
        ];
    }
}
