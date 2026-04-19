import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { MENU } from "./menuData";

const CATEGORIES = ["All", "Coffee", "Snack"];

export default function MenuGrid({ onAddToCart, cart }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? MENU : MENU.filter(i => i.category === activeCategory);

  const cartQty = (id) => {
    const item = cart.find(c => c.id === id);
    return item ? item.qty : 0;
  };

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-2 mb-5">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
              activeCategory === cat
                ? "bg-[#6F4E37] text-white shadow"
                : "bg-white border border-[#C4A484]/30 text-[#6F4E37] hover:bg-[#6F4E37]/5"
            }`}
          >
            {cat === "Coffee" ? "☕ Coffee" : cat === "Snack" ? "🍪 Snacks" : "All"}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(item => {
          const qty = cartQty(item.id);
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#C4A484]/20 p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="text-4xl text-center py-2">{item.emoji}</div>
              <div>
                <p className="font-bold text-[#3d2b1a] text-sm leading-tight">{item.name}</p>
                <p className="text-[#6F4E37]/55 text-xs mt-0.5 leading-tight">{item.desc}</p>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#6F4E37]">${item.priceUSDC.toFixed(2)}</span>
                  <span className="text-xs text-[#C4A484]">{item.priceETH} ETH</span>
                </div>
                <button
                  onClick={() => onAddToCart(item)}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all duration-200 ${
                    qty > 0
                      ? "bg-[#6F4E37] text-white"
                      : "bg-[#FFF8E7] border border-[#C4A484]/30 text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white"
                  }`}
                >
                  {qty > 0 ? <><Check className="w-3 h-3" /> Added ({qty})</> : <><Plus className="w-3 h-3" /> Add to Cart</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}