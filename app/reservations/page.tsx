'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import FooterStarter from '@/components/FooterStarter';

// Time slots: 10:00 – 22:00, every 30 min
const timeSlots: string[] = [];
for (let h = 10; h <= 21; h++) {
  timeSlots.push(`${String(h).padStart(2, '0')}:00`);
  timeSlots.push(`${String(h).padStart(2, '0')}:30`);
}
timeSlots.push('22:00');

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}
function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function formatShort(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number) { return (new Date(y, m, 1).getDay() + 6) % 7; }

export default function ReservationsPage() {
  const todayDate = new Date();
  const todayStr = toDateStr(todayDate);
  const maxDate = new Date(todayDate);
  maxDate.setMonth(maxDate.getMonth() + 6);
  const maxDateStr = toDateStr(maxDate);

  const [calYear, setCalYear] = useState(todayDate.getFullYear());
  const [calMonth, setCalMonth] = useState(todayDate.getMonth());
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', guests: '2' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Quick day buttons: next 14 days
  const quickDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() + i);
    return toDateStr(d);
  });

  function selectDate(d: string) {
    if (d < todayStr || d > maxDateStr) return;
    setDate(d);
  }

  const canGoPrev = !(calYear === todayDate.getFullYear() && calMonth === todayDate.getMonth());
  const canGoNext = !(calYear === maxDate.getFullYear() && calMonth === maxDate.getMonth());

  function prevMonth() {
    if (!canGoPrev) return;
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (!canGoNext) return;
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  const calCells: (number | null)[] = [
    ...Array(getFirstDay(calYear, calMonth)).fill(null),
    ...Array.from({ length: getDaysInMonth(calYear, calMonth) }, (_, i) => i + 1),
  ];

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, guests: Number(form.guests), date, time }),
      });
      const data = await res.json();
      if (data.success) setSubmitted(true);
      else setError(data.message);
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  }

  function reset() {
    setStep(1); setDate(''); setTime('');
    setForm({ name: '', email: '', phone: '', guests: '2' });
    setSubmitted(false); setError('');
  }

  return (
    <>
      <Navigation />

      {/* HERO */}
      <div className="relative flex items-center min-h-[50vh] overflow-hidden pt-20">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/hero-coffee.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 text-white">
          <div className="max-w-2xl">
            <span className="handwrite text-4xl sm:text-5xl block mb-2" style={{ color: '#FFF8F0', textShadow: '2px 4px 12px rgba(0,0,0,0.8)' }}>
              A table for you
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight"
              style={{ color: '#FFF8F0', fontFamily: 'var(--font-playfair), Georgia, serif', textShadow: '0 4px 24px rgba(0,0,0,0.6)' }}>
              Reserve a Table
            </h1>
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase" style={{ color: '#FFF8F0', textShadow: '2px 4px 12px rgba(0,0,0,0.8)' }}>
              Secure your spot · We'll take care of the rest
            </p>
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <section
        className="min-h-screen py-12 sm:py-20 px-4 sm:px-6"
        style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0f766e 50%, #134e4a 100%)' }}
      >
        <div className="max-w-lg mx-auto w-full">

          {submitted ? (
            /* SUCCESS */
            <div className="glass rounded-3xl p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(249,115,22,0.15)', border: '2px solid rgba(249,115,22,0.4)' }}>
                <svg className="w-8 h-8" fill="none" stroke="#F97316" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Rezervare confirmată!</h2>
              <p className="text-gray-600 text-base mb-1">
                Mulțumim, <span className="font-semibold text-gray-800">{form.name}</span>.
              </p>
              <p className="text-gray-600 text-sm mb-8">
                Masă pentru <strong>{form.guests} {Number(form.guests) === 1 ? 'persoană' : 'persoane'}</strong><br />
                <strong>{formatDate(date)}</strong> la <strong>{time}</strong><br />
                Confirmare trimisă la <strong>{form.email}</strong>
              </p>
              <button onClick={reset}
                className="px-8 py-3 text-white font-semibold rounded-full transition-all"
                style={{ background: '#F97316' }}>
                Rezervare nouă
              </button>
            </div>
          ) : (
            <div className="glass rounded-3xl overflow-hidden shadow-2xl">

              {/* PROGRESS */}
              <div className="flex">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`flex-1 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold transition-colors border-b-2 ${
                    step === s
                      ? 'border-b-2 text-white'
                      : step > s
                      ? 'text-teal-700 border-teal-200'
                      : 'text-gray-400 border-transparent'
                  }`}
                  style={step === s ? { borderBottomColor: '#F97316', background: 'rgba(249,115,22,0.08)', color: '#F97316' } : {}}>
                    {step > s ? '✓ ' : `${s}. `}
                    {s === 1 ? 'Date' : s === 2 ? 'Time' : 'Details'}
                  </div>
                ))}
              </div>

              <div className="p-5 sm:p-8">

                {/* STEP 1 — DATE */}
                {step === 1 && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Choose a date</h2>
                    <p className="text-gray-500 text-sm mb-5">When would you like to visit?</p>

                    {/* Quick buttons */}
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
                      {quickDays.map((d) => {
                        const dObj = new Date(d + 'T00:00:00');
                        const isToday = d === todayStr;
                        const isSelected = date === d;
                        return (
                          <button key={d} onClick={() => selectDate(d)}
                            className="flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-semibold transition-all"
                            style={isSelected
                              ? { background: '#14B8A6', color: 'white', borderColor: '#14B8A6' }
                              : { background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.4)', color: '#374151' }}>
                            <span>{isToday ? 'Today' : dObj.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                            <span className="text-base font-bold">{dObj.getDate()}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Calendar */}
                    <div className="rounded-2xl overflow-hidden mb-5" style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)' }}>
                      {/* Month nav */}
                      <div className="flex items-center justify-between px-4 py-3" style={{ background: 'rgba(255,255,255,0.4)' }}>
                        <button onClick={prevMonth} disabled={!canGoPrev}
                          className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                          style={{ background: canGoPrev ? 'rgba(20,184,166,0.15)' : 'transparent' }}>
                          <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="font-semibold text-gray-800 text-sm">{MONTH_NAMES[calMonth]} {calYear}</span>
                        <button onClick={nextMonth} disabled={!canGoNext}
                          className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                          style={{ background: canGoNext ? 'rgba(20,184,166,0.15)' : 'transparent' }}>
                          <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      {/* Day labels */}
                      <div className="grid grid-cols-7 border-b border-white/30">
                        {DAY_LABELS.map(l => (
                          <div key={l} className="py-2 text-center text-xs font-semibold text-teal-700">{l}</div>
                        ))}
                      </div>
                      {/* Days */}
                      <div className="grid grid-cols-7 p-1">
                        {calCells.map((day, i) => {
                          if (!day) return <div key={`e-${i}`} />;
                          const dStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isDisabled = dStr < todayStr || dStr > maxDateStr;
                          const isSelected = dStr === date;
                          const isToday = dStr === todayStr;
                          return (
                            <button key={dStr} onClick={() => !isDisabled && selectDate(dStr)} disabled={isDisabled}
                              className="aspect-square flex items-center justify-center text-xs sm:text-sm font-medium m-0.5 rounded-lg transition-all"
                              style={isSelected
                                ? { background: '#14B8A6', color: 'white' }
                                : isToday
                                ? { border: '2px solid #14B8A6', color: '#0D9488' }
                                : isDisabled
                                ? { color: '#d1d5db', cursor: 'not-allowed' }
                                : { color: '#374151' }}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {date && (
                      <p className="text-sm font-semibold mb-4" style={{ color: '#0D9488' }}>{formatDate(date)}</p>
                    )}

                    <button onClick={() => setStep(2)} disabled={!date}
                      className="w-full py-4 text-white font-bold text-base rounded-xl transition-all disabled:opacity-40"
                      style={{ background: date ? '#14B8A6' : '#d1d5db' }}>
                      Continue →
                    </button>
                  </div>
                )}

                {/* STEP 2 — TIME */}
                {step === 2 && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Choose a time</h2>
                    <p className="text-gray-500 text-sm mb-5">{formatDate(date)}</p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6 max-h-72 overflow-y-auto pr-1">
                      {timeSlots.map((slot) => (
                        <button key={slot} onClick={() => setTime(slot)}
                          className="py-2.5 rounded-xl text-sm font-semibold transition-all border"
                          style={time === slot
                            ? { background: '#14B8A6', color: 'white', borderColor: '#14B8A6' }
                            : { background: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.5)', color: '#374151' }}>
                          {slot}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)}
                        className="flex-1 py-4 font-semibold rounded-xl transition-all text-sm"
                        style={{ background: 'rgba(255,255,255,0.5)', color: '#374151', border: '1px solid rgba(255,255,255,0.5)' }}>
                        ← Back
                      </button>
                      <button onClick={() => setStep(3)} disabled={!time}
                        className="flex-1 py-4 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-40"
                        style={{ background: time ? '#14B8A6' : '#d1d5db' }}>
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 — DETAILS */}
                {step === 3 && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Your details</h2>
                    <p className="text-gray-500 text-sm mb-5">{formatShort(date)} at {time}</p>

                    <div className="flex flex-col gap-3 mb-5">
                      {[
                        { label: 'Full Name *', type: 'text', key: 'name', placeholder: 'Jane Smith' },
                        { label: 'Email *', type: 'email', key: 'email', placeholder: 'jane@example.com' },
                        { label: 'Phone *', type: 'tel', key: 'phone', placeholder: '+44 7700 000000' },
                      ].map(({ label, type, key, placeholder }) => (
                        <div key={key} className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
                          <input type={type} value={form[key as keyof typeof form]}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            placeholder={placeholder}
                            className="px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2"
                            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.5)', focusRingColor: '#14B8A6' } as React.CSSProperties} />
                        </div>
                      ))}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Number of guests</label>
                        <select value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })}
                          className="px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2"
                          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.5)' }}>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)}
                        className="flex-1 py-4 font-semibold rounded-xl transition-all text-sm"
                        style={{ background: 'rgba(255,255,255,0.5)', color: '#374151', border: '1px solid rgba(255,255,255,0.5)' }}>
                        ← Back
                      </button>
                      <button onClick={handleSubmit}
                        disabled={!form.name || !form.email || !form.phone || loading}
                        className="flex-1 py-4 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                        style={{ background: (!form.name || !form.email || !form.phone || loading) ? '#d1d5db' : '#F97316' }}>
                        {loading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving...
                          </>
                        ) : 'Confirm Reservation'}
                      </button>
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-4">
                      Need to cancel? <span className="font-medium text-gray-700">+44 1908 000 000</span>
                    </p>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </section>

      <FooterStarter />
    </>
  );
}
