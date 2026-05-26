import { useState } from "react";
import { Zap } from "lucide-react";
import { ethers } from "ethers";
import { CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI } from "./contracts";

const ETH_PRICE_PER_COFFEE = "0.001"; // fallback fixed rate

export default function BuyWithETH({ provider, onSuccess }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalETH = (parseFloat(ETH_PRICE_PER_COFFEE) * qty).toFixed(5);

  const handleBuy = async () => {
    setError("");
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, signer);
      
      let pricePerCoffee;
      try {
        pricePerCoffee = await contract.coffeePrice();
      } catch {
        pricePerCoffee = ethers.parseEther(ETH_PRICE_PER_COFFEE);
      }

      const totalValue = pricePerCoffee * BigInt(qty);
      const tx = await contract.buyWithETH(qty, { value: totalValue });
      await tx.wait();
      onSuccess?.("Coffee purchased with ETH! ☕ CafeTokens credited.");
    } catch (e) {
      setError(e.reason || e.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#C4A484]/20 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⟠</span>
        <h3 className="font-bold text-[#3d2b1a] text-lg">Pay with ETH</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[#6F4E37]/70 uppercase tracking-wider mb-1.5 block">Quantity</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 rounded-xl bg-[#FFF8E7] border border-[#C4A484]/30 text-[#6F4E37] font-bold text-lg hover:bg-[#C4A484]/10 transition-colors">−</button>
            <span className="text-2xl font-bold text-[#3d2b1a] w-8 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-9 h-9 rounded-xl bg-[#FFF8E7] border border-[#C4A484]/30 text-[#6F4E37] font-bold text-lg hover:bg-[#C4A484]/10 transition-colors">+</button>
          </div>
        </div>
        <div className="bg-[#FFF8E7] rounded-xl p-3 flex justify-between items-center">
          <span className="text-sm text-[#6F4E37]/70">Total</span>
          <span className="font-bold text-[#3d2b1a] font-mono">{totalETH} ETH</span>
        </div>
        {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg p-2">{error}</p>}
        <button
          onClick={handleBuy}
          disabled={loading}
          className="w-full bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-xl py-3 font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/25 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {loading ? "Processing..." : "Buy Coffee"}
        </button>
      </div>
    </div>
  );
}