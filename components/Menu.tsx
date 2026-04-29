'use client';

import { useState, useEffect } from 'react';

type MenuItem = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
};

const IMAGES: Record<string, string> = {
  'Espresso': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&auto=format&fit=crop',
  'Americano': 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400&auto=format&fit=crop',
  'Cappuccino': 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop',
  'Flat White': 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400&auto=format&fit=crop',
  'Latte': '/latte.jpg',
  'Macchiato': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop',
  'Oat Latte': '/oat-latte.jpg',
  'Honey Lavender Latte': '/honey-lavender.jpg',
  'Turmeric Latte': '/turmeric-latte.webp',
  'Matcha Latte': 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop',
  'Rose Cortado': '/rose-cortado.jpg',
  'Vibe Signature': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop',
  'Classic Cold Brew': '/cb-classic.jpg',
  'Nitro Cold Brew': '/cb-nitro.jpg',
  'Cold Brew Tonic': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop',
  'Cold Brew Lemonade': '/cb-lemonade.jpg',
  'Salted Caramel Cold Brew': '/cb-salted-caramel.jpg',
  'Cold Brew Oat Milk': '/cb-oat-milk.jpg',
  'Butter Croissant': '/pastry-croissant.jpg',
  'Almond Croissant': '/pastry-almond-croissant.jpg',
  'Pain au Chocolat': '/pastry-pain-chocolat.jpg',
  'Carrot Cake': '/pastry-carrot-cake.jpg',
  'Chocolate Brownie': '/pastry-brownie.jpg',
  'Cinnamon Roll': '/pastry-cinnamon-roll.jpg',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop';

export default function Menu() {
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [active, setActive] = useState('');
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        if (!data.success) return;
        const items: MenuItem[] = data.data.filter((i: MenuItem) => i.available);
        const grouped: Record<string, MenuItem[]> = {};
        items.forEach(item => {
          if (!grouped[item.category]) grouped[item.category] = [];
          grouped[item.category].push(item);
        });
        setMenuData(grouped);
        const cats = Object.keys(grouped);
        setCategories(cats);
        setActive(cats[0] || '');
        setLoading(false);
      });
  }, []);

  const handleTabChange = (cat: string) => {
    if (cat === active) return;
    setVisible(false);
    setTimeout(() => { setActive(cat); setVisible(true); }, 200);
  };

  return (
    <section className="py-16 px-6 bg-white" id="menu">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-amber-500">Menu</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto">
            Crafted drinks and freshly baked treats — something for everyone.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading menu...</div>
        ) : (
          <>
            {/* TABS */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((cat) => (
                <button key={cat} onClick={() => handleTabChange(cat)}
                  className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                    active === cat
                      ? 'bg-amber-500 text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6"
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s ease' }}>
              {(menuData[active] || []).map((item) => (
                <div key={item.id}
                  className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={IMAGES[item.name] || DEFAULT_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                      <span className="text-amber-500 font-bold text-lg ml-4 shrink-0">£{item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
