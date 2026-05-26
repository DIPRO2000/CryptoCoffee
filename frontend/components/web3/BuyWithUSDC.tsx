import { useState } from "react";
import { ethers } from "ethers";
import { CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, USDC_ADDRESS, ERC20_ABI } from "./contracts";

const USDC_PRICE_PER_COFFEE = 3; // $3 USDC fallback

export default function BuyWithUSDC({ provider, account, onSuccess }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [allowance, setAllowance] = useState(null);
  const [error, setError] = useState("");

  const totalUSDC = USDC_PRICE_PER_COFFEE * qty;

  const checkAllowance = async () => {
    const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const val = await usdc.allowance(account, CAFE_PAYMENT_ADDRESS);
    setAllowance(val);
    return val;
  };

  const handleApprove = async () => {
    setError("");
    setApproving(true);
    try {
      const signer = await provider.getSigner();
      const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
      const amount = ethers.parseUnits("1000000", 6); // approve large amount
      const tx = await usdc.approve(CAFE_PAYMENT_ADDRESS, amount);
      await tx.wait();
      await checkAllowance();
    } catch (e) {
      setError(e.reason || e.message || "Approval failed");
    } finally {
      setApproving(false);
    }
  };

  const handleBuy = async () => {
    setError("");
    setLoading(true);
    try {
      const current = await checkAllowance();
      const required = ethers.parseUnits(totalUSDC.toString(), 6);
      if (current < required) {
        setError("Insufficient allowance. Please approve first.");
        setLoading(false);
        return;
      }
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, signer);
      const tx = await contract.buyWithUSDC(qty);
      await tx.wait();
      onSuccess?.("Coffee purchased with USDC! ☕ CafeTokens credited.");
    } catch (e) {
      setError(e.reason || e.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const needsApproval = allowance !== null && allowance < ethers.parseUnits(totalUSDC.toString(), 6);

  return (
    <div className="bg-white rounded-2xl border border-[#C4A484]/20 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💵</span>
        <h3 className="font-bold text-[#3d2b1a] text-lg">Pay with USDC</h3>
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
          <span className="font-bold text-[#3d2b1a] font-mono">{totalUSDC} USDC</span>
        </div>
        {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg p-2">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={approving || loading}
            className="flex-1 border border-[#6F4E37] text-[#6F4E37] hover:bg-[#6F4E37]/5 rounded-xl py-3 font-semibold text-sm transition-all duration-200 disabled:opacity-60"
          >
            {approving ? "Approving..." : "Approve USDC"}
          </button>
          <button
            onClick={handleBuy}
            disabled={loading || approving || needsApproval}
            className="flex-1 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-xl py-3 font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/25 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Buy Coffee"}
          </button>
        </div>
        {needsApproval && (
          <p className="text-xs text-[#6F4E37]/60 text-center">Approve USDC spending first to enable purchase</p>
        )}
      </div>
    </div>
  );
}