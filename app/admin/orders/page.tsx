'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/public-content';

type OrderItem = {
  id: number;
  menu_name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  subtotal: number;
  note: string | null;
};

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_note: string | null;
  table_code: string | null;
  table_name: string | null;
  total: number;
  status: string;
  ordered_at: string;
  item_count: number;
  items: OrderItem[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#F97316',
  confirmed: '#14B8A6',
  preparing: '#3B82F6',
  ready: '#22C55E',
  completed: '#111827',
  cancelled: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [busy, setBusy] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/orders');
    const data = await res.json();
    if (data.success) setOrders(data.data as Order[]);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  async function changeStatus(id: number, status: string) {
    setBusy(id);
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    await load();
    setBusy(null);
  }

  async function deleteOrder(id: number) {
    if (!confirm('Delete this order?')) return;
    setBusy(id);
    await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
    await load();
    setBusy(null);
  }

  const filtered = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['completed', 'cancelled'].includes(order.status);
    return order.status === filter;
  });

  const counts = {
    active: orders.filter(order => !['completed', 'cancelled'].includes(order.status)).length,
    pending: orders.filter(order => order.status === 'pending').length,
    preparing: orders.filter(order => order.status === 'preparing').length,
    ready: orders.filter(order => order.status === 'ready').length,
    all: orders.length,
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer menu orders</p>
        </div>
        <button onClick={load}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#14B8A6' }}>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { key: 'active', label: 'Active', value: counts.active, color: '#111827' },
          { key: 'pending', label: 'Pending', value: counts.pending, color: '#F97316' },
          { key: 'preparing', label: 'Preparing', value: counts.preparing, color: '#3B82F6' },
          { key: 'ready', label: 'Ready', value: counts.ready, color: '#22C55E' },
          { key: 'all', label: 'All', value: counts.all, color: '#6B7280' },
        ].map(item => (
          <button key={item.key} onClick={() => setFilter(item.key)}
            className="bg-white rounded-2xl p-4 text-center shadow-sm border transition-all"
            style={{ borderColor: filter === item.key ? item.color : '#e5e7eb', borderWidth: filter === item.key ? 2 : 1 }}>
            <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
            <div className="text-xs text-gray-500 mt-1">{item.label}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200 text-gray-400">No orders found.</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-gray-900">{order.order_number}</h2>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ color: STATUS_COLORS[order.status], background: `${STATUS_COLORS[order.status]}18` }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.customer_name} · {order.customer_phone} · {order.table_name || order.table_code || 'No table'} · {order.item_count} item
                  </p>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatPrice(order.total)}</div>
              </div>

              <div className="p-5 grid lg:grid-cols-[1fr_auto] gap-5">
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-700">
                        {item.quantity}× {item.menu_name_snapshot}
                        {item.note && <span className="text-gray-400"> · {item.note}</span>}
                      </span>
                      <span className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                  {order.customer_note && (
                    <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">Note: {order.customer_note}</p>
                  )}
                </div>

                <div className="flex flex-wrap lg:flex-col gap-2">
                  {['confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map(status => (
                    <button key={status}
                      onClick={() => changeStatus(order.id, status)}
                      disabled={busy === order.id || order.status === status}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40"
                      style={{ background: STATUS_COLORS[status] }}>
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                  <button onClick={() => deleteOrder(order.id)}
                    disabled={busy === order.id}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 disabled:opacity-40">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
