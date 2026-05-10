'use client';

import { useRef, useState, useEffect } from 'react';
import { fallbackHome, publicAssetUrl, type PublicHomeData } from '@/lib/public-content';

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
  const [content, setContent] = useState<PublicHomeData>(fallbackHome);
  const text = useVisible();
  const image = useVisible();

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => setContent(data.data || fallbackHome))
      .catch(() => setContent(fallbackHome));
  }, []);

  const site = content.site_setting || fallbackHome.site_setting!;
  const about = content.about || fallbackHome.about!;
  const paragraphs = (about.content || fallbackHome.about!.content || '')
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(Boolean);
  const gallery = (content.gallery || []).slice(0, 3);
  const testimonials = (content.testimonials || []).slice(0, 3);

  return (
    <section id="about" className="py-16 px-6 bg-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-bold text-gray-900 mb-3" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)' }}>
            {about.title || 'Cerita'} <span className="text-amber-600">Kami</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto">
            {about.subtitle || site.description || 'Coffee, people, and craft.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div
            ref={image.ref}
            style={{
              opacity: image.visible ? 1 : 0,
              transform: image.visible ? 'translateX(0)' : 'translateX(-40px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
            className="rounded-lg overflow-hidden shadow-xl aspect-[4/5]"
          >
            <img
              src={publicAssetUrl(about.image) || '/about-interior.jpg'}
              alt={about.title || 'Interior cafe'}
              className="w-full h-full object-cover"
            />
          </div>

          <div
            ref={text.ref}
            style={{
              opacity: text.visible ? 1 : 0,
              transform: text.visible ? 'translateX(0)' : 'translateX(40px)',
              transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
            }}
            className="flex flex-col gap-6"
          >
            <span className="inline-block self-start px-4 py-1.5 bg-gray-300 text-gray-600 text-sm font-semibold rounded-full tracking-wide uppercase">
              {site.tagline || 'Coffee, Space, and Island Vibes'}
            </span>

            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-gray-600 text-base sm:text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}

            {about.button_text && about.button_url && (
              <a
                href={about.button_url}
                className="self-start px-6 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-400 transition-colors"
              >
                {about.button_text}
              </a>
            )}

            <div className="grid grid-cols-3 gap-4 mt-4 pt-6 border-t border-gray-300">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">{content.featured_menu?.length || 0}+</p>
                <p className="text-sm text-gray-400 mt-1">Menu unggulan</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">{gallery.length || 3}</p>
                <p className="text-sm text-gray-400 mt-1">Galeri tempat</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-500">{testimonials.length || '∞'}</p>
                <p className="text-sm text-gray-400 mt-1">Ulasan tamu</p>
              </div>
            </div>
          </div>
        </div>

        {gallery.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {gallery.map(item => (
              <figure key={item.id} className="overflow-hidden rounded-lg bg-white">
                <img src={publicAssetUrl(item.image)} alt={item.title} className="h-64 w-full object-cover" />
                <figcaption className="p-4">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  {item.caption && <p className="text-sm text-gray-500 mt-1">{item.caption}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-white rounded-lg p-5 border border-gray-100">
                <div className="text-amber-500 text-sm mb-3">{'★'.repeat(testimonial.rating || 5)}</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&quot;{testimonial.message}&quot;</p>
                <p className="font-semibold text-gray-900">{testimonial.customer_name}</p>
                {testimonial.customer_position && <p className="text-xs text-gray-400">{testimonial.customer_position}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
