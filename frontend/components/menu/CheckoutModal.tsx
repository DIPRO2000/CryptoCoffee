import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { ethers, BrowserProvider } from "ethers";
import { 
  CAFE_PAYMENT_ADDRESS, 
  CAFE_PAYMENT_ABI, 
  USDC_ADDRESS, 
  CAFE_TOKEN_ADDRESS, 
  ERC20_ABI 
} from "@/components/web3/contracts";
import { CartItem } from "@/components/menu/MenuGrid";

interface CheckoutModalProps {
  cart: CartItem[];
  provider: BrowserProvider;
  account: string;
  // 1. Added the balance props
  ethBalance: string | null;
  usdcBalance: string | null;
  cafeBalance: string | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function CheckoutModal({ 
  cart, 
  provider, 
  account, 
  ethBalance, 
  usdcBalance, 
  cafeBalance, 
  onClose, 
  onSuccess 
}: CheckoutModalProps) {
  const [payMethod, setPayMethod] = useState<"usdc" | "eth" | "token">("usdc");
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  const totalUSDC = cart.reduce((s, i) => s + (i.priceUSDC * i.qty), 0);
  const totalTokens = cart.reduce((s, i) => s + (i.priceToken * i.qty), 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const [totalETH, setTotalETH] = useState<string>("0.0000");
  const [costInWei, setCostInWei] = useState<bigint | null>(null);
  const [isFetchingEth, setIsFetchingEth] = useState<boolean>(true);

  useEffect(() => {
    const fetchLiveEthPrice = async () => {
      try {
        setIsFetchingEth(true);
        const paymentContract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, provider);
        const scaledUSDC = Math.round(totalUSDC * 100);
        const wei = await paymentContract.getCoffeeCostInETH(scaledUSDC);
        
        setCostInWei(wei);
        setTotalETH(ethers.formatEther(wei));
      } catch (err) {
        console.error("Failed to fetch ETH price:", err);
        setTotalETH("Error");
      } finally {
        setIsFetchingEth(false);
      }
    };

    fetchLiveEthPrice();
  }, [totalUSDC, provider]);

  const handleApprove = async () => {
    setError("");
    setApproving(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
      const parsedAmount = ethers.parseUnits(totalUSDC.toFixed(6), 6);
      
      const tx = await contract.approve(CAFE_PAYMENT_ADDRESS, parsedAmount);
      await tx.wait();
      
    } catch (e: any) {
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
        if (!costInWei) throw new Error("ETH price not loaded yet");
        const tx = await contract.buyWithETH(totalItems, { value: costInWei });
        await tx.wait();

      } else if (payMethod === "usdc") {
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

      } else if (payMethod === "token") {
        const required = ethers.parseUnits(totalTokens.toString(), 18); 
        const tx = await contract.redeem(required);
        await tx.wait();
      }

      onSuccess(`Order placed! ☕ ${totalItems} item${totalItems > 1 ? "s" : ""} purchased.`);
    } catch (e: any) {
      setError(e.reason || e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-5 border-b border-[#C4A484]/15 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-[#3d2b1a] text-lg">Checkout</h2>
          <button onClick={onClose} className="text-[#6F4E37]/50 hover:text-[#6F4E37] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto space-y-2">
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-[#3d2b1a]">
                {item.emoji} {item.name} <span className="text-[#6F4E37]/50">×{item.qty}</span>
              </span>
              <div className="flex gap-3 font-medium text-[#3d2b1a]">
                <span className="text-[#C4A484]">{item.priceToken * item.qty} CPT</span>
                <span>${(item.priceUSDC * item.qty).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shrink-0 pt-2 pb-6 border-t border-[#C4A484]/10">
          
          {/* 2. Enhanced Totals Box with Balances */}
          <div className="mx-6 rounded-2xl bg-[#FFF8E7] px-4 py-3 mb-4 space-y-2.5">
            
            <div className="flex justify-between items-start text-sm text-[#6F4E37]/70">
              <div className="flex flex-col">
                <span>ETH Total</span>
                <span className="text-[10px] font-semibold text-[#C4A484]">Avail: {ethBalance || "0.00"} ETH</span>
              </div>
              <span className="font-mono flex items-center gap-2 mt-0.5">
                {isFetchingEth ? <Loader2 className="w-3 h-3 animate-spin" /> : `${parseFloat(totalETH).toFixed(5)} ETH`}
              </span>
            </div>

            <div className="flex justify-between items-start text-sm text-[#6F4E37]/70">
              <div className="flex flex-col">
                <span>Token Total</span>
                <span className="text-[10px] font-semibold text-[#C4A484]">Avail: {cafeBalance || "0"} CPT</span>
              </div>
              <span className="font-medium mt-0.5">{totalTokens} CPT</span>
            </div>

            <div className="flex justify-between items-start font-bold text-[#3d2b1a] pt-2 border-t border-[#C4A484]/20 mt-1">
              <div className="flex flex-col">
                <span>USDC Total</span>
                <span className="text-[10px] font-semibold text-[#C4A484]">Avail: ${usdcBalance || "0.00"}</span>
              </div>
              <span className="mt-0.5">${totalUSDC.toFixed(2)}</span>
            </div>
            
          </div>

          <div className="px-6 mb-4">
            <p className="text-xs font-semibold text-[#6F4E37]/50 uppercase tracking-wider mb-2">Select Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "usdc", label: "USDC" },
                { id: "eth", label: "ETH" },
                { id: "token", label: "Tokens" }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id as any)}
                  className={`rounded-xl py-2.5 text-xs font-bold border transition-all duration-150 ${
                    payMethod === m.id
                      ? "bg-[#6F4E37] text-white border-[#6F4E37] shadow-md"
                      : "bg-white border-[#C4A484]/30 text-[#6F4E37] hover:bg-[#6F4E37]/5"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mx-6 mb-3 text-red-500 text-xs bg-red-50 rounded-xl p-2.5">{error}</p>}

          <div className="px-6 space-y-2">
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
              disabled={loading || approving || isFetchingEth || totalETH === "Error"}
              className="w-full bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-xl py-3 font-bold transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/30 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Processing..." : `Pay ${
                payMethod === "usdc" ? `$${totalUSDC.toFixed(2)} USDC` : 
                payMethod === "eth" ? `${parseFloat(totalETH).toFixed(5)} ETH` : 
                `${totalTokens} Tokens`
              }`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}