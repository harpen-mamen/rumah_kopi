'use client';

import { useEffect, useState } from 'react';
import { getReservations } from '@/app/actions/reservations';

type Reservation = {
  id: number;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  status: string;
  created_at: string;
};

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

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ReservationsAdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const result = await getReservations();
    if (result.success) setReservations(result.data as Reservation[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function changeStatus(id: number, status: string) {
    setActionLoading(id);
    await fetch('/api/reservations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    await load();
    setActionLoading(null);
  }

  async function deleteReservation(id: number) {
    if (!confirm('Delete this reservation?')) return;
    setActionLoading(id);
    await fetch(`/api/reservations?id=${id}`, { method: 'DELETE' });
    await load();
    setActionLoading(null);
  }

  const filtered = reservations.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: reservations.length,
    'în așteptare': reservations.filter(r => r.status === 'în așteptare').length,
    confirmat: reservations.filter(r => r.status === 'confirmat').length,
    respins: reservations.filter(r => r.status === 'respins').length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all reservations</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', key: 'all', color: '#111827' },
          { label: 'Pending', key: 'în așteptare', color: '#F97316' },
          { label: 'Confirmed', key: 'confirmat', color: '#14B8A6' },
          { label: 'Rejected', key: 'respins', color: '#EF4444' },
        ].map(({ label, key, color }) => (
          <div key={key}
            className="bg-white rounded-2xl p-4 text-center cursor-pointer shadow-sm border transition-all"
            onClick={() => setFilterStatus(key)}
            style={{ borderColor: filterStatus === key ? color : '#e5e7eb', borderWidth: filterStatus === key ? 2 : 1 }}>
            <div className="text-2xl font-bold" style={{ color }}>{counts[key as keyof typeof counts]}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3 shadow-sm border border-gray-200">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm text-gray-800 focus:outline-none"
          style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <option value="all">All statuses</option>
          <option value="în așteptare">Pending</option>
          <option value="confirmat">Confirmed</option>
          <option value="respins">Rejected</option>
        </select>
        <button onClick={load} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: '#14B8A6' }}>↻ Refresh</button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200">
          <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-amber-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-200">
          <p className="text-gray-400">No reservations found.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden sm:block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Name', 'Contact', 'Date & Time', 'Guests', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 font-semibold text-gray-800">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="text-sm">{r.email}</div>
                      <div className="text-xs text-gray-400">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-700">{formatDate(r.date)}</div>
                      <div className="text-xs text-gray-400">{r.time}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 font-medium">{r.guests}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ color: STATUS_COLORS[r.status], background: STATUS_BG[r.status] }}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {r.status !== 'confirmat' && (
                          <button onClick={() => changeStatus(r.id, 'confirmat')}
                            disabled={actionLoading === r.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                            style={{ background: '#14B8A6' }}>✓</button>
                        )}
                        {r.status !== 'respins' && (
                          <button onClick={() => changeStatus(r.id, 'respins')}
                            disabled={actionLoading === r.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                            style={{ background: '#F97316' }}>✕</button>
                        )}
                        <button onClick={() => deleteReservation(r.id)}
                          disabled={actionLoading === r.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                          style={{ background: '#EF4444' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="sm:hidden flex flex-col gap-3">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-gray-800">{r.name}</div>
                    <div className="text-xs text-gray-400">{r.email}</div>
                    <div className="text-xs text-gray-400">{r.phone}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ color: STATUS_COLORS[r.status], background: STATUS_BG[r.status] }}>
                    {r.status}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500 mb-3">
                  <span>📅 {formatDate(r.date)}</span>
                  <span>🕐 {r.time}</span>
                  <span>👥 {r.guests}</span>
                </div>
                <div className="flex gap-2">
                  {r.status !== 'confirmat' && (
                    <button onClick={() => changeStatus(r.id, 'confirmat')} disabled={actionLoading === r.id}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                      style={{ background: '#14B8A6' }}>✓ Confirm</button>
                  )}
                  {r.status !== 'respins' && (
                    <button onClick={() => changeStatus(r.id, 'respins')} disabled={actionLoading === r.id}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                      style={{ background: '#F97316' }}>✕ Reject</button>
                  )}
                  <button onClick={() => deleteReservation(r.id)} disabled={actionLoading === r.id}
                    className="py-2 px-3 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: '#EF4444' }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="text-center text-gray-400 text-xs mt-6">
        {filtered.length} reservation{filtered.length !== 1 ? 's' : ''} shown
      </p>
    </div>
  );
}
