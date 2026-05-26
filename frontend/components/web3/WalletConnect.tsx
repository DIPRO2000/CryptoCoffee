import { Wallet, AlertTriangle, Coffee } from "lucide-react";
import { SEPOLIA_CHAIN_ID } from "./contracts";

export default function WalletConnect({ account, chainId, onConnect, connecting }) {
  const isWrongNetwork = account && chainId && chainId !== parseInt(SEPOLIA_CHAIN_ID, 16).toString();

  const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div className="flex items-center gap-3">
      {isWrongNetwork && (
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          Switch to Sepolia
        </div>
      )}
      {account ? (
        <div className="flex items-center gap-2 bg-[#6F4E37]/10 border border-[#6F4E37]/20 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[#6F4E37] font-mono text-sm font-medium">{shortAddress(account)}</span>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="flex items-center gap-2 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/30 disabled:opacity-60"
        >
          <Wallet className="w-4 h-4" />
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}