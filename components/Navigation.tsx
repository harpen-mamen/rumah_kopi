'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Discover',  id: 'features' },
  { label: 'Menu',      id: 'menu'     },
  { label: 'Our Story', id: 'about'    },
  { label: 'Find Us',   id: 'location' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    if (pathname !== '/') {
      router.push(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const linkClass = 'relative text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium cursor-pointer group';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled || menuOpen ? 'bg-black/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <a href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-wide">
          <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
          Vibe <span className="text-amber-400">Caffè</span>
        </a>

        {/* LINKS - desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, id }) => (
            <button key={id} onClick={() => scrollToSection(id)} className={linkClass}>
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-amber-400 transition-all duration-300 group-hover:w-full rounded-full" />
            </button>
          ))}
        </div>

        {/* CTA - desktop */}
        <a
          href="/reservations"
          className="hidden md:inline-block px-5 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30"
        >
          Reserve a table
        </a>

        {/* HAMBURGER - mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4">
          {navLinks.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="text-white/80 hover:text-white text-sm font-medium py-2 border-b border-white/10 text-left"
            >
              {label}
            </button>
          ))}
          <a
            href="/reservations"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center px-5 py-3 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Reserve a table
          </a>
        </div>
      )}
    </nav>
  );
}
