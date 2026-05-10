<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PreparingOrdersWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $preparingOrdersCount = Order::where('status', 'preparing')->count();

        return [
            Stat::make('Preparing Orders', $preparingOrdersCount)
                ->description('Orders being prepared')
                ->descriptionIcon('heroicon-m-fire')
                ->color('danger'),
        ];
    }
}
