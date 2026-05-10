'use client';

import { useEffect, useState } from 'react';
import { getReservations } from '@/app/actions/reservations';
import { formatPrice } from '@/lib/public-content';

type Reservation = {
  id: number;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
};

type MenuItem = {
  id: number;
  category: string;
  available: boolean;
};

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  ordered_at: string;
  item_count: number;
};

type CafeTable = {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const STATUS_COLORS: Record<string, string> = {
  'în așteptare': '#F97316',
  'confirmat': '#14B8A6',
  'respins': '#EF4444',
};
const STATUS_BG: Record<string, string> = {
  'în așteptare': 'rgba(249,115,22,0.1)',
  'confirmat': 'rgba(20,184,166,0.1)',
  'respins': 'rgba(239,68,68,0.1)',
};

function ReservationCard({ r, onAction, actionLoading }: {
  r: Reservation;
  onAction: (id: number, status: string) => void;
  actionLoading: number | null;
}) {
  const busy = actionLoading === r.id;
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-gray-800">{r.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {formatDate(r.date)} · {r.time} · {r.guests} {r.guests === 1 ? 'guest' : 'guests'}
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ml-2"
          style={{ color: STATUS_COLORS[r.status], background: STATUS_BG[r.status] }}>
          {r.status}
        </span>
      </div>
      {r.status === 'în așteptare' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onAction(r.id, 'confirmat')}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform"
            style={{ background: '#14B8A6' }}>
            {busy ? '...' : '✓ Confirm'}
          </button>
          <button
            onClick={() => onAction(r.id, 'respins')}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform"
            style={{ background: '#EF4444' }}>
            {busy ? '...' : '✕ Reject'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMenu, setAddingMenu] = useState(false);
  const [quickMenu, setQuickMenu] = useState({ category: '', name: '', description: '', price: '' });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const today = new Date().toISOString().split('T')[0];

  async function load() {
    setLoading(true);
    const [result, menuRes, ordersRes, tablesRes] = await Promise.all([
      getReservations(),
      fetch('/api/menu').then((res) => res.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/orders').then((res) => res.json()).catch(() => ({ success: false, data: [] })),
      fetch('/api/tables').then((res) => res.json()).catch(() => ({ success: false, data: [] })),
    ]);

    if (result.success) setReservations(result.data as Reservation[]);
    if (menuRes.success) setMenuItems(menuRes.data as MenuItem[]);
    if (ordersRes.success) setOrders(ordersRes.data as Order[]);
    if (tablesRes.success) setTables(tablesRes.data as CafeTable[]);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  async function handleAction(id: number, status: string) {
    setActionLoading(id);
    await fetch('/api/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    await load();
    setActionLoading(null);
  }

  async function addQuickMenu() {
    if (!quickMenu.name.trim() || !quickMenu.price) return;
    setAddingMenu(true);
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: quickMenu.category || 'Coffee',
        name: quickMenu.name,
        description: quickMenu.description,
        price: Number(quickMenu.price),
      }),
    });
    setQuickMenu({ category: quickMenu.category, name: '', description: '', price: '' });
    await load();
    setAddingMenu(false);
  }

  const todayRes = reservations.filter(r => r.date === today);
  const pending = reservations.filter(r => r.status === 'în așteptare');
  const confirmed = reservations.filter(r => r.status === 'confirmat');
  const availableMenu = menuItems.filter(item => item.available);
  const unavailableMenu = menuItems.filter(item => !item.available);
  const menuCategories = new Set(menuItems.map(item => item.category));
  const activeTables = tables.filter(table => table.is_active);
  const activeOrders = orders.filter(order => !['completed', 'cancelled'].includes(order.status));
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const todayOrders = orders.filter(order => order.ordered_at?.slice(0, 10) === today);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);

  const stats = [
    { label: 'Bookings', value: reservations.length, color: '#111827', href: '/admin/reservations?status=all' },
    { label: 'Today Booking', value: todayRes.length, color: '#F97316', href: '/admin/reservations?status=today' },
    { label: 'Booking Pending', value: pending.length, color: '#F97316', href: '/admin/reservations?status=pending' },
    { label: 'Confirmed', value: confirmed.length, color: '#14B8A6', href: '/admin/reservations?status=confirmed' },
    { label: 'Active Orders', value: activeOrders.length, color: '#111827', href: '/admin/orders' },
    { label: 'New Orders', value: pendingOrders.length, color: '#F97316', href: '/admin/orders' },
    { label: 'Preparing', value: preparingOrders.length, color: '#3B82F6', href: '/admin/orders' },
    { label: 'Today Revenue', value: formatPrice(todayRevenue), color: '#14B8A6', href: '/admin/orders' },
    { label: 'Menu Items', value: menuItems.length, color: '#111827', href: '/admin/menu' },
    { label: 'Available', value: availableMenu.length, color: '#14B8A6', href: '/admin/menu' },
    { label: 'Hidden Menu', value: unavailableMenu.length, color: '#EF4444', href: '/admin/menu' },
    { label: 'Categories', value: menuCategories.size, color: '#F97316', href: '/admin/menu' },
    { label: 'QR Tables', value: activeTables.length, color: '#14B8A6', href: '/admin/tables' },
  ];

  const upcoming = reservations
    .filter(r => r.date >= today && r.status !== 'respins')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);
  const recentOrders = orders
    .filter(order => !['completed', 'cancelled'].includes(order.status))
    .slice(0, 5);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all" title="Refresh">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map(({ label, value, color, href }) => (
          <a key={label} href={href}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 text-center hover:shadow-md hover:border-gray-300 active:scale-95 transition-all">
            <div className="text-3xl font-bold mb-1" style={{ color }}>{loading ? '—' : value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </a>
        ))}
      </div>

      {/* IDEAS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Admin Ideas</h2>
          <a href="/admin/menu/new" className="text-xs text-amber-500 font-medium">Tambah menu →</a>
        </div>
        <div className="p-4 grid gap-3 sm:grid-cols-3">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase">Reservation flow</div>
            <p className="text-sm text-gray-700 mt-2">
              {pending.length > 0
                ? `${pending.length} booking pending. Confirm cepat supaya customer dapat email status.`
                : 'Tidak ada booking pending. Flow reservasi sedang rapi.'}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase">Menu health</div>
            <p className="text-sm text-gray-700 mt-2">
              {unavailableMenu.length > 0
                ? `${unavailableMenu.length} item disembunyikan. Cek apakah ini stok kosong atau perlu promo pengganti.`
                : 'Semua menu aktif. Cocok untuk tampil penuh di halaman publik.'}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase">Today focus</div>
            <p className="text-sm text-gray-700 mt-2">
              {todayRes.length > 0
                ? `${todayRes.length} reservasi hari ini. Siapkan meja dan cek jam kedatangan berdekatan.`
                : 'Belum ada reservasi hari ini. Bisa dorong promo ringan di channel sosial.'}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase">Order queue</div>
            <p className="text-sm text-gray-700 mt-2">
              {activeOrders.length > 0
                ? `${activeOrders.length} order aktif. Prioritaskan status pending lalu preparing.`
                : 'Belum ada order aktif. Halaman order publik siap menerima pesanan.'}
            </p>
          </div>
        </div>
      </div>

      {/* QUICK ADD MENU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-900">Quick Add Menu</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tambah item cepat dari dashboard, tetap masuk ke CRUD menu.</p>
          </div>
          <a href="/admin/menu/new" className="text-xs text-amber-500 font-medium">Halaman tambah menu →</a>
        </div>
        <div className="p-4 grid md:grid-cols-5 gap-3">
          <input value={quickMenu.category} onChange={e => setQuickMenu({ ...quickMenu, category: e.target.value })}
            placeholder="Category"
            className="px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            style={{ border: '1px solid #e5e7eb' }} />
          <input value={quickMenu.name} onChange={e => setQuickMenu({ ...quickMenu, name: e.target.value })}
            placeholder="Menu name"
            className="px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            style={{ border: '1px solid #e5e7eb' }} />
          <input value={quickMenu.description} onChange={e => setQuickMenu({ ...quickMenu, description: e.target.value })}
            placeholder="Description"
            className="md:col-span-2 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            style={{ border: '1px solid #e5e7eb' }} />
          <div className="flex gap-2">
            <input type="number" value={quickMenu.price} onChange={e => setQuickMenu({ ...quickMenu, price: e.target.value })}
              placeholder="Price"
              className="min-w-0 flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              style={{ border: '1px solid #e5e7eb' }} />
            <button onClick={addQuickMenu} disabled={addingMenu || !quickMenu.name || !quickMenu.price}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: '#F97316' }}>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* TABLE QR */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">QR Tables</h2>
          <a href="/admin/tables" className="text-xs text-amber-500 font-medium">Manage QR →</a>
        </div>
        <div className="p-4 grid sm:grid-cols-3 gap-3">
          {activeTables.slice(0, 3).map(table => (
            <a key={table.id} href="/admin/tables" className="bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
              <div className="font-semibold text-gray-800">{table.name}</div>
              <div className="text-xs text-gray-400 mt-1">/table/{table.code}</div>
            </a>
          ))}
          {activeTables.length === 0 && <p className="text-sm text-gray-400">Belum ada meja aktif.</p>}
        </div>
      </div>

      {/* ORDERS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Active Orders</h2>
          <a href="/admin/orders" className="text-xs text-amber-500 font-medium">View all →</a>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No active orders.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map(order => (
                <a key={order.id} href="/admin/orders" className="bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-800">{order.order_number}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {order.customer_name} · {order.item_count} item · {order.status}
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">{formatPrice(order.total)}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TODAY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Today&apos;s Reservations</h2>
          <a href="/admin/reservations" className="text-xs text-amber-500 font-medium">View all →</a>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
          ) : todayRes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No reservations today.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {todayRes.map(r => (
                <ReservationCard key={r.id} r={r} onAction={handleAction} actionLoading={actionLoading} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* UPCOMING */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Upcoming</h2>
          <a href="/admin/reservations" className="text-xs text-amber-500 font-medium">View all →</a>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-6">Loading...</p>
          ) : upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No upcoming reservations.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map(r => (
                <ReservationCard key={r.id} r={r} onAction={handleAction} actionLoading={actionLoading} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
