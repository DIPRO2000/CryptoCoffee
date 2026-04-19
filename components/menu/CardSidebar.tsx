import { X, Minus, Plus, ShoppingBag } from "lucide-react";

export default function CartSidebar({ cart, onUpdate, onRemove, onCheckout, onClose }) {
  const totalUSDC = cart.reduce((s, i) => s + i.priceUSDC * i.qty, 0);
  const totalETH = cart.reduce((s, i) => s + i.priceETH * i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-sm bg-[#FFF8E7] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C4A484]/20 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#6F4E37]" />
            <span className="font-bold text-[#3d2b1a]">Your Cart</span>
            <span className="bg-[#6F4E37] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          </div>
          <button onClick={onClose} className="text-[#6F4E37]/60 hover:text-[#6F4E37] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-[#6F4E37]/40">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 border border-[#C4A484]/15 shadow-sm">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#3d2b1a] text-sm truncate">{item.name}</p>
                  <p className="text-[#6F4E37]/60 text-xs">${(item.priceUSDC * item.qty).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => item.qty === 1 ? onRemove(item.id) : onUpdate(item.id, item.qty - 1)}
                    className="w-7 h-7 rounded-lg bg-[#FFF8E7] border border-[#C4A484]/30 flex items-center justify-center text-[#6F4E37] hover:bg-[#C4A484]/20 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-[#3d2b1a] text-sm">{item.qty}</span>
                  <button
                    onClick={() => onUpdate(item.id, item.qty + 1)}
                    className="w-7 h-7 rounded-lg bg-[#FFF8E7] border border-[#C4A484]/30 flex items-center justify-center text-[#6F4E37] hover:bg-[#C4A484]/20 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-[#C4A484]/20 bg-white space-y-3">
            <div className="flex justify-between text-sm text-[#6F4E37]/70">
              <span>Subtotal</span>
              <span className="font-mono">{totalETH.toFixed(5)} ETH</span>
            </div>
            <div className="flex justify-between font-bold text-[#3d2b1a]">
              <span>Total</span>
              <span>${totalUSDC.toFixed(2)} USDC</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-xl py-3 font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/30"
            >
              Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}