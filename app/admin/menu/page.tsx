'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type MenuItem = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
};

export default function MenuAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({ category: 'Coffee', name: '', description: '', price: '' });
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  async function load() {
    const res = await fetch('/api/menu');
    const data = await res.json();
    if (data.success) setItems(data.data);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const categories = [...new Set(items.map(i => i.category))];

  async function updateItem(id: number, field: string, value: string | boolean | number) {
    setSaving(id);
    await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: value }),
    });
    await load();
    setSaving(null);
  }

  async function deleteItem(id: number) {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
    await load();
  }

  async function addItem() {
    if (!newItem.name || !newItem.price) return;
    setAdding(true);
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, price: parseFloat(newItem.price) }),
    });
    setNewItem({ category: newItem.category, name: '', description: '', price: '' });
    await load();
    setAdding(false);
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCategory.trim(), name: 'New Item', description: '', price: 0 }),
    });
    setNewCategory('');
    setShowAddCategory(false);
    await load();
  }

  async function deleteCategory(category: string) {
    if (!confirm(`Delete entire "${category}" category and all its items?`)) return;
    const catItems = items.filter(i => i.category === category);
    await Promise.all(catItems.map(i => fetch(`/api/menu?id=${i.id}`, { method: 'DELETE' })));
    await load();
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <svg className="animate-spin h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu & Prices</h1>
          <p className="text-gray-500 text-sm mt-1">Edit directly — changes save automatically</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/menu/new"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: '#F97316' }}>
            + Tambah Menu
          </Link>
          <button onClick={() => setShowAddCategory(!showAddCategory)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: '#14B8A6' }}>
            + Add Category
          </button>
        </div>
      </div>

      {/* ADD CATEGORY */}
      {showAddCategory && (
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-200 flex gap-3">
          <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
            placeholder="Category name (e.g. Cold Drinks)"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            style={{ border: '1px solid #e5e7eb', background: '#f9fafb' }} />
          <button onClick={addCategory}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#14B8A6' }}>Create</button>
          <button onClick={() => setShowAddCategory(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100">Cancel</button>
        </div>
      )}

      {/* CATEGORIES */}
      {categories.map(category => (
        <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          {/* Category header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="font-bold text-gray-800 text-lg">{category}</h2>
            <div className="flex gap-2">
              <button onClick={() => { setNewItem(p => ({ ...p, category })); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: '#14B8A6' }}>+ Product</button>
              <button onClick={() => deleteCategory(category)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                style={{ background: '#EF4444' }}>Delete Category</button>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Description', 'Price (Rp)', 'Available', ''].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.filter(i => i.category === category).map(item => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <input defaultValue={item.name}
                        onBlur={e => { if (e.target.value !== item.name) updateItem(item.id, 'name', e.target.value); }}
                        className="w-full px-3 py-1.5 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        style={{ border: '1px solid #e5e7eb', background: 'white', minWidth: 120 }} />
                    </td>
                    <td className="px-4 py-2.5">
                      <input defaultValue={item.description}
                        onBlur={e => { if (e.target.value !== item.description) updateItem(item.id, 'description', e.target.value); }}
                        className="w-full px-3 py-1.5 rounded-lg text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        style={{ border: '1px solid #e5e7eb', background: 'white', minWidth: 180 }} />
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="number" defaultValue={item.price} step="0.10" min="0"
                        onBlur={e => { if (parseFloat(e.target.value) !== item.price) updateItem(item.id, 'price', parseFloat(e.target.value)); }}
                        className="w-24 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        style={{ border: '1px solid #e5e7eb', background: 'white' }} />
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => updateItem(item.id, 'available', !item.available)}
                        className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${item.available ? 'bg-teal-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${item.available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => deleteItem(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      {saving === item.id && <span className="text-xs text-teal-500 ml-1">saving...</span>}
                    </td>
                  </tr>
                ))}

                {/* Add product row */}
                {newItem.category === category && (
                  <tr className="bg-amber-50/50 border-t border-amber-100">
                    <td className="px-4 py-2.5">
                      <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                        placeholder="Product name"
                        className="w-full px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        style={{ border: '1px solid #fcd34d', background: 'white', minWidth: 120 }} />
                    </td>
                    <td className="px-4 py-2.5">
                      <input value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                        placeholder="Description"
                        className="w-full px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        style={{ border: '1px solid #fcd34d', background: 'white', minWidth: 180 }} />
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="number" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                        placeholder="0.00" step="0.10" min="0"
                        className="w-24 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        style={{ border: '1px solid #fcd34d', background: 'white' }} />
                    </td>
                    <td className="px-4 py-2.5" />
                    <td className="px-4 py-2.5">
                      <button onClick={addItem} disabled={adding || !newItem.name || !newItem.price}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                        style={{ background: '#F97316' }}>
                        {adding ? '...' : 'Add'}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
