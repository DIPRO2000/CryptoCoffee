"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider } from "ethers";
import { Coffee, CheckCircle, ShoppingBag, ArrowLeft, Info } from "lucide-react"; 
import Link from "next/link";

// Adjust these relative imports based on your folder structure!
import WalletConnect from "@/components/web3/WalletConnect";
import BalanceCard from "@/components/web3/BalanceCard";
import MenuGrid, {MenuItem, CartItem} from "@/components/menu/MenuGrid";
import CartSidebar from "@/components/menu/CardSidebar";
import CheckoutModal from "@/components/menu/CheckoutModal";
import { Eip1193Provider } from "ethers";

import {
  CAFE_TOKEN_ADDRESS,
  CAFE_PAYMENT_ADDRESS,
  USDC_ADDRESS,
  SEPOLIA_CHAIN_ID,
  CAFE_PAYMENT_ABI,
  ERC20_ABI
} from "@/components/web3/contracts";

declare global {
  interface Window {
    // We take the official ethers type AND append our custom event listeners
    ethereum?: Eip1193Provider & {
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export default function Marketplace() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [cafeBalance, setCafeBalance] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

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

      await prov.send("wallet_requestPermissions", [
        { eth_accounts: {} }
      ]);

      await prov.send("eth_requestAccounts", []);

      const signer = await prov.getSigner();
      const addr = await signer.getAddress();
      const network = await prov.getNetwork();

      setProvider(prov);
      setAccount(addr);
      setChainId(network.chainId.toString());

      await loadBalances(prov, addr);
    } catch (e) {
      console.error("Wallet connection cancelled or failed:", e);
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

  const HARDHAT_CHAIN_ID = "1337"; 
  const SEPOLIA_DECIMAL = parseInt(SEPOLIA_CHAIN_ID, 16).toString();

  const isDevelopment = process.env.NEXT_PUBLIC_NODE_ENV === "development";
  const isCorrectNetwork = isDevelopment 
    ? (chainId === SEPOLIA_DECIMAL || chainId === HARDHAT_CHAIN_ID)
    : (chainId === SEPOLIA_DECIMAL);

  const canInteract = !!account && isCorrectNetwork;

  return (
    <div className="min-h-screen bg-[#FFF8E7]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* App Header */}
      <header className="border-b border-[#C4A484]/20 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          
          {/* Left Side: Logo & Back (Added min-w-0 to prevent text blowout) */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/" className="p-1.5 sm:p-2 hover:bg-[#C4A484]/10 rounded-full transition-colors text-[#6F4E37] -ml-2 sm:ml-0 shrink-0">
              <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#6F4E37] rounded-xl flex items-center justify-center shrink-0">
                <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {/* Hide text entirely on extra tiny screens to leave room for wallet address */}
              <div className="hidden min-[400px]:block truncate">
                <span className="font-bold text-[#3d2b1a] text-base sm:text-lg leading-none block truncate">Store</span>
                <span className="text-[#6F4E37]/50 text-[10px] sm:text-xs">Sepolia</span>
              </div>
            </div>
          </div>
          
          {/* Right Side: Cart & Wallet (Added shrink-0 to protect buttons) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {account && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-1.5 bg-[#FFF8E7] border border-[#C4A484]/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[#6F4E37] font-semibold text-sm hover:bg-[#C4A484]/10 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#6F4E37] text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-bold">
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

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-center gap-2 shadow-xl z-50 text-xs sm:text-sm font-medium w-[90%] max-w-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{successMsg}</span>
        </div>
      )}

      {/* Main Marketplace Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-20 space-y-6 sm:space-y-8">
        
        {/* Balances */}
        {account && (
          <section>
            {/* MOBILE FIX: Make the gap larger on mobile, and stretch the faucet link full width */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-3 gap-3 sm:gap-2">
              <h2 className="text-[10px] sm:text-xs font-semibold text-[#6F4E37]/50 uppercase tracking-wider">Your Wallet Balances</h2>
              
              <a 
                href="https://faucet.circle.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-semibold text-[#6F4E37]/70 hover:text-[#3d2b1a] transition-colors bg-[#6F4E37]/5 hover:bg-[#6F4E37]/10 px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-full w-full sm:w-auto text-center"
              >
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Need test USDC? Get it from the Circle Faucet ↗</span>
              </a>
            </div>

            {/* MOBILE FIX: Changed to grid-cols-2 on mobile. ETH/USDC side by side, CAFE full width underneath */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <BalanceCard label="ETH" value={ethBalance} symbol="Ether" icon="⟠" />
              <BalanceCard label="USDC" value={usdcBalance} symbol="USD Coin" icon="💵" />
              <div className="col-span-2 sm:col-span-1">
                <BalanceCard label="CAFE" value={cafeBalance} symbol="CryptoCoffeeToken (CCT)" icon="☕" />
              </div>
            </div>
          </section>
        )}

        {/* Not connected State */}
        {!account && (
          <div className="text-center py-12 sm:py-20 px-4 bg-white rounded-2xl sm:rounded-3xl border border-[#C4A484]/20 shadow-sm mt-4 sm:mt-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#6F4E37]/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-8 h-8 sm:w-10 sm:h-10 text-[#6F4E37]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3d2b1a] mb-2">Welcome to the Counter</h2>
            <p className="text-[#6F4E37]/70 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">Connect your MetaMask wallet to view the menu, place orders, and manage your CafeTokens.</p>
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-full px-6 sm:px-8 py-3 font-semibold text-sm sm:text-base transition-all duration-200 hover:shadow-lg hover:shadow-[#6F4E37]/30 disabled:opacity-60 w-full sm:w-auto"
            >
              {connecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          </div>
        )}

        {/* Wrong network State */}
        {account && !isCorrectNetwork && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center">
            <p className="font-semibold text-amber-800 text-sm sm:text-base mb-1">Wrong Network</p>
            <p className="text-amber-700/70 text-xs sm:text-sm">
              {process.env.NEXT_PUBLIC_NODE_ENV === "development" 
                ? "Please switch your wallet to Localhost 8545 (Chain ID 1337) or Sepolia."
                : "Please switch your wallet to the Sepolia test network to continue ordering."}
            </p>
          </div>
        )}

        {/* Storefront / Menu */}
        {canInteract && (
          <>
            <section className="pt-2 sm:pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#3d2b1a]">Fresh Menu</h2>
              </div>
              <MenuGrid onAddToCart={addToCart} cart={cart} />
            </section>
          </>
        )}

        {/* Cart sidebar */}
        {cartOpen && (
          <CartSidebar
            cart={cart}
            provider={provider}
            onUpdate={updateCartQty}
            onRemove={removeFromCart}
            onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
            onClose={() => setCartOpen(false)}
          />
        )}

        {/* Checkout modal */}
        {checkoutOpen && provider && account && (
          <CheckoutModal
            cart={cart}
            provider={provider}
            account={account}
            ethBalance={ethBalance}   
            usdcBalance={usdcBalance} 
            cafeBalance={cafeBalance} 
            onClose={() => setCheckoutOpen(false)}
            onSuccess={(msg: string) => {
              setCheckoutOpen(false);
              setCart([]);
              handleSuccess(msg);
            }}
          />
        )}
      </main>
    </div>
  );
}