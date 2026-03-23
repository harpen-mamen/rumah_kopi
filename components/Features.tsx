'use client';

import { useEffect, useRef, useState } from 'react';

function useVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export default function Features() {
  const card1 = useVisible();
  const card2 = useVisible();
  const card3 = useVisible();

  const fadeStyle = (visible: boolean, delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(40px)',
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease`,
  });

  return (
    <section id="features" className="relative py-24 px-6 overflow-hidden">

      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.55)' }}
      >
        {/* Înlocuiește cu /features-cafe.mp4 când ai un video cozy de cafenea */}
        <source src="/hero-coffee.mp4" type="video/mp4" />
      </video>

      {/* OVERLAY warm */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            Why <span className="text-amber-400">Vibe Caffè</span>?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Unique experience, premium ingredients, perfect atmosphere
          </p>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CARD MARE — stânga */}
          <div
            ref={card1.ref}
            style={fadeStyle(card1.visible, 0)}
            className="group bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col cursor-pointer hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-shadow duration-300 min-h-[400px] md:min-h-full"
          >
            <div className="h-[40%] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop"
                alt="Specialty Coffee"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center p-10 flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Specialty Coffee</h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                Every cup starts with carefully sourced, freshly roasted beans. Our baristas craft each drink with precision and passion — from a classic espresso to a signature latte.
              </p>
            </div>
          </div>

          {/* COLOANA dreapta — 2 carduri mici stivuite */}
          <div className="flex flex-col gap-6 h-full">

            {/* CARD MIC — sus */}
            <div
              ref={card2.ref}
              style={fadeStyle(card2.visible, 150)}
              className="group bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col cursor-pointer hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-shadow duration-300 flex-1 min-h-[250px]"
            >
              <div className="h-[40%] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop"
                  alt="Artisan Pastry"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col justify-center p-8 flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Artisan Pastry</h3>
                <p className="text-gray-500 text-base leading-relaxed">
                  Freshly baked every morning — croissants, cakes, and seasonal treats crafted to pair perfectly with your coffee.
                </p>
              </div>
            </div>

            {/* CARD MIC — jos */}
            <div
              ref={card3.ref}
              style={fadeStyle(card3.visible, 300)}
              className="group bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col cursor-pointer hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-shadow duration-300 flex-1 min-h-[250px]"
            >
              <div className="h-[40%] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop"
                  alt="Relaxing Ambience"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col justify-center p-8 flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Relaxing Ambience</h3>
                <p className="text-gray-500 text-base leading-relaxed">
                  A cozy space designed for connection — whether you're catching up with friends, working remotely, or simply enjoying a moment alone.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
