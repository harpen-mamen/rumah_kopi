'use client';

import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import FooterStarter from '@/components/FooterStarter';
import { formatPrice } from '@/lib/public-content';

type MenuItem = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
};

type CartItem = {
  menu_item_id: number;
  quantity: number;
  note: string;
};

type CafeTable = {
  id: number;
  name: string;
  code: string;
  location: string | null;
};

export default function OrderPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [table, setTable] = useState<CafeTable | null>(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadMenu() {
    setLoading(true);
    const tableCode = new URLSearchParams(window.location.search).get('table');
    if (tableCode) {
      const tableRes = await fetch(`/api/tables?code=${encodeURIComponent(tableCode)}`);
      const tableData = await tableRes.json();
      if (tableData.success) setTable(tableData.data as CafeTable);
    }

    const res = await fetch('/api/menu');
    const data = await res.json();
    if (data.success) {
      const available = (data.data as MenuItem[]).filter(item => item.available);
      setItems(available);
      setActiveCategory(available[0]?.category || '');
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadMenu(); }, []);

  const categories = useMemo(() => [...new Set(items.map(item => item.category))], [items]);
  const visibleItems = items.filter(item => item.category === activeCategory);
  const cartDetails = cart
    .map(line => {
      const menu = items.find(item => item.id === line.menu_item_id);
      if (!menu) return null;
      return { ...line, menu, subtotal: menu.price * line.quantity };
    })
    .filter(Boolean) as Array<CartItem & { menu: MenuItem; subtotal: number }>;
  const total = cartDetails.reduce((sum, line) => sum + line.subtotal, 0);

  function addItem(item: MenuItem) {
    setCart(current => {
      const existing = current.find(line => line.menu_item_id === item.id);
      if (existing) {
        return current.map(line => line.menu_item_id === item.id ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, { menu_item_id: item.id, quantity: 1, note: '' }];
    });
  }

  function updateQuantity(id: number, quantity: number) {
    if (quantity <= 0) {
      setCart(current => current.filter(line => line.menu_item_id !== id));
      return;
    }
    setCart(current => current.map(line => line.menu_item_id === id ? { ...line, quantity } : line));
  }

  async function submitOrder() {
    setMessage('');
    if (!customer.name.trim() || !customer.phone.trim() || cart.length === 0) {
      setMessage('Isi nama, nomor telepon, dan minimal 1 menu.');
      return;
    }

    setSaving(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_note: customer.note,
        table_code: table?.code || '',
        items: cart,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (data.success) {
      setCart([]);
      setCustomer({ name: '', phone: '', note: '' });
      setMessage(`Order ${data.data.order_number} diterima${data.data.table_name ? ` untuk ${data.data.table_name}` : ''}. Total: ${formatPrice(data.data.total)}.`);
    } else {
      setMessage(data.message || 'Order belum bisa diproses.');
    }
  }

  return (
    <>
      <Navigation />

      <section className="min-h-screen pt-28 pb-16 px-4 sm:px-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <span className="handwrite text-4xl text-amber-500 block mb-1">Fresh from the bar</span>
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">Order Menu</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              {table
                ? `Pesanan untuk ${table.name}${table.location ? ` · ${table.location}` : ''}.`
                : 'Pilih menu, kirim order, lalu admin akan melihat pesanan masuk di dashboard.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
            <div>
              <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                    style={activeCategory === category
                      ? { background: '#F97316', color: 'white' }
                      : { background: 'white', color: '#4b5563', border: '1px solid #e5e7eb' }}>
                    {category}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">Loading menu...</div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visibleItems.map(item => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                      <div className="flex justify-between gap-4 mb-2">
                        <h2 className="font-bold text-gray-900">{item.name}</h2>
                        <span className="font-bold text-amber-500">{formatPrice(item.price)}</span>
                      </div>
                      <p className="text-sm text-gray-500 min-h-10">{item.description || 'Freshly prepared by our barista team.'}</p>
                      <button
                        onClick={() => addItem(item)}
                        className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-all"
                        style={{ background: '#14B8A6' }}>
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-24">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Your Order</h2>
                <p className="text-xs text-gray-400">{cartDetails.length} item selected</p>
              </div>
              <div className="p-5">
                {cartDetails.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">Cart masih kosong.</p>
                ) : (
                  <div className="flex flex-col gap-3 mb-5">
                    {cartDetails.map(line => (
                      <div key={line.menu_item_id} className="border border-gray-100 rounded-xl p-3">
                        <div className="flex justify-between gap-3">
                          <div>
                            <div className="font-semibold text-sm text-gray-800">{line.menu.name}</div>
                            <div className="text-xs text-gray-400">{formatPrice(line.menu.price)} each</div>
                          </div>
                          <div className="font-bold text-sm text-gray-900">{formatPrice(line.subtotal)}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button onClick={() => updateQuantity(line.menu_item_id, line.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold">−</button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-800">{line.quantity}</span>
                          <button onClick={() => updateQuantity(line.menu_item_id, line.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <input
                    value={customer.name}
                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Nama customer"
                    className="px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={{ border: '1px solid #e5e7eb' }}
                  />
                  <input
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="Nomor telepon"
                    className="px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={{ border: '1px solid #e5e7eb' }}
                  />
                  <textarea
                    value={customer.note}
                    onChange={e => setCustomer({ ...customer, note: e.target.value })}
                    placeholder="Catatan order (opsional)"
                    rows={3}
                    className="px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    style={{ border: '1px solid #e5e7eb' }}
                  />
                </div>

                <div className="flex justify-between items-center py-4 mt-2 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-500">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
                </div>

                {message && <p className="text-sm text-center mb-3 text-gray-600">{message}</p>}

                <button
                  onClick={submitOrder}
                  disabled={saving || cartDetails.length === 0}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 active:scale-95 transition-all"
                  style={{ background: '#F97316' }}>
                  {saving ? 'Sending...' : 'Send Order'}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <FooterStarter />
    </>
  );
}
