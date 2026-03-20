'use client';

import { useState, useEffect } from 'react';

const menuData = {
  'The Classics': [
    { name: 'Espresso', price: '£3.00', description: 'Double shot of intense, rich espresso', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&auto=format&fit=crop' },
    { name: 'Americano', price: '£3.50', description: 'Espresso diluted with hot water — smooth and bold', image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400&auto=format&fit=crop' },
    { name: 'Cappuccino', price: '£4.00', description: 'Espresso with steamed milk and thick foam', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop' },
    { name: 'Flat White', price: '£4.50', description: 'Silky microfoam poured over a double espresso', image: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400&auto=format&fit=crop' },
    { name: 'Latte', price: '£4.50', description: 'Espresso with generous steamed milk', image: '/latte.jpg' },
    { name: 'Macchiato', price: '£3.50', description: 'Espresso "stained" with a dash of foamed milk', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop' },
  ],
  Specialty: [
    { name: 'Oat Latte', price: '£5.00', description: 'Our signature latte made with creamy oat milk', image: '/oat-latte.jpg' },
    { name: 'Honey Lavender Latte', price: '£5.50', description: 'Espresso with lavender syrup and local honey', image: '/honey-lavender.jpg' },
    { name: 'Turmeric Latte', price: '£5.00', description: 'Golden milk blend with warming spices', image: '/turmeric-latte.webp' },
    { name: 'Matcha Latte', price: '£5.00', description: 'Ceremonial grade matcha with steamed milk', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop' },
    { name: 'Rose Cortado', price: '£4.50', description: 'Espresso and warm milk with a hint of rose', image: '/rose-cortado.jpg' },
    { name: 'Vibe Signature', price: '£6.00', description: 'Our secret recipe — ask your barista for the story', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&auto=format&fit=crop' },
  ],
  'Cold Brew': [
    { name: 'Classic Cold Brew', price: '£4.50', description: '18-hour cold-steeped coffee served over ice — smooth, bold, never bitter', image: '/cb-classic.jpg' },
    { name: 'Nitro Cold Brew', price: '£5.50', description: 'Nitrogen-infused cold brew with a creamy, velvety texture — no milk needed', image: '/cb-nitro.jpg' },
    { name: 'Cold Brew Tonic', price: '£5.00', description: 'Cold brew over fever-tree tonic with a twist of orange peel', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop' },
    { name: 'Cold Brew Lemonade', price: '£5.00', description: 'Cold brew meets fresh-squeezed lemonade — the perfect summer refresher', image: '/cb-lemonade.jpg' },
    { name: 'Salted Caramel Cold Brew', price: '£5.50', description: 'Cold brew with house-made salted caramel syrup and a float of cream', image: '/cb-salted-caramel.jpg' },
    { name: 'Cold Brew Oat Milk', price: '£5.00', description: 'Cold brew poured over ice with silky oat milk — clean and refreshing', image: '/cb-oat-milk.jpg' },
  ],
  Pastry: [
    { name: 'Butter Croissant', price: '£3.00', description: 'Hand-laminated, baked fresh every morning — shatteringly flaky with a buttery, honeyed interior', image: '/pastry-croissant.jpg' },
    { name: 'Almond Croissant', price: '£3.50', description: 'Day-old croissant filled with rich frangipane, topped with toasted almonds and icing sugar', image: '/pastry-almond-croissant.jpg' },
    { name: 'Pain au Chocolat', price: '£3.50', description: 'Two batons of Valrhona dark chocolate wrapped in buttery laminated dough', image: '/pastry-pain-chocolat.jpg' },
    { name: 'Carrot Cake', price: '£4.00', description: 'Moist spiced carrot cake with layers of cream cheese frosting and candied walnuts', image: '/pastry-carrot-cake.jpg' },
    { name: 'Chocolate Brownie', price: '£3.50', description: 'Dense, fudgy dark chocolate brownie with a crinkle top — gluten-free option available', image: '/pastry-brownie.jpg' },
    { name: 'Cinnamon Roll', price: '£4.50', description: 'Soft, pillowy roll with cinnamon sugar swirl, finished with vanilla cream cheese glaze', image: '/pastry-cinnamon-roll.jpg' },
  ],
};

type Category = keyof typeof menuData;
const categories = Object.keys(menuData) as Category[];

export default function Menu() {
  const [active, setActive] = useState<Category>('The Classics');
  const [visible, setVisible] = useState(true);

  const handleTabChange = (cat: Category) => {
    if (cat === active) return;
    setVisible(false);
    setTimeout(() => {
      setActive(cat);
      setVisible(true);
    }, 200);
  };

  return (
    <section className="py-24 px-6 bg-white" id="menu">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-amber-500">Menu</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Carefully crafted drinks and freshly baked treats for every taste
          </p>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleTabChange(cat)}
              className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                active === cat
                  ? 'bg-amber-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {menuData[active].map((item) => (
            <div
              key={item.name}
              className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              {/* IMAGE */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              {/* TEXT */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <span className="text-amber-500 font-bold text-lg ml-4 shrink-0">{item.price}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
