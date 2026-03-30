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

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function load() {
      const result = await getReservations();
      if (result.success) setReservations(result.data as Reservation[]);
      setLoading(false);
    }
    load();
  }, []);

  const todayRes = reservations.filter(r => r.date === today);
  const pending = reservations.filter(r => r.status === 'în așteptare');
  const confirmed = reservations.filter(r => r.status === 'confirmat');

  const stats = [
    { label: 'Total Reservations', value: reservations.length, color: '#111827', bg: '#f9fafb' },
    { label: "Today's Bookings", value: todayRes.length, color: '#F97316', bg: 'rgba(249,115,22,0.08)' },
    { label: 'Pending', value: pending.length, color: '#F97316', bg: 'rgba(249,115,22,0.08)' },
    { label: 'Confirmed', value: confirmed.length, color: '#14B8A6', bg: 'rgba(20,184,166,0.08)' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <div className="text-3xl font-bold mb-1" style={{ color }}>{loading ? '—' : value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* TODAY'S RESERVATIONS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">Today's Reservations</h2>
          <a href="/admin/reservations" className="text-sm text-amber-500 hover:text-amber-600 font-medium">View all →</a>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : todayRes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No reservations today.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {todayRes.map(r => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                    <span className="text-gray-400 text-xs ml-2">{r.time} · {r.guests} guests</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ color: STATUS_COLORS[r.status], background: STATUS_BG[r.status] }}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* UPCOMING */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Upcoming Reservations</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {reservations
                .filter(r => r.date >= today && r.status !== 'respins')
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 5)
                .map(r => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                      <span className="text-gray-400 text-xs ml-2">{formatDate(r.date)} · {r.time} · {r.guests} guests</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ color: STATUS_COLORS[r.status], background: STATUS_BG[r.status] }}>
                      {r.status}
                    </span>
                  </div>
                ))}
              {reservations.filter(r => r.date >= today && r.status !== 'respins').length === 0 && (
                <p className="text-gray-400 text-sm text-center py-8">No upcoming reservations.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
