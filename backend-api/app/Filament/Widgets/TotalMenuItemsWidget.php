<?php

namespace App\Filament\Widgets;

use App\Models\MenuItem;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class TotalMenuItemsWidget extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Menu Items', MenuItem::count())
                ->description('Active menu items in system')
                ->descriptionIcon('heroicon-m-square-3-stack-3d')
                ->color('info'),
        ];
    }
}
