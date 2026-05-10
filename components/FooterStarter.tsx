'use client';

import { useEffect, useState } from 'react';
import { fallbackHome, formatHour, publicAssetUrl, type PublicHomeData } from '@/lib/public-content';

export default function FooterStarter() {
  const [content, setContent] = useState<PublicHomeData>(fallbackHome);

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => setContent(data.data || fallbackHome))
      .catch(() => setContent(fallbackHome));
  }, []);

  const site = content.site_setting || fallbackHome.site_setting!;
  const hours = content.opening_hours || [];
  const year = new Date().getFullYear();

  return (
    <footer>
      <div style={{ background: '#f3f4f6', lineHeight: 0 }}>
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z" fill="#111827" />
        </svg>
      </div>

      <div style={{ background: '#111827' }} className="text-gray-300">
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <a href="/" className="flex items-center gap-3 mb-3">
                {site.logo ? (
                  <img src={publicAssetUrl(site.logo)} alt={site.site_name || 'Logo'} className="w-9 h-9 object-contain rounded" />
                ) : (
                  <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="2" x2="6" y2="4" />
                    <line x1="10" y1="2" x2="10" y2="4" />
                    <line x1="14" y1="2" x2="14" y2="4" />
                  </svg>
                )}
                <span className="font-bold text-white text-lg">{site.site_name || 'TORTUGA AREA'}</span>
              </a>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                {site.description || site.tagline || 'Coffee, space, and island vibes.'}
              </p>
              <div className="flex gap-3">
                {site.instagram_url && <a href={site.instagram_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-amber-400">Instagram</a>}
                {site.tiktok_url && <a href={site.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-amber-400">TikTok</a>}
                {site.whatsapp && <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-amber-400">WhatsApp</a>}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Halaman</h4>
              <ul className="flex flex-col gap-2 text-sm">
                {[
                  { label: 'Keunggulan', href: '/#features' },
                  { label: 'Menu', href: '/menu' },
                  { label: 'Cerita', href: '/about' },
                  { label: 'Lokasi', href: '/location' },
                  { label: 'Booking', href: '/reservations' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-gray-400 hover:text-amber-400 transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Kunjungi Kami</h4>
              <ul className="flex flex-col gap-3 text-sm text-gray-400">
                {site.address && <li>{site.address}</li>}
                {site.phone && <li>{site.phone}</li>}
                {site.email && <li>{site.email}</li>}
                {hours.slice(0, 3).map(hour => (
                  <li key={hour.id} className="flex justify-between gap-4">
                    <span>{hour.day}</span>
                    <span className="text-amber-400">{formatHour(hour)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <p>© {year} {site.site_name || 'TORTUGA AREA'}. All rights reserved.</p>
            <p>Konten tersinkron dengan dashboard admin.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
