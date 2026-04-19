import { useState } from "react";
import { Shield } from "lucide-react";
import { ethers } from "ethers";
import { CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI } from "./contracts";

export default function AdminPanel({ provider, onSuccess }) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const withdraw = async (type) => {
    setError("");
    setLoading(type);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, signer);
      const tx = type === "ETH" ? await contract.withdrawETH() : await contract.withdrawUSDC();
      await tx.wait();
      onSuccess?.(`${type} withdrawn successfully.`);
    } catch (e) {
      setError(e.reason || e.message || "Withdrawal failed");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-amber-600" />
        <h3 className="font-bold text-[#3d2b1a] text-sm">Admin Panel</h3>
      </div>
      <p className="text-[#6F4E37]/50 text-xs mb-4">Owner-only controls</p>
      {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg p-2 mb-3">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => withdraw("ETH")}
          disabled={!!loading}
          className="flex-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
        >
          {loading === "ETH" ? "Withdrawing..." : "Withdraw ETH"}
        </button>
        <button
          onClick={() => withdraw("USDC")}
          disabled={!!loading}
          className="flex-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
        >
          {loading === "USDC" ? "Withdrawing..." : "Withdraw USDC"}
        </button>
      </div>
    </div>
  );
}