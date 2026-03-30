'use client';

import { useEffect, useState } from 'react';
import { getReservations } from '@/app/actions/reservations';

type Reservation = {
  id: number;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const today = new Date().toISOString().split('T')[0];

  async function load() {
    const result = await getReservations();
    if (result.success) setReservations(result.data as Reservation[]);
    setLoading(false);
  }

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

  const todayRes = reservations.filter(r => r.date === today);
  const pending = reservations.filter(r => r.status === 'în așteptare');
  const confirmed = reservations.filter(r => r.status === 'confirmat');

  const stats = [
    { label: 'Total', value: reservations.length, color: '#111827', href: '/admin/reservations?status=all' },
    { label: 'Today', value: todayRes.length, color: '#F97316', href: '/admin/reservations?status=today' },
    { label: 'Pending', value: pending.length, color: '#F97316', href: '/admin/reservations?status=pending' },
    { label: 'Confirmed', value: confirmed.length, color: '#14B8A6', href: '/admin/reservations?status=confirmed' },
  ];

  const upcoming = reservations
    .filter(r => r.date >= today && r.status !== 'respins')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
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

      {/* TODAY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Today's Reservations</h2>
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
