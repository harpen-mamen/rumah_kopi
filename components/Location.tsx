'use client';

import { useRef, useState, useEffect } from 'react';
import { fallbackHome, formatHour, type PublicHomeData } from '@/lib/public-content';

function useVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export default function Location() {
  const [content, setContent] = useState<PublicHomeData>(fallbackHome);
  const info = useVisible();
  const map  = useVisible();

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => setContent(data.data || fallbackHome))
      .catch(() => setContent(fallbackHome));
  }, []);

  const site = content.site_setting || fallbackHome.site_setting!;
  const hours = content.opening_hours?.length ? content.opening_hours : [
    { id: 1, day: 'Monday - Friday', open_time: '07:00', close_time: '20:00' },
    { id: 2, day: 'Saturday', open_time: '08:00', close_time: '21:00' },
    { id: 3, day: 'Sunday', open_time: '09:00', close_time: '18:00' },
  ];

  return (
    <section
      id="location"
      className="py-16 px-6 bg-gray-200"
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            Temukan <span className="text-amber-500">Kami</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto">
            {site.address || 'Datang, pilih tempat duduk, dan biarkan kami membuatkan sesuatu yang spesial.'}
          </p>
        </div>

        {/* LAYOUT: info stânga + hartă dreapta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">

          {/* INFO */}
          <div
            ref={info.ref}
            style={{
              opacity: info.visible ? 1 : 0,
              transform: info.visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
            className="flex flex-col gap-8"
          >
            {/* Adresă */}
            <div className="flex gap-4 items-start">
              <div className="mt-1 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-lg mb-1">Address</p>
                <p className="text-gray-500 leading-relaxed whitespace-pre-line">{site.address || 'Milton Keynes, United Kingdom'}</p>
              </div>
            </div>

            {/* Program */}
            <div className="flex gap-4 items-start">
              <div className="mt-1 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="w-full">
                <p className="text-gray-900 font-semibold text-lg mb-3">Opening Hours</p>
                <div className="flex flex-col gap-2">
                  {hours.map((hour) => (
                    <div key={hour.id || hour.day} className="flex justify-between items-center py-2 border-b border-zinc-300">
                      <span className="text-gray-500 text-sm">{hour.day}</span>
                      <span className="text-amber-600 text-sm font-medium">{formatHour(hour)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="flex gap-4 items-start">
              <div className="mt-1 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-semibold text-lg mb-1">Contact</p>
                {site.phone && <p className="text-gray-500">{site.phone}</p>}
                {site.whatsapp && <p className="text-gray-500">{site.whatsapp}</p>}
                {site.email && <p className="text-gray-500">{site.email}</p>}
              </div>
            </div>

            {/* CTA */}
            <a
              href={site.google_maps_url || 'https://maps.google.com/?q=Midsummer+Boulevard+Milton+Keynes'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Get Directions
            </a>
          </div>

          {/* HARTĂ */}
          <div
            ref={map.ref}
            className="rounded-3xl overflow-hidden h-[480px]"
            style={{
              opacity: map.visible ? 1 : 0,
              transform: map.visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            }}
          >
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(site.address || 'Milton Keynes, United Kingdom')}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, height: '100%', display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Cafe Tortuga location"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
