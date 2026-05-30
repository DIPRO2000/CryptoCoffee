import { useState, useEffect } from "react";
import { Plus, Check, Loader2, AlertCircle } from "lucide-react";

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  emoji: string;
  desc: string;
  priceUSDC: number;
  priceToken: number;
  tokenGifted: number;
  isAvailable: boolean;
}

export interface CartItem {
  id: string;
  qty: number;
  emoji: string;
  name: string;
  priceUSDC: number;
  priceToken: number;
  tokenGifted: number;
}

interface MenuGridProps {
  onAddToCart: (item: MenuItem) => void;
  cart: CartItem[];
}

const getCategoryLabel = (cat: string) => {
  const labels: Record<string, string> = {
    All: "🍽️ All",
    Coffee: "☕ Coffee",
    Snack: "🍪 Snacks",
    Tea: "🍵 Tea",
    Drink: "🥤 Drinks",
    Dessert: "🍰 Desserts"
  };
  return labels[cat] || cat;
};

export default function MenuGrid({ onAddToCart, cart }: MenuGridProps) {

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/menu`);
        if (!res.ok) throw new Error("Failed to load the menu");
        
        const data: MenuItem[] = await res.json();
        setMenu(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const CATEGORIES = ["All", ...new Set(menu.map(item => item.category))];

  const filtered = activeCategory === "All" ? menu : menu.filter(i => i.category === activeCategory);

  const cartQty = (id: string) => {
    const item = cart.find(c => c.id === id);
    return item ? item.qty : 0;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#6F4E37]">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-semibold">Brewing the menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p className="font-semibold">Oops! {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
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
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(item => {
          const qty = cartQty(item.id);
          // Check if item is available, fallback to true if the field is missing on older items
          const isAvailable = item.isAvailable !== false; 

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 flex flex-col gap-2 transition-all duration-200 relative group ${
                isAvailable 
                  ? 'border-[#C4A484]/20 shadow-sm hover:shadow-md' 
                  : 'border-gray-200 opacity-75 grayscale-[0.2]'
              }`}
            >
              {/* Badges */}
              {isAvailable ? (
                <div className="absolute top-3 right-3 bg-[#FFF8E7] text-[#6F4E37] text-[10px] font-bold px-2 py-1 rounded-full border border-[#C4A484]/30 shadow-sm">
                  +{item.tokenGifted} 🎁
                </div>
              ) : (
                <div className="absolute top-3 right-3 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full border border-red-100 shadow-sm">
                  Sold Out
                </div>
              )}

              <div className="text-4xl text-center py-2">{item.emoji}</div>
              
              <div>
                <p className={`font-bold text-sm leading-tight ${isAvailable ? 'text-[#3d2b1a]' : 'text-gray-500'}`}>
                  {item.name}
                </p>
                <p className={`text-xs mt-0.5 leading-tight ${isAvailable ? 'text-[#6F4E37]/55' : 'text-gray-400'}`}>
                  {item.desc}
                </p>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${isAvailable ? 'text-[#6F4E37]' : 'text-gray-400'}`}>
                    ${item.priceUSDC.toFixed(2)}
                  </span>
                  <span className={`text-xs font-medium ${isAvailable ? 'text-[#C4A484]' : 'text-gray-400'}`}>
                    {item.priceToken} CCT
                  </span>
                </div>
                
                <button
                  onClick={() => onAddToCart(item)}
                  disabled={!isAvailable}
                  className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all duration-200 ${
                    !isAvailable
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : qty > 0
                      ? "bg-[#6F4E37] text-white"
                      : "bg-[#FFF8E7] border border-[#C4A484]/30 text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white"
                  }`}
                >
                  {!isAvailable ? (
                    "Out of Stock"
                  ) : qty > 0 ? (
                    <><Check className="w-3 h-3" /> Added ({qty})</>
                  ) : (
                    <><Plus className="w-3 h-3" /> Add to Cart</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}