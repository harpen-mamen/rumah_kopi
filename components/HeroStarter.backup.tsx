'use client';

import { useState } from 'react';

/**
 * 🎯 HERO STARTER - Cu video background
 */

export default function HeroStarter() {
  const [hovered, setHovered] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center bg-amber-950 pt-20">

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

      {/* OVERLAY global */}
      <div className="absolute inset-0 bg-black/50" />

      {/* GRADIENT stânga — lizibilitate text */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.05) 100%)'
      }} />

      {/* CONTINUT - aliniat cu navbar */}
      <div className="relative z-10 w-full pl-8 md:pl-16 lg:pl-24 pr-6 text-left text-white">

        {/* BLOC TEXT — lățime limitată */}
        <div className="max-w-2xl">

          {/* DESCRIPTOR */}
          <div className="hero-animate hero-delay-1 mb-2">
            <span className="handwrite text-5xl" style={{ color: '#FFF8F0', textShadow: '2px 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}>
              Welcome to the place
            </span>
          </div>

          {/* TITLU PRINCIPAL */}
          <h1
            className="hero-animate hero-delay-2 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{
              color: '#FFF8F0',
              fontFamily: 'var(--font-playfair), Georgia, serif',
              textShadow: '0 4px 24px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.8)'
            }}
          >
            Where coffee brings people together
          </h1>

          {/* SUBTITLU */}
          <p
            className="hero-animate hero-delay-3 text-sm mt-4 mb-10 font-medium tracking-widest uppercase"
            style={{ color: '#FFF8F0', textShadow: '2px 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}
          >
            Fresh roasts · Expert baristas · A place that feels like home
          </p>

          {/* BUTOANE CTA */}
          <div className="hero-animate hero-delay-3 flex flex-row gap-4">
            <button onClick={() => scrollToSection('menu')} className="whitespace-nowrap px-8 py-4 bg-black/30 hover:bg-black/50 text-white font-semibold rounded-lg border border-white/50 hover:border-white transition-all backdrop-blur-sm">
              View Menu
            </button>
            <a href="https://instagram.com/vibecaffe" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-8 py-4 bg-black/30 hover:bg-black/50 text-white font-semibold rounded-lg border border-white/50 hover:border-white transition-all backdrop-blur-sm">
              Follow Us
            </a>
            <a href="https://www.google.com/maps/search/Vibe+Caffe+Milton+Keynes" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-8 py-4 bg-black/30 hover:bg-black/50 text-white font-semibold rounded-lg border border-white/50 hover:border-white transition-all backdrop-blur-sm">
              Leave a Review
            </a>
          </div>

        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <button
        onClick={() => scrollToSection('features')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="hero-animate hero-delay-4 absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer flex flex-col items-center gap-1 z-20"
        aria-label="Scroll down"
        style={{ color: hovered ? '#f59e0b' : 'rgba(255,255,255,0.75)' }}
      >
        <svg className="w-7 h-7 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

    </section>
  );
}
