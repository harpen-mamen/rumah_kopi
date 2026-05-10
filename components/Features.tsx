'use client';

import { useEffect, useRef, useState } from 'react';
import { fallbackHome, publicAssetUrl, type Feature, type Promo, type PublicHomeData } from '@/lib/public-content';

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

const fallbackCards = [
  {
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop',
    title: 'Specialty Coffee',
    text: 'Carefully sourced, freshly roasted — every cup made with precision and passion.',
  },
  {
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop',
    title: 'Artisan Pastry',
    text: 'Baked fresh every morning — croissants, cakes, and seasonal treats to complement your coffee.',
  },
  {
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop',
    title: 'Relaxing Ambience',
    text: 'Warm and welcoming — perfect for catching up with friends, getting work done, or enjoying a quiet moment.',
  },
];

export default function Features() {
  const [content, setContent] = useState<PublicHomeData>(fallbackHome);
  const c1 = useVisible();
  const c2 = useVisible();
  const c3 = useVisible();
  const c4 = useVisible();
  const c5 = useVisible();
  const c6 = useVisible();
  const refs = [c1, c2, c3, c4, c5, c6];

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => setContent(data.data || fallbackHome))
      .catch(() => setContent(fallbackHome));
  }, []);

  const site = content.site_setting || fallbackHome.site_setting!;
  const adminFeatures = (content.features || []).slice(0, 6);
  const cards = adminFeatures.length > 0
    ? adminFeatures.map((feature: Feature) => ({
        image: publicAssetUrl(feature.image) || fallbackCards[0].image,
        title: feature.title,
        text: feature.description || site.tagline || '',
      }))
    : fallbackCards;
  const promos = (content.promos || []).slice(0, 2);

  return (
    <section id="features" className="py-16 px-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="font-bold text-gray-900 mb-3" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)' }}>
            Kenapa <span className="text-amber-500">{site.site_name || 'TORTUGA AREA'}</span>?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            {site.tagline || 'Coffee, space, and island vibes.'}
          </p>
        </div>

        {promos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {promos.map((promo: Promo) => (
              <a
                key={promo.id}
                href={promo.button_url || '#menu'}
                className="group overflow-hidden rounded-lg bg-gray-900 text-white min-h-44 relative flex items-end"
              >
                <img
                  src={publicAssetUrl(promo.image) || fallbackCards[0].image}
                  alt={promo.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber-200 mb-2">Promo</p>
                  <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                  {promo.description && <p className="text-sm text-white/80">{promo.description}</p>}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* 3 CARDURI EGALE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <div
              key={card.title}
              ref={refs[i].ref}
              style={{
                opacity: refs[i].visible ? 1 : 0,
                transform: refs[i].visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${i * 120}ms, transform 0.6s ease ${i * 120}ms`,
              }}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.text}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
