import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider } from "ethers";
import { Coffee, CheckCircle, ShoppingBag } from "lucide-react";

// Assuming these are your imported components
import WalletConnect from "../components/web3/WalletConnect";
import BalanceCard from "../components/web3/BalanceCard";
import RedeemTokens from "../components/web3/RedeemTokens";
import AdminPanel from "../components/web3/AdminPanel";
import MenuGrid from "../components/menu/MenuGrid";
import CartSidebar from "../components/menu/CardSidebar";
import CheckoutModal from "../components/menu/CheckoutModal";

import {
  CAFE_TOKEN_ADDRESS,
  CAFE_PAYMENT_ADDRESS,
  USDC_ADDRESS,
  SEPOLIA_CHAIN_ID,
  CAFE_PAYMENT_ABI,
  ERC20_ABI
} from "../components/web3/contracts";

// 1. Declare global window interface for MetaMask injection
declare global {
  interface Window {
    ethereum?: any;
  }
}

// 2. Define TypeScript interfaces for your data structures
export interface MenuItem {
  id: string | number;
  name?: string;
  price?: number;
  // Fallback for other item properties (image, description, etc.)
  [key: string]: any; 
}

export interface CartItem extends MenuItem {
  qty: number;
}

export default function Home() {
  // 3. Explicitly type all useState hooks
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [cafeBalance, setCafeBalance] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  // 4. Type function parameters
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateCartQty = (id: string | number, qty: number) =>
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));

  const removeFromCart = (id: string | number) =>
    setCart((prev) => prev.filter((c) => c.id !== id));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 6000);
  };

  // 5. Type useCallback parameters (BrowserProvider and string for address)
  const loadBalances = useCallback(async (prov: BrowserProvider, acc: string) => {
    try {
      const ethBal = await prov.getBalance(acc);
      setEthBalance(parseFloat(ethers.formatEther(ethBal)).toFixed(4));

      const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, prov);
      const usdcBal = await usdc.balanceOf(acc);
      setUsdcBalance(parseFloat(ethers.formatUnits(usdcBal, 6)).toFixed(2));

      const cafe = new ethers.Contract(CAFE_TOKEN_ADDRESS, ERC20_ABI, prov);
      const cafeBal = await cafe.balanceOf(acc);
      setCafeBalance(parseFloat(ethers.formatUnits(cafeBal, 18)).toFixed(2));

      const payment = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, prov);
      const owner = await payment.owner();
      setIsOwner(owner.toLowerCase() === acc.toLowerCase());
    } catch {
      // silently handle if contracts not deployed yet
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected. Please install MetaMask.");
      return;
    }
    setConnecting(true);
    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = await prov.getSigner();
      const addr = await signer.getAddress();
      const network = await prov.getNetwork();

      setProvider(prov);
      setAccount(addr);
      setChainId(network.chainId.toString());

      await loadBalances(prov, addr);
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  };

  const handleSuccess = async (msg: string) => {
    showSuccess(msg);
    if (provider && account) {
      await loadBalances(provider, account);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;
    
    // Explicitly typing 'accs' as string array
    window.ethereum.on("accountsChanged", (accs: string[]) => {
      if (accs.length === 0) {
        setAccount(null);
        setProvider(null);
      } else {
        setAccount(accs[0]);
        if (provider) loadBalances(provider, accs[0]);
      }
    });
    window.ethereum.on("chainChanged", () => window.location.reload());
  }, [provider, loadBalances]);

  const isOnSepolia = chainId === parseInt(SEPOLIA_CHAIN_ID, 16).toString();
  const canInteract = !!account && isOnSepolia;

  return (
    <div className="min-h-screen bg-[#FFF8E7]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-[#C4A484]/20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#6F4E37] rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-[#3d2b1a] text-lg leading-none block">Café Web3</span>
              <span className="text-[#6F4E37]/50 text-xs">on Sepolia</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {account && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 bg-[#FFF8E7] border border-[#C4A484]/30 rounded-full px-4 py-2 text-[#6F4E37] font-semibold text-sm hover:bg-[#C4A484]/10 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#6F4E37] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <WalletConnect
              account={account}
              chainId={chainId}
              onConnect={connectWallet}
              connecting={connecting}
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
        <div className="inline-block bg-[#6F4E37]/10 text-[#6F4E37] text-xs font-semibold rounded-full px-3 py-1 mb-5 uppercase tracking-wider">
          Blockchain Loyalty Rewards
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#3d2b1a] leading-tight mb-4">
          Your Morning Coffee,<br />Reimagined
        </h1>
        <p className="text-[#6F4E37]/70 text-lg max-w-lg mx-auto">
          Pay with ETH or USDC and earn CafeToken loyalty points with every purchase.
        </p>
      </section>

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white rounded-2xl px-5 py-3 flex items-center gap-2.5 shadow-xl z-50 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-8">
        {/* Balances */}
        {account && (
          <section>
            <h2 className="text-xs font-semibold text-[#6F4E37]/50 uppercase tracking-wider mb-3">Your Balances</h2>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <BalanceCard label="ETH" value={ethBalance} symbol="Ether" icon="⟠" />
              <BalanceCard label="USDC" value={usdcBalance} symbol="USD Coin" icon="💵" />
              <BalanceCard label="CAFE" value={cafeBalance} symbol="CafeToken" icon="☕" />
            </div>
          </section>
        )}

        {/* Not connected */}
        {!account && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#6F4E37]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-10 h-10 text-[#6F4E37]" />
            </div>
            <p className="text-[#6F4E37]/70 mb-6">Connect your MetaMask wallet to start ordering</p>
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-full px-8 py-3 font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/30 disabled:opacity-60"
            >
              {connecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          </div>
        )}

        {/* Wrong network */}
        {account && !isOnSepolia && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <p className="font-semibold text-amber-800 mb-1">Wrong Network</p>
            <p className="text-amber-700/70 text-sm">Please switch your wallet to the Sepolia test network to continue.</p>
          </div>
        )}

        {/* Menu */}
        {canInteract && (
          <>
            <section>
              <h2 className="text-xs font-semibold text-[#6F4E37]/50 uppercase tracking-wider mb-3">Our Menu</h2>
              <MenuGrid onAddToCart={addToCart} cart={cart} />
            </section>

            <RedeemTokens provider={provider} cafeBalance={cafeBalance} onSuccess={handleSuccess} />

            {isOwner && (
              <AdminPanel provider={provider} onSuccess={handleSuccess} />
            )}
          </>
        )}

        {/* Cart sidebar */}
        {cartOpen && (
          <CartSidebar
            cart={cart}
            onUpdate={updateCartQty}
            onRemove={removeFromCart}
            onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
            onClose={() => setCartOpen(false)}
          />
        )}

        {/* Checkout modal */}
        {checkoutOpen && (
          <CheckoutModal
            cart={cart}
            provider={provider}
            account={account}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={(msg: string) => {
              setCheckoutOpen(false);
              setCart([]);
              handleSuccess(msg);
            }}
          />
        )}

        {/* How it works */}
        <section className="grid sm:grid-cols-3 gap-4 pt-4">
          {[
            { icon: "🔗", title: "Connect Wallet", desc: "Link your MetaMask on Sepolia testnet" },
            { icon: "☕", title: "Buy Coffee", desc: "Pay with ETH or USDC, earn CafeTokens" },
            { icon: "🎁", title: "Redeem Rewards", desc: "Trade your tokens for a free coffee" }
          ].map((s) => (
            <div key={s.title} className="bg-white rounded-2xl border border-[#C4A484]/20 p-5 text-center shadow-sm">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-[#3d2b1a] text-sm mb-1">{s.title}</h3>
              <p className="text-[#6F4E37]/60 text-xs">{s.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}