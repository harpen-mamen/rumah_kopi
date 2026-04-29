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

const cards = [
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
  const c1 = useVisible();
  const c2 = useVisible();
  const c3 = useVisible();
  const refs = [c1, c2, c3];

  return (
    <section id="features" className="py-16 px-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="font-bold text-gray-900 mb-3" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)' }}>
            Why <span className="text-amber-500">Vibe Caffè</span>?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Premium ingredients. Expert craft. A space you&#39;ll want to return to.
          </p>
        </div>

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
