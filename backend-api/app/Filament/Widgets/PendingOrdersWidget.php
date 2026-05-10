<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class PendingOrdersWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $pendingOrdersCount = Order::where('status', 'pending')->count();

        return [
            Stat::make('Pending Orders', $pendingOrdersCount)
                ->description('Orders awaiting preparation')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning'),
        ];
    }
}
