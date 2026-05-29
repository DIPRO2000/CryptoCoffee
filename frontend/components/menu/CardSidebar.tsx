import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, Loader2, Gift } from "lucide-react";
import { ethers, BrowserProvider } from "ethers";

// Adjust this import path if needed!
import { CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI } from "@/components/web3/contracts";
import { CartItem } from "@/components/menu/MenuGrid"; 

interface CartSidebarProps {
  cart: CartItem[];
  onUpdate: (id: string | number, qty: number) => void;
  onRemove: (id: string | number) => void;
  onCheckout: () => void;
  onClose: () => void;
  provider: BrowserProvider | null;
}

export default function CartSidebar({ cart, onUpdate, onRemove, onCheckout, onClose, provider }: CartSidebarProps) {
  // 1. Calculate all static totals locally
  const totalUSDC = cart.reduce((s, i) => s + (i.priceUSDC * i.qty), 0);
  const totalTokens = cart.reduce((s, i) => s + (i.priceToken * i.qty), 0);
  const totalEarned = cart.reduce((s, i) => s + (i.tokenGifted * i.qty), 0);
  
  // 2. React State to hold the asynchronous ETH total
  const [totalETH, setTotalETH] = useState<string>("0.0000");
  const [isFetchingEth, setIsFetchingEth] = useState<boolean>(false);

  // 3. Fetch the live ETH price from Chainlink via your Smart Contract
  useEffect(() => {
    const fetchLiveEthPrice = async () => {
      if (totalUSDC === 0 || !provider) {
        setTotalETH("0.0000");
        return;
      }

      try {
        setIsFetchingEth(true);
        
        const paymentContract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, provider);
        const scaledUSDC = Math.round(totalUSDC * 100);
        
        const costInWei = await paymentContract.getCoffeeCostInETH(scaledUSDC);
        const readableEth = ethers.formatEther(costInWei);
        setTotalETH(readableEth);
        
      } catch (error) {
        console.error("Failed to fetch ETH price from Oracle:", error);
        setTotalETH("Error");
      } finally {
        setIsFetchingEth(false);
      }
    };

    fetchLiveEthPrice();
  }, [totalUSDC, provider]); 

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
                  {/* Show both USDC and Token price per item row */}
                  <p className="text-[#6F4E37]/60 text-xs font-medium mt-0.5">
                    ${(item.priceUSDC * item.qty).toFixed(2)} <span className="mx-1">•</span> {item.priceToken * item.qty} CPT
                  </p>
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
            
            {/* Tokens Earned Badge */}
            <div className="flex items-center gap-2 bg-[#FFF8E7] border border-[#C4A484]/30 rounded-lg p-2 text-xs font-semibold text-[#6F4E37]">
              <Gift className="w-4 h-4 text-[#C4A484]" />
              <div className="flex flex-col leading-tight">
                <span>Earn <span className="font-bold">+{totalEarned} Tokens</span> on this order!</span>
                <span className="text-[10px] text-[#C4A484]">*When paying with USDC or ETH</span>
              </div>
            </div>

            {/* Payment Options Breakdown */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-sm text-[#6F4E37]/70">
                <span>Pay with ETH</span>
                <span className="font-mono flex items-center gap-2">
                  {isFetchingEth ? (
                     <><Loader2 className="w-3 h-3 animate-spin" /> Fetching...</>
                  ) : (
                     `${totalETH === "Error" ? "Unavailable" : parseFloat(totalETH).toFixed(5)} ETH`
                  )}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-[#6F4E37]/70">
                <span>Pay with Tokens</span>
                <span className="font-medium">{totalTokens} CPT</span>
              </div>

              <div className="flex justify-between items-center font-bold text-[#3d2b1a] text-base pt-1">
                <span>Pay with USDC</span>
                <span>${totalUSDC.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              disabled={isFetchingEth || totalETH === "Error"}
              className="w-full mt-2 bg-[#6F4E37] hover:bg-[#5a3e2b] disabled:opacity-50 text-white rounded-xl py-3 font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/30"
            >
              Proceed to Payment →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}