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
    <section id="about" className="py-24 px-6 bg-gray-200">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-amber-600">Story</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            A place born from a love of coffee, community, and craft
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

            <p className="text-gray-600 text-lg leading-relaxed">
              Vibe Caffè started as a simple idea: what if your neighbourhood coffee shop felt less like a transaction and more like coming home? We opened our doors in Milton Keynes with a single espresso machine, a handful of bar stools, and an obsession with getting every cup exactly right.
            </p>

            <p className="text-gray-600 text-lg leading-relaxed">
              Every bean we use is sourced directly from small-scale farms — from the volcanic highlands of Ethiopia to the misty hills of Colombia. We roast in small batches to preserve the character of each origin, so that what ends up in your cup is never generic, always memorable.
            </p>

            <p className="text-gray-600 text-lg leading-relaxed">
              But Vibe has always been about more than coffee. It's the writer who claims the corner table every morning, the friends who linger long after their cups are empty, the barista who remembers your name by your third visit. We built this place for all of them — and for you.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-6 border-t border-gray-300">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">5+</p>
                <p className="text-sm text-gray-400 mt-1">Years of craft</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">12</p>
                <p className="text-sm text-gray-400 mt-1">Origin coffees</p>
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
