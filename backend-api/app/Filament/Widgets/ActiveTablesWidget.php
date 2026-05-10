<?php

namespace App\Filament\Widgets;

use App\Models\CafeTable;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ActiveTablesWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $activeTablesCount = CafeTable::where('is_active', true)->count();

        return [
            Stat::make('Active Tables', $activeTablesCount)
                ->description('Tables available for use')
                ->descriptionIcon('heroicon-m-table-cells')
                ->color('primary'),
        ];
    }
}
