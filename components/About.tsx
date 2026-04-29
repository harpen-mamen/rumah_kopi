'use client';

import { useRef, useState, useEffect } from 'react';

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

export default function About() {
  const text = useVisible();
  const image = useVisible();

  return (
    <section id="about" className="py-16 px-6 bg-gray-200">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="font-bold text-gray-900 mb-3" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)' }}>
            Our <span className="text-amber-600">Story</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto">
            Born from a passion for coffee, people, and craft
          </p>
        </div>

        {/* CONTENT — imagine stânga, text dreapta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* IMAGINE */}
          <div
            ref={image.ref}
            style={{
              opacity: image.visible ? 1 : 0,
              transform: image.visible ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
            className="rounded-3xl overflow-hidden shadow-xl aspect-[4/5]"
          >
            <img
              src="/about-interior.jpg"
              alt="Vibe Caffè interior"
              className="w-full h-full object-cover"
            />
          </div>

          {/* TEXT */}
          <div
            ref={text.ref}
            style={{
              opacity: text.visible ? 1 : 0,
              transform: text.visible ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
            }}
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <span className="inline-block self-start px-4 py-1.5 bg-gray-300 text-gray-600 text-sm font-semibold rounded-full tracking-wide uppercase">
              Est. 2019 · Milton Keynes
            </span>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Vibe Caffè started with one simple idea: a neighbourhood coffee shop that feels like coming home. We opened in Milton Keynes with a single espresso machine and an obsession with getting every cup exactly right.
            </p>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Every bean is sourced from small farms — from Ethiopia to Colombia. We roast in small batches so what's in your cup is never generic, always memorable.
            </p>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              But Vibe has always been about more than coffee. It's the morning regulars, the friends who linger, the barista who knows your name. We built this place for all of them — and for you.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-6 border-t border-gray-300">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">5+</p>
                <p className="text-sm text-gray-400 mt-1">Years of craft</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">12</p>
                <p className="text-sm text-gray-400 mt-1">Coffee origins</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">∞</p>
                <p className="text-sm text-gray-400 mt-1">Good moments</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
