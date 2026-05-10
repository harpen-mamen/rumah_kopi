<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Carbon\Carbon;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class TodayOrdersWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $todayOrdersCount = Order::whereDate('ordered_at', Carbon::today())->count();

        return [
            Stat::make('Today\'s Orders', $todayOrdersCount)
                ->description('Orders created today')
                ->descriptionIcon('heroicon-m-shopping-cart')
                ->color('warning'),
        ];
    }
}
