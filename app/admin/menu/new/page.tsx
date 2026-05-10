'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type MenuItem = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
};

type FormState = {
  category: string;
  customCategory: string;
  name: string;
  description: string;
  price: string;
  available: boolean;
};

const INITIAL_FORM: FormState = {
  category: '',
  customCategory: '',
  name: '',
  description: '',
  price: '',
  available: true,
};

export default function AddMenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = useMemo(() => [...new Set(items.map(item => item.category))], [items]);
  const selectedCategory = form.customCategory.trim() || form.category;
  const canSave = selectedCategory.trim() && form.name.trim() && form.price !== '' && !Number.isNaN(Number(form.price));

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        const firstCategory = data.data[0]?.category || 'Coffee';
        setForm(prev => ({ ...prev, category: firstCategory }));
      }
      setLoading(false);
    }

    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave || saving) return;

    setSaving(true);
    setError('');

    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: selectedCategory.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        available: form.available,
      }),
    });

    const data = await res.json().catch(() => ({ success: false, message: 'Gagal menyimpan menu.' }));
    if (!res.ok || !data.success) {
      setError(data.message || 'Gagal menyimpan menu.');
      setSaving(false);
      return;
    }

    router.push('/admin/menu');
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Menu</h1>
          <p className="text-gray-500 text-sm mt-1">Tambah item baru untuk Cafe Tortuga, lalu menu langsung tampil di halaman publik jika tersedia.</p>
        </div>
        <Link
          href="/admin/menu"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
        >
          Lihat daftar menu
        </Link>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Detail Menu</h2>
          <p className="text-xs text-gray-400 mt-0.5">Nama, kategori, deskripsi, dan harga bisa diedit lagi kapan saja.</p>
        </div>

        <div className="p-5 grid gap-5 max-w-3xl">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Kategori</span>
              <select
                value={form.category}
                onChange={e => setForm(prev => ({ ...prev, category: e.target.value, customCategory: '' }))}
                disabled={loading}
                className="px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
                style={{ border: '1px solid #e5e7eb', background: 'white' }}
              >
                {categories.length === 0 && <option value="Coffee">Coffee</option>}
                {categories.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Kategori baru</span>
              <input
                value={form.customCategory}
                onChange={e => setForm(prev => ({ ...prev, customCategory: e.target.value }))}
                placeholder="Opsional, contoh: Signature"
                className="px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                style={{ border: '1px solid #e5e7eb' }}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nama menu</span>
            <input
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Tortuga Signature Latte"
              className="px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              style={{ border: '1px solid #e5e7eb' }}
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Deskripsi</span>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Rasa, bahan utama, atau catatan penyajian."
              rows={4}
              className="px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              style={{ border: '1px solid #e5e7eb' }}
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Harga</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="px-4 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                style={{ border: '1px solid #e5e7eb' }}
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <input
                type="checkbox"
                checked={form.available}
                onChange={e => setForm(prev => ({ ...prev, available: e.target.checked }))}
                className="h-4 w-4 accent-amber-500"
              />
              <span className="text-sm font-medium text-gray-700">Tersedia dan tampil di menu publik</span>
            </label>
          </div>
        </div>

        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/menu"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 text-center hover:bg-gray-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={!canSave || saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#F97316' }}
          >
            {saving ? 'Menyimpan...' : 'Simpan menu'}
          </button>
        </div>
      </form>
    </div>
  );
}
