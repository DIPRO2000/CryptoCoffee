import { Wallet, AlertTriangle } from "lucide-react";
import { SEPOLIA_CHAIN_ID } from "./contracts";

interface WalletConnectProps {
  account: string | null;
  chainId: string | number | null;
  onConnect: () => void;
  connecting: boolean;
}

export default function WalletConnect({ 
  account, 
  chainId, 
  onConnect, 
  connecting 
}: WalletConnectProps) {
  
  const isWrongNetwork = account && chainId && chainId.toString() !== parseInt(SEPOLIA_CHAIN_ID, 16).toString();

  // Made the address slice slightly shorter (4 chars) to save extra mobile pixels
  const shortAddress = (addr: string | null) => 
    addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : "";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* FIX: Added 'hidden sm:flex' so this pill hides on mobile. 
          The main Marketplace page already shows a big warning in the body anyway! */}
      {isWrongNetwork && (
        <div className="hidden sm:flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          Switch to Sepolia
        </div>
      )}
      
      {account ? (
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#6F4E37]/10 border border-[#6F4E37]/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
          <span className="text-[#6F4E37] font-mono text-xs sm:text-sm font-medium">{shortAddress(account)}</span>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="flex items-center gap-2 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/30 disabled:opacity-60 shrink-0"
        >
          <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {connecting ? "Connecting..." : "Connect"}
        </button>
      )}
    </div>
  );
}