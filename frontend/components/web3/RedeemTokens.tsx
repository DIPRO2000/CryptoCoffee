import { useState } from "react";
import { Gift } from "lucide-react";
import { ethers } from "ethers";
import { CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI } from "./contracts";

export default function RedeemTokens({ provider, cafeBalance, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRedeem = async () => {
    setError("");
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, signer);
      const amount = ethers.parseUnits(cafeBalance || "0", 18);
      const tx = await contract.redeem(amount);
      await tx.wait();
      onSuccess?.("CafeTokens redeemed! Enjoy your free coffee ☕");
    } catch (e) {
      setError(e.reason || e.message || "Redemption failed");
    } finally {
      setLoading(false);
    }
  };

  const hasTokens = parseFloat(cafeBalance || "0") > 0;

  return (
    <div className="bg-gradient-to-br from-[#6F4E37] to-[#5a3e2b] rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-5 h-5 text-[#C4A484]" />
        <h3 className="font-bold text-lg">Redeem Loyalty Points</h3>
      </div>
      <p className="text-white/60 text-sm mb-5">Use your CafeTokens to get a free coffee</p>
      <div className="bg-white/10 rounded-xl p-3 mb-5 flex justify-between items-center">
        <span className="text-white/70 text-sm">Your Balance</span>
        <span className="font-bold font-mono">{cafeBalance ?? "—"} CAFE</span>
      </div>
      {error && <p className="text-red-300 text-xs bg-red-900/30 rounded-lg p-2 mb-3">{error}</p>}
      <button
        onClick={handleRedeem}
        disabled={loading || !hasTokens}
        className="w-full bg-white text-[#6F4E37] rounded-xl py-3 font-bold text-sm transition-all duration-200 hover:bg-[#FFF8E7] hover:shadow-lg disabled:opacity-50"
      >
        {loading ? "Redeeming..." : hasTokens ? "Redeem All Tokens" : "No Tokens to Redeem"}
      </button>
    </div>
  );
}