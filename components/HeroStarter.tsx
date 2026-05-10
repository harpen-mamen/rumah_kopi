'use client';

import { useState, useEffect, useRef } from 'react';
import { fallbackHome, publicAssetUrl, type PublicHomeData } from '@/lib/public-content';

/**
 * 🎯 HERO STARTER - Cu video background
 */

export default function HeroStarter() {
  const [hovered, setHovered] = useState(false);
  const [content, setContent] = useState<PublicHomeData>(fallbackHome);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => setContent(data.data || fallbackHome))
      .catch(() => setContent(fallbackHome));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    const tryPlay = () => { video.play().catch(() => {}); };
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('loadedmetadata', tryPlay);
    document.addEventListener('touchstart', tryPlay, { once: true });
    tryPlay();
    return () => {
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('loadedmetadata', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const site = content.site_setting || fallbackHome.site_setting!;
  const hero = content.hero || fallbackHome.hero!;
  const title = hero.headline || site.site_name || fallbackHome.hero!.headline;
  const eyebrow = hero.subheadline || site.tagline || fallbackHome.hero!.subheadline;
  const description = hero.description || site.description || fallbackHome.hero!.description;
  const primaryText = hero.primary_button_text || 'Lihat Menu';
  const primaryUrl = hero.primary_button_url || '#menu';
  const secondaryText = hero.secondary_button_text || 'Lokasi';
  const secondaryUrl = hero.secondary_button_url || '#location';
  const mediaUrl = publicAssetUrl(hero.hero_media_type === 'video' ? hero.hero_video : hero.hero_image);
  const overlayOpacity = Number(hero.overlay_opacity ?? 0.52);

  const handleCta = (url: string) => {
    if (url.startsWith('#')) {
      scrollToSection(url.slice(1));
      return;
    }
    window.location.href = url;
  };

  return (
    <section className="relative min-h-screen flex items-center bg-stone-800 pt-20">

      {/* VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${hero.hero_media_type === 'image' ? 'hidden' : ''}`}
        style={{ pointerEvents: 'none' }}
      >
        <source src={mediaUrl || '/hero-coffee.mp4'} type="video/mp4" />
      </video>

      {hero.hero_media_type === 'image' && (
        <img
          src={mediaUrl || '/about-interior.jpg'}
          alt={title || 'Coffee shop hero'}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* OVERLAY */}
      <div className="absolute inset-0" style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,${Math.max(overlayOpacity - 0.25, 0.12)}) 0%, rgba(0,0,0,${overlayOpacity}) 100%)`
      }} />

      {/* CONTINUT - aliniat cu navbar */}
      <div className="relative z-10 w-full px-6 md:pl-16 lg:pl-24 md:pr-6 text-left text-white">

        {/* BLOC TEXT — lățime limitată */}
        <div className="max-w-2xl">

          {/* DESCRIPTOR */}
          <div className="hero-animate hero-delay-1 mb-2">
            <span className="handwrite text-2xl sm:text-4xl" style={{ color: '#FFF8F0', textShadow: '2px 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}>
              {eyebrow}
            </span>
          </div>

          {/* TITLU PRINCIPAL */}
          <h1
            className="hero-animate hero-delay-2 font-bold mb-4 leading-snug"
            style={{
              color: '#FFF8F0',
              fontFamily: 'var(--font-playfair), Georgia, serif',
              textShadow: '0 4px 24px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.8)',
              fontSize: 'clamp(1.6rem, 6vw, 3.5rem)',
            }}
          >
            {title}
          </h1>

          {/* SUBTITLU */}
          <p
            className="hero-animate hero-delay-3 text-xs sm:text-sm mt-4 mb-8 font-medium tracking-wider sm:tracking-widest uppercase"
            style={{ color: '#FFF8F0', textShadow: '2px 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}
          >
            {description}
          </p>

          {/* BUTOANE CTA */}
          <div className="hero-animate hero-delay-3 flex flex-col sm:flex-row gap-3">
            {/* PRIMARY CTA */}
            <button
              onClick={() => handleCta(primaryUrl)}
              className="px-8 py-3 sm:py-4 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/40 text-center text-sm sm:text-base"
            >
              {primaryText}
            </button>
            {/* SECONDARY — row pe mobile */}
            <div className="flex flex-row sm:flex-row gap-3">
              <a
                href={site.instagram_url || '#menu'}
                target={site.instagram_url ? '_blank' : undefined}
                rel={site.instagram_url ? 'noopener noreferrer' : undefined}
                className="flex-1 sm:flex-none px-5 sm:px-8 py-3 sm:py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full border-2 border-white/60 hover:border-white transition-all duration-300 backdrop-blur-sm text-center text-sm sm:text-base"
              >
                Instagram
              </a>
              <a
                href={secondaryUrl}
                target={secondaryUrl.startsWith('http') ? '_blank' : undefined}
                rel={secondaryUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={(event) => {
                  if (secondaryUrl.startsWith('#')) {
                    event.preventDefault();
                    handleCta(secondaryUrl);
                  }
                }}
                className="flex-1 sm:flex-none px-5 sm:px-8 py-3 sm:py-4 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full border-2 border-white/60 hover:border-white transition-all duration-300 backdrop-blur-sm text-center text-sm sm:text-base"
              >
                {secondaryText}
              </a>
            </div>
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
