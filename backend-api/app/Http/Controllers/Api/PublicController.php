<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SiteSetting;
use App\Models\HeroSection;
use App\Models\Feature;
use App\Models\AboutSection;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Gallery;
use App\Models\Testimonial;
use App\Models\OpeningHour;
use App\Models\Promo;
use App\Models\CafeTable;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicController extends Controller
{
    public function siteSetting()
    {
        $setting = SiteSetting::first();
        if (!$setting) {
            return response()->json(['data' => null]);
        }
        return response()->json(['data' => $setting]);
    }

    public function home()
    {
        $site = SiteSetting::first();
        $hero = HeroSection::where('is_active', true)->first();
        $features = Feature::where('is_active', true)->orderBy('sort_order')->get();
        $about = AboutSection::where('is_active', true)->first();
        $featuredMenu = MenuItem::where('is_available', true)->where('is_featured', true)->orderBy('sort_order')->get();
        $gallery = Gallery::where('is_active', true)->orderBy('sort_order')->get();
        $testimonials = Testimonial::where('is_active', true)->get();
        $openingHours = OpeningHour::orderBy('sort_order')->get();
        $promos = Promo::where('is_active', true)->get();

        return response()->json([
            'site_setting' => $site,
            'hero' => $hero,
            'features' => $features,
            'about' => $about,
            'featured_menu' => $featuredMenu,
            'gallery' => $gallery,
            'testimonials' => $testimonials,
            'opening_hours' => $openingHours,
            'promos' => $promos,
        ]);
    }

    public function menu(Request $request)
    {
        $categories = MenuCategory::where('is_active', true)->orderBy('sort_order')->get();
        $items = MenuItem::where('is_available', true)->orderBy('sort_order');

        if ($request->has('category_id')) {
            $items->where('menu_category_id', $request->query('category_id'));
        }
        if ($request->has('search')) {
            $s = $request->query('search');
            $items->where('name', 'like', "%{$s}%");
        }
        if ($request->has('featured')) {
            $items->where('is_featured', true);
        }
        if ($request->has('available')) {
            $items->where('is_available', true);
        }

        return response()->json([
            'categories' => $categories,
            'items' => $items->get(),
        ]);
    }

    public function menuCategories()
    {
        $categories = MenuCategory::where('is_active', true)->orderBy('sort_order')->get();
        return response()->json(['data' => $categories]);
    }

    public function menuItems(Request $request)
    {
        $items = MenuItem::query();
        if ($request->has('category_id')) {
            $items->where('menu_category_id', $request->query('category_id'));
        }
        if ($request->has('search')) {
            $s = $request->query('search');
            $items->where('name', 'like', "%{$s}%");
        }
        if ($request->boolean('featured')) {
            $items->where('is_featured', true);
        }
        if ($request->boolean('available')) {
            $items->where('is_available', true);
        }
        return response()->json(['data' => $items->paginate(20)]);
    }

    public function getTableByCode($code)
    {
        $table = CafeTable::where('code', $code)->where('is_active', true)->first();
        if (!$table) {
            return response()->json(['message' => 'Table not found'], 404);
        }
        return response()->json(['data' => $table]);
    }

    public function createOrder(Request $request)
    {
        $payload = $request->validate([
            'table_code' => 'required|string',
            'customer_name' => 'nullable|string',
            'customer_note' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|integer|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.note' => 'nullable|string',
        ]);

        $table = CafeTable::where('code', $payload['table_code'])->where('is_active', true)->first();
        if (!$table) {
            return response()->json(['message' => 'Invalid table code'], 422);
        }

        DB::beginTransaction();
        try {
            // calculate subtotal
            $subtotal = 0;
            $order = new Order();
            $order->order_number = $this->generateOrderNumber();
            $order->cafe_table_id = $table->id;
            $order->table_code = $table->code;
            $order->customer_name = $payload['customer_name'] ?? null;
            $order->customer_note = $payload['customer_note'] ?? null;
            $order->status = 'pending';
            $order->ordered_at = now();
            $order->save();

            foreach ($payload['items'] as $it) {
                $menu = MenuItem::find($it['menu_item_id']);
                if (!$menu || !$menu->is_available) {
                    DB::rollBack();
                    return response()->json(['message' => 'Menu item not available: ' . ($menu?->name ?? $it['menu_item_id'])], 422);
                }
                $qty = (int) $it['quantity'];
                $price = $menu->price;
                $lineSubtotal = $price * $qty;
                $subtotal += $lineSubtotal;

                $orderItem = new OrderItem();
                $orderItem->order_id = $order->id;
                $orderItem->menu_item_id = $menu->id;
                $orderItem->menu_name_snapshot = $menu->name;
                $orderItem->price_snapshot = $menu->price;
                $orderItem->quantity = $qty;
                $orderItem->note = $it['note'] ?? null;
                $orderItem->subtotal = $lineSubtotal;
                $orderItem->save();
            }

            // basic tax/service/discount calculation (could be enhanced)
            $tax = 0;
            $service = 0;
            $discount = 0;
            $total = $subtotal + $tax + $service - $discount;

            $order->subtotal = $subtotal;
            $order->tax = $tax;
            $order->service_charge = $service;
            $order->discount = $discount;
            $order->total = $total;
            $order->save();

            DB::commit();

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'order' => [
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'table' => $table->name,
                    'total' => $order->total,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }

    public function getOrderStatus($order_number)
    {
        $order = Order::where('order_number', $order_number)->with(['items', 'cafeTable'])->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        return response()->json(['data' => $order]);
    }

    protected function generateOrderNumber()
    {
        $date = now()->format('Ymd');
        $count = Order::whereDate('created_at', now()->toDateString())->count() + 1;
        return sprintf('ORD-%s-%04d', $date, $count);
    }
}
