'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import FooterStarter from '@/components/FooterStarter';

const timeSlots = [
  '8:00 am', '8:30 am', '9:00 am', '9:30 am',
  '10:00 am', '10:30 am', '11:00 am', '11:30 am',
  '12:00 pm', '12:30 pm', '1:00 pm', '1:30 pm',
  '2:00 pm', '2:30 pm', '3:00 pm', '3:30 pm',
  '4:00 pm', '4:30 pm', '5:00 pm', '5:30 pm',
  '6:00 pm', '6:30 pm', '7:00 pm', '7:30 pm',
];

export default function ReservationsPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Today's date as min for date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Navigation />

      {/* MINI HERO */}
      <div className="relative flex items-center min-h-[50vh] overflow-hidden bg-amber-950 pt-20">

        {/* VIDEO BACKGROUND */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-coffee.mp4" type="video/mp4" />
        </video>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 100%)' }} />

        {/* CONTENT */}
        <div className="relative z-10 w-full pl-8 md:pl-16 lg:pl-24 pr-6 text-left text-white">
          <div className="max-w-2xl">
            <div className="mb-2">
              <span
                className="handwrite text-5xl"
                style={{ color: '#FFF8F0', textShadow: '2px 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}
              >
                A table for you
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight"
              style={{
                color: '#FFF8F0',
                fontFamily: 'var(--font-playfair), Georgia, serif',
                textShadow: '0 4px 24px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              Reserve a Table
            </h1>
            <p
              className="text-sm font-medium tracking-widest uppercase"
              style={{ color: '#FFF8F0', textShadow: '2px 4px 12px rgba(0,0,0,0.8)' }}
            >
              Secure your spot · We'll take care of the rest
            </p>
          </div>
        </div>

      </div>

      {/* FORM SECTION */}
      <section className="py-20 px-6 bg-gray-100">
        <div className="max-w-2xl mx-auto">

          {submitted ? (
            /* SUCCESS STATE */
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Reservation Confirmed!</h2>
              <p className="text-gray-500 text-lg mb-2">
                Thank you, <span className="font-semibold text-gray-700">{form.name}</span>.
              </p>
              <p className="text-gray-500 mb-8">
                We've reserved a table for <strong>{form.guests} {Number(form.guests) === 1 ? 'guest' : 'guests'}</strong> on <strong>{form.date}</strong> at <strong>{form.time}</strong>.<br />
                A confirmation will be sent to <strong>{form.email}</strong>.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', date: '', time: '', guests: '2', notes: '' }); }}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition-colors"
              >
                Make Another Reservation
              </button>
            </div>
          ) : (
            /* FORM */
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col gap-6">

              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Jane Smith"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@example.com"
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+44 7700 000000"
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Date + Time + Guests */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    min={today}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Time *</label>
                  <select
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">Select</option>
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Guests *</label>
                  <select
                    name="guests"
                    value={form.guests}
                    onChange={handleChange}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900 bg-white"
                  >
                    {[1,2,3,4,5,6,7,8].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Special requests */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Special Requests</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Allergies, celebrations, high chair needed..."
                  className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold text-lg rounded-xl transition-colors duration-200 mt-2"
              >
                Confirm Reservation
              </button>

              <p className="text-center text-sm text-gray-400">
                By reserving a table you agree to our cancellation policy. <br />
                Need to cancel? Call us at <span className="text-gray-600 font-medium">+44 1908 000 000</span>
              </p>

            </form>
          )}
        </div>
      </section>

      <FooterStarter />
    </>
  );
}
