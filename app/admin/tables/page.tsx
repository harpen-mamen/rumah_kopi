'use client';

import { useEffect, useState } from 'react';

type CafeTable = {
  id: number;
  name: string;
  code: string;
  number: number | null;
  location: string | null;
  capacity: number | null;
  is_active: boolean;
};

export default function AdminTablesPage() {
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [origin] = useState(() => typeof window === 'undefined' ? '' : window.location.origin);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', code: '', number: '', location: '', capacity: '' });

  async function load() {
    setLoading(true);
    const res = await fetch('/api/tables');
    const data = await res.json();
    if (data.success) setTables(data.data as CafeTable[]);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function createTable() {
    if (!form.name.trim()) return;
    await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', code: '', number: '', location: '', capacity: '' });
    await load();
  }

  async function toggleTable(table: CafeTable) {
    await fetch('/api/tables', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: table.id, is_active: !table.is_active }),
    });
    await load();
  }

  async function deleteTable(id: number) {
    if (!confirm('Delete this table?')) return;
    await fetch(`/api/tables?id=${id}`, { method: 'DELETE' });
    await load();
  }

  function tableUrl(code: string) {
    return `${origin || 'http://localhost:3000'}/table/${code}`;
  }

  function qrUrl(code: string) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(tableUrl(code))}`;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tables & QR Codes</h1>
        <p className="text-gray-500 text-sm mt-1">Setiap QR membuka halaman order untuk meja tersebut.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-200 grid md:grid-cols-6 gap-3">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Table name"
          className="md:col-span-2 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          style={{ border: '1px solid #e5e7eb' }} />
        <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
          placeholder="Code (optional)"
          className="px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          style={{ border: '1px solid #e5e7eb' }} />
        <input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })}
          placeholder="Number"
          className="px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          style={{ border: '1px solid #e5e7eb' }} />
        <input value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })}
          placeholder="Capacity"
          className="px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          style={{ border: '1px solid #e5e7eb' }} />
        <button onClick={createTable}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#F97316' }}>
          Add Table
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200 text-gray-400">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tables.map(table => (
            <div key={table.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">{table.name}</h2>
                  <p className="text-sm text-gray-500">{table.code}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    No. {table.number || '-'} · Capacity {table.capacity || '-'}
                  </p>
                </div>
                <button onClick={() => toggleTable(table)}
                  className="h-8 px-3 rounded-full text-xs font-semibold"
                  style={table.is_active ? { background: '#14B8A61a', color: '#0D9488' } : { background: '#EF44441a', color: '#EF4444' }}>
                  {table.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="flex gap-4 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl(table.code)} alt={`QR ${table.name}`} className="w-28 h-28 rounded-xl border border-gray-100" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-1">QR URL</p>
                  <a href={tableUrl(table.code)} target="_blank" rel="noreferrer"
                    className="block text-sm text-amber-600 font-medium truncate">
                    {tableUrl(table.code)}
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(tableUrl(table.code))}
                    className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100">
                    Copy link
                  </button>
                </div>
              </div>

              <button onClick={() => deleteTable(table.id)}
                className="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
