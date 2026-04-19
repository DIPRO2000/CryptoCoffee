import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { ethers } from "ethers";
import { CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, USDC_ADDRESS, ERC20_ABI } from "../web3/contracts";

export default function CheckoutModal({ cart, provider, account, onClose, onSuccess }) {
  const [payMethod, setPayMethod] = useState("usdc");
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  const totalUSDC = cart.reduce((s, i) => s + i.priceUSDC * i.qty, 0);
  const totalETH  = cart.reduce((s, i) => s + i.priceETH  * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const handleApprove = async () => {
    setError("");
    setApproving(true);
    try {
      const signer = await provider.getSigner();
      const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
      const amount = ethers.parseUnits("1000000", 6);
      const tx = await usdc.approve(CAFE_PAYMENT_ADDRESS, amount);
      await tx.wait();
    } catch (e) {
      setError(e.reason || e.message || "Approval failed");
    } finally {
      setApproving(false);
    }
  };

  const handlePay = async () => {
    setError("");
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, signer);

      if (payMethod === "eth") {
        const value = ethers.parseEther(totalETH.toFixed(8));
        // Send total items as quantity, value as ETH
        const tx = await contract.buyWithETH(totalItems, { value });
        await tx.wait();
      } else {
        // Check allowance first
        const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
        const allowance = await usdc.allowance(account, CAFE_PAYMENT_ADDRESS);
        const required = ethers.parseUnits(totalUSDC.toFixed(6), 6);
        if (allowance < required) {
          setError("Please approve USDC spending first.");
          setLoading(false);
          return;
        }
        const tx = await contract.buyWithUSDC(totalItems);
        await tx.wait();
      }

      onSuccess(`Order placed! ☕ ${totalItems} item${totalItems > 1 ? "s" : ""} purchased. CafeTokens credited!`);
    } catch (e) {
      setError(e.reason || e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#C4A484]/15 flex items-center justify-between">
          <h2 className="font-bold text-[#3d2b1a] text-lg">Checkout</h2>
          <button onClick={onClose} className="text-[#6F4E37]/50 hover:text-[#6F4E37]"><X className="w-5 h-5" /></button>
        </div>

        {/* Order summary */}
        <div className="px-6 py-4 max-h-48 overflow-y-auto space-y-2">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-[#3d2b1a]">{item.emoji} {item.name} <span className="text-[#6F4E37]/50">×{item.qty}</span></span>
              <span className="font-medium text-[#3d2b1a]">${(item.priceUSDC * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mx-6 rounded-2xl bg-[#FFF8E7] px-4 py-3 mb-4 space-y-1">
          <div className="flex justify-between text-sm text-[#6F4E37]/70">
            <span>ETH Total</span><span className="font-mono">{totalETH.toFixed(5)} ETH</span>
          </div>
          <div className="flex justify-between font-bold text-[#3d2b1a]">
            <span>USDC Total</span><span>${totalUSDC.toFixed(2)}</span>
          </div>
        </div>

        {/* Pay method */}
        <div className="px-6 mb-4">
          <p className="text-xs font-semibold text-[#6F4E37]/50 uppercase tracking-wider mb-2">Pay with</p>
          <div className="grid grid-cols-2 gap-2">
            {["usdc", "eth"].map(m => (
              <button
                key={m}
                onClick={() => setPayMethod(m)}
                className={`rounded-xl py-2.5 text-sm font-semibold border transition-all duration-150 ${
                  payMethod === m
                    ? "bg-[#6F4E37] text-white border-[#6F4E37]"
                    : "bg-white border-[#C4A484]/30 text-[#6F4E37] hover:bg-[#6F4E37]/5"
                }`}
              >
                {m === "usdc" ? "💵 USDC" : "⟠ ETH"}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <p className="mx-6 mb-3 text-red-500 text-xs bg-red-50 rounded-xl p-2.5">{error}</p>}

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          {payMethod === "usdc" && (
            <button
              onClick={handleApprove}
              disabled={approving || loading}
              className="w-full border border-[#6F4E37] text-[#6F4E37] hover:bg-[#6F4E37]/5 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {approving && <Loader2 className="w-4 h-4 animate-spin" />}
              {approving ? "Approving..." : "Approve USDC"}
            </button>
          )}
          <button
            onClick={handlePay}
            disabled={loading || approving}
            className="w-full bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-xl py-3 font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/30 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Processing..." : `Pay ${payMethod === "usdc" ? `$${totalUSDC.toFixed(2)} USDC` : `${totalETH.toFixed(5)} ETH`}`}
          </button>
        </div>
      </div>
    </div>
  );
}