"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider } from "ethers";
import { Lock, Coffee, Wallet, ShieldAlert, Save, RefreshCw, Send, Plus, Trash2, AlertCircle, ListChecks, Undo2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

// Adjust these imports to match your project structure
import { 
  CAFE_PAYMENT_ADDRESS, 
  CAFE_PAYMENT_ABI 
} from "@/components/web3/contracts";
import { MenuItem } from "@/components/menu/MenuGrid";

const EMOJI_PALETTE = ['☕', '🍵', '🥤', '🧋', '🥛', '🧊', '🥐', '🥯', '🍞', '🥞', '🧇', '🧀', '🥗', '🥪', '🍰', '🧁', '🍪', '🍩', '🍨', '🍫', '🎁'];

interface ChangeItem {
  id: string;
  name: string;
  type: 'ADD' | 'REMOVE' | 'UPDATE';
  details?: string[];
}

export default function AdminPage() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(false);

  const [contractEth, setContractEth] = useState<string>("0.00");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [newOwner, setNewOwner] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const [originalMenuItems, setOriginalMenuItems] = useState<MenuItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isFetchingMenu, setIsFetchingMenu] = useState<boolean>(true);
  
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openEmojiId, setOpenEmojiId] = useState<string | null>(null);

  const showMessage = (text: string, type: "error" | "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const connectAndCheckOwner = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    setLoadingAuth(true);
    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
      await prov.send("eth_requestAccounts", []);
      const signer = await prov.getSigner();
      const addr = await signer.getAddress();
      
      setProvider(prov);
      setAccount(addr);

      const contract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, prov);
      const contractOwner = await contract.owner();
      
      if (addr.toLowerCase() === contractOwner.toLowerCase()) {
        setIsOwner(true);
        const ethBal = await prov.getBalance(CAFE_PAYMENT_ADDRESS);
        setContractEth(ethers.formatEther(ethBal));
        fetchMenu(); 
      } else {
        setIsOwner(false);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleWithdraw = async (asset: "ETH" | "USDC") => {
    if (!provider) return;
    setLoadingAction(`withdraw_${asset}`);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, signer);
      const tx = asset === "ETH" ? await contract.withdrawETH() : await contract.withdrawUSDC();
      await tx.wait();
      
      showMessage(`Successfully withdrew ${asset} to your wallet!`, "success");
      const ethBal = await provider.getBalance(CAFE_PAYMENT_ADDRESS);
      setContractEth(ethers.formatEther(ethBal));
    } catch (e: any) {
      showMessage(e.reason || e.message || `Failed to withdraw ${asset}`, "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleTransferOwnership = async () => {
    if (!provider || !ethers.isAddress(newOwner)) return showMessage("Please enter a valid Ethereum address.", "error");
    setLoadingAction("transfer");
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CAFE_PAYMENT_ADDRESS, CAFE_PAYMENT_ABI, signer);
      const tx = await contract.transferOwnership(newOwner);
      await tx.wait();
      showMessage("Ownership transferred successfully. You will now be logged out.", "success");
      setTimeout(() => window.location.reload(), 3000); 
    } catch (e: any) {
      showMessage(e.reason || e.message || "Failed to transfer ownership", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const fetchMenu = async () => {
    setIsFetchingMenu(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/menu`);
      if (res.ok) {
        const data = await res.json();
        // Ensure all fetched items have an isAvailable property to prevent undefined errors
        const sanitizedData = data.map((item: any) => ({
          ...item,
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
        }));
        setMenuItems(JSON.parse(JSON.stringify(sanitizedData)));
        setOriginalMenuItems(JSON.parse(JSON.stringify(sanitizedData)));
      }
    } catch (e) {
      showMessage("Failed to load menu from database.", "error");
    } finally {
      setIsFetchingMenu(false);
    }
  };

  const handleSaveMenu = async () => {
    if (!provider) return;
    setLoadingAction("save_menu");
    try {
      const signer = await provider.getSigner();
      const timestamp = Date.now();
      const authMessage = `Authorize Cafe Menu Update\nTimestamp: ${timestamp}`;
      const signature = await signer.signMessage(authMessage);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/menu/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updatedMenu: menuItems,
          auth: { message: authMessage, signature: signature, timestamp: timestamp }
        })
      });

      if (!res.ok) throw new Error(await res.text());
      showMessage("Menu successfully updated in the database!", "success");
      setOriginalMenuItems(JSON.parse(JSON.stringify(menuItems)));
    } catch (e: any) {
      showMessage(e.message || "Failed to securely update menu.", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRevertMenu = () => {
    setMenuItems(JSON.parse(JSON.stringify(originalMenuItems)));
    setOpenEmojiId(null);
  };

  const addMenuItem = () => {
    const newCat = activeCategory !== "All" ? activeCategory : "Coffee";
    // ADDED: Default isAvailable to true for new items
    const newItem: MenuItem = { id: `item_${Date.now()}`, name: "", category: newCat, emoji: "☕", desc: "", priceUSDC: 1, priceToken: 10, tokenGifted: 2, isAvailable: true };
    setMenuItems([...menuItems, newItem]);
  };
  
  const updateMenuItem = (id: string | number, field: string, value: any) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeMenuItem = (id: string | number) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const getPendingChanges = (): ChangeItem[] => {
    const changes: ChangeItem[] = [];
    originalMenuItems.forEach(orig => {
      const curr = menuItems.find(i => i.id === orig.id);
      if (!curr) {
        changes.push({ id: orig.id as string, name: orig.name || "Unnamed Item", type: "REMOVE" });
      } else {
        const details: string[] = [];
        if (orig.name !== curr.name) details.push(`Name changed`);
        if (orig.desc !== curr.desc) details.push(`Description modified`);
        if (orig.priceUSDC !== curr.priceUSDC) details.push(`USD: $${orig.priceUSDC} ➔ $${curr.priceUSDC}`);
        if (orig.priceToken !== curr.priceToken) details.push(`CPT: ${orig.priceToken} ➔ ${curr.priceToken}`);
        if (orig.tokenGifted !== curr.tokenGifted) details.push(`Gift: ${orig.tokenGifted} ➔ ${curr.tokenGifted}`);
        if (orig.category !== curr.category) details.push(`Category: ${orig.category} ➔ ${curr.category}`);
        if (orig.emoji !== curr.emoji) details.push(`Emoji changed`);
        
        // ADDED: Track availability changes
        if (orig.isAvailable !== curr.isAvailable) {
          details.push(`Status: ${orig.isAvailable ? 'In Stock' : 'Sold Out'} ➔ ${curr.isAvailable ? 'In Stock' : 'Sold Out'}`);
        }

        if (details.length > 0) changes.push({ id: curr.id as string, name: curr.name || "Unnamed Item", type: "UPDATE", details });
      }
    });
    menuItems.forEach(curr => {
      if (!originalMenuItems.find(i => i.id === curr.id)) changes.push({ id: curr.id as string, name: curr.name || "New Item", type: "ADD" });
    });
    return changes;
  };

  const pendingChanges = getPendingChanges();
  const hasChanges = pendingChanges.length > 0;
  const availableCategories = ["All", ...Array.from(new Set(menuItems.map(i => i.category)))];
  const filterTabs = Array.from(new Set([...availableCategories, "Coffee", "Tea", "Snack", "Drink", "Dessert"]));
  const filteredMenu = activeCategory === "All" ? menuItems : menuItems.filter(item => item.category === activeCategory);

  if (!account) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#C4A484]/20 max-w-md w-full text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#6F4E37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-[#6F4E37]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#3d2b1a] mb-2">Admin Portal</h1>
          <p className="text-[#6F4E37]/70 text-xs sm:text-sm mb-6">Connect your wallet to verify ownership.</p>
          <button onClick={connectAndCheckOwner} disabled={loadingAuth} className="w-full bg-[#6F4E37] text-white py-3 rounded-xl font-bold hover:bg-[#5a3e2b] transition-all flex justify-center items-center gap-2 disabled:opacity-70 text-sm sm:text-base">
            {loadingAuth ? <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />}
            {loadingAuth ? "Verifying..." : "Connect Owner Wallet"}
          </button>
          <Link href="/marketplace" className="block mt-4 text-xs sm:text-sm text-[#6F4E37] hover:underline">← Back to Store</Link>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-6 sm:p-8 rounded-3xl shadow-lg border border-red-100 max-w-md w-full text-center">
          <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
          <p className="text-red-700/80 text-xs sm:text-sm mb-6">The connected wallet is not the owner of this smart contract.</p>
          <Link href="/marketplace" className="w-full inline-block bg-white border border-red-200 text-red-800 py-3 rounded-xl font-bold hover:bg-red-100 transition-all text-sm sm:text-base">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7] pb-20 font-['Inter']">
      <header className="bg-white border-b border-[#C4A484]/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#6F4E37] rounded-xl flex items-center justify-center">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[#3d2b1a] leading-tight text-base sm:text-lg">Admin Dashboard</h1>
              <p className="text-[9px] sm:text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Verified Owner</p>
            </div>
          </div>
          <Link href="/marketplace" className="text-xs sm:text-sm font-semibold text-[#6F4E37] hover:bg-[#6F4E37]/10 px-3 py-2 rounded-lg transition-colors">
            Exit Admin
          </Link>
        </div>
      </header>

      {message && (
        <div className={`fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold shadow-xl z-50 animate-in slide-in-from-top-4 w-11/12 max-w-md text-center ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {message.text}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* TOP ROW: Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <section className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-[#C4A484]/20">
            <h2 className="text-base sm:text-lg font-bold text-[#3d2b1a] flex items-center gap-2 mb-3 sm:mb-4">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#6F4E37]" /> Vault Controls
            </h2>
            <div className="p-3 sm:p-4 bg-[#FFF8E7] rounded-2xl mb-3 sm:mb-4 border border-[#C4A484]/30">
              <p className="text-[10px] sm:text-xs text-[#6F4E37]/70 font-semibold uppercase tracking-wider mb-1">Contract Balance</p>
              <p className="text-2xl sm:text-3xl font-mono font-bold text-[#3d2b1a] truncate">{parseFloat(contractEth).toFixed(4)} <span className="text-sm sm:text-base text-[#6F4E37]">ETH</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button onClick={() => handleWithdraw("ETH")} disabled={loadingAction !== null} className="w-full bg-[#6F4E37] hover:bg-[#5a3e2b] text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loadingAction === "withdraw_ETH" ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Withdraw ETH"}
              </button>
              <button onClick={() => handleWithdraw("USDC")} disabled={loadingAction !== null} className="w-full bg-white border border-[#6F4E37] text-[#6F4E37] hover:bg-[#6F4E37]/5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {loadingAction === "withdraw_USDC" ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Withdraw USDC"}
              </button>
            </div>
          </section>

          <section className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-[#C4A484]/20 flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#3d2b1a] flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" /> Transfer Ownership
              </h2>
              <p className="text-xs sm:text-sm text-[#6F4E37]/70 mb-3 sm:mb-4">Warning: This is irreversible. You will lose access.</p>
              <input type="text" placeholder="0x... New Address" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} className="w-full bg-[#FFF8E7] border border-[#C4A484]/30 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#6F4E37] mb-3 sm:mb-4 font-mono text-[#3d2b1a]" />
            </div>
            <button onClick={handleTransferOwnership} disabled={loadingAction !== null || !newOwner} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loadingAction === "transfer" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Transfer
            </button>
          </section>
        </div>

        {/* BOTTOM ROW: Editor & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Menu Editor */}
          <section className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-[#C4A484]/20">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#3d2b1a] flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-[#6F4E37]" /> Menu Editor
                </h2>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-3 mb-2 gap-2 hide-scrollbar">
              {filterTabs.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? "bg-[#6F4E37] text-white shadow" : "bg-[#FFF8E7] text-[#6F4E37] border border-[#C4A484]/30 hover:bg-[#C4A484]/20"}`}>
                  {cat} {cat === "All" ? `(${menuItems.length})` : ""}
                </button>
              ))}
            </div>

            {isFetchingMenu ? (
              <div className="flex items-center justify-center py-12 text-[#6F4E37]">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMenu.map((item) => (
                  <div key={item.id} className={`p-3 sm:p-4 rounded-2xl border transition-all ${item.isAvailable ? 'bg-[#FFF8E7] border-[#C4A484]/30 hover:border-[#C4A484]/60' : 'bg-gray-50 border-gray-200 opacity-75'} flex flex-col gap-2 sm:gap-3`}>
                    
                    {/* Top Row: Emoji, Name, Toggle, Delete */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative shrink-0">
                        <button onClick={() => setOpenEmojiId(openEmojiId === item.id ? null : item.id as string)} className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-[#C4A484]/40 rounded-xl text-xl sm:text-2xl flex items-center justify-center hover:bg-[#6F4E37]/5 transition-colors">
                          {item.emoji || <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#C4A484]" />}
                        </button>
                        {openEmojiId === item.id && (
                          <div className="absolute top-full mt-2 left-0 w-[260px] sm:w-64 p-2 bg-white rounded-xl shadow-xl border border-[#C4A484]/20 z-10 grid grid-cols-6 gap-1 max-w-[85vw]">
                            {EMOJI_PALETTE.map(e => (
                              <button key={e} onClick={() => { updateMenuItem(item.id, "emoji", e); setOpenEmojiId(null); }} className="text-lg sm:text-xl hover:bg-[#FFF8E7] p-1 rounded-lg">
                                {e}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <input type="text" value={item.name} onChange={(e) => updateMenuItem(item.id, "name", e.target.value)} className="flex-1 min-w-0 bg-white border border-[#C4A484]/30 rounded-xl p-2.5 sm:p-3 text-sm font-bold text-[#3d2b1a] focus:outline-none focus:border-[#6F4E37]" placeholder="Item Name" />
                      
                      {/* ADDED: Availability Toggle */}
                      <button 
                        onClick={() => updateMenuItem(item.id, "isAvailable", !item.isAvailable)} 
                        className={`p-2.5 sm:p-3 shrink-0 rounded-xl transition-colors border flex items-center justify-center ${item.isAvailable ? 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'}`}
                        title={item.isAvailable ? "Mark Sold Out" : "Mark Available"}
                      >
                        {item.isAvailable ? <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>

                      <button onClick={() => removeMenuItem(item.id)} className="p-2.5 sm:p-3 shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100">
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {/* Middle Row: Category & Description */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <select value={item.category} onChange={(e) => updateMenuItem(item.id, "category", e.target.value)} className="w-full sm:w-1/3 bg-white border border-[#C4A484]/30 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-semibold text-[#6F4E37] focus:outline-none focus:border-[#6F4E37] appearance-none">
                        {filterTabs.filter(t => t !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <input type="text" value={item.desc} onChange={(e) => updateMenuItem(item.id, "desc", e.target.value)} className="w-full sm:w-2/3 bg-white border border-[#C4A484]/30 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-[#6F4E37] focus:outline-none focus:border-[#6F4E37]" placeholder="Short description..." />
                    </div>

                    {/* Bottom Row: Pricing Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 bg-white border border-[#C4A484]/30 rounded-xl px-3 py-2">
                        <span className="text-[10px] sm:text-xs text-[#6F4E37]/50 font-bold shrink-0">USD</span>
                        <input type="number" value={item.priceUSDC} onChange={(e) => updateMenuItem(item.id, "priceUSDC", parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-sm font-bold text-[#3d2b1a] focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-[#C4A484]/30 rounded-xl px-3 py-2">
                        <span className="text-[10px] sm:text-xs text-[#6F4E37]/50 font-bold shrink-0">CPT Cost</span>
                        <input type="number" value={item.priceToken} onChange={(e) => updateMenuItem(item.id, "priceToken", parseInt(e.target.value) || 0)} className="w-full bg-transparent text-sm font-bold text-[#3d2b1a] focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                        <span className="text-[10px] sm:text-xs text-emerald-600 font-bold shrink-0">CPT Gift</span>
                        <input type="number" value={item.tokenGifted} onChange={(e) => updateMenuItem(item.id, "tokenGifted", parseInt(e.target.value) || 0)} className="w-full bg-transparent text-sm font-bold text-emerald-800 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button onClick={addMenuItem} className="w-full py-4 sm:py-6 border-2 border-dashed border-[#C4A484]/40 rounded-2xl text-[#6F4E37] font-bold text-sm hover:bg-[#6F4E37]/5 hover:border-[#6F4E37]/40 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add New {activeCategory !== "All" ? activeCategory : "Item"}
                </button>
              </div>
            )}
          </section>

          {/* RIGHT: Pending Changes Panel (Sticky) */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <section className="bg-white p-4 sm:p-6 rounded-3xl shadow-lg border border-[#C4A484]/30 sticky top-20 sm:top-24">
              <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#C4A484]/20">
                <ListChecks className="w-4 h-4 sm:w-5 sm:h-5 text-[#6F4E37]" />
                <h2 className="text-base sm:text-lg font-bold text-[#3d2b1a]">Pending Changes</h2>
              </div>

              {!hasChanges ? (
                <div className="text-center py-6 sm:py-8">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#C4A484]/40 mx-auto mb-2 sm:mb-3" />
                  <p className="text-[#6F4E37]/60 text-xs sm:text-sm">No changes detected.<br/>Start editing the menu to see them here.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 hide-scrollbar mb-4 sm:mb-6">
                  {pendingChanges.map((change) => (
                    <div key={change.id} className="text-xs sm:text-sm bg-[#FFF8E7] rounded-xl p-2.5 sm:p-3 border border-[#C4A484]/20">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="font-bold text-[#3d2b1a] truncate">{change.name}</span>
                        <div className="shrink-0">
                          {change.type === "ADD" && <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">NEW</span>}
                          {change.type === "REMOVE" && <span className="text-[9px] sm:text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">REMOVED</span>}
                          {change.type === "UPDATE" && <span className="text-[9px] sm:text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">EDITED</span>}
                        </div>
                      </div>
                      {change.type === "UPDATE" && change.details && (
                        <ul className="text-[10px] sm:text-xs text-[#6F4E37]/80 mt-1 sm:mt-2 space-y-1 pl-3 list-disc">
                          {change.details.map((desc, i) => <li key={i}>{desc}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 sm:space-y-3 pt-2">
                <button onClick={handleSaveMenu} disabled={!hasChanges || loadingAction !== null} className="w-full bg-[#6F4E37] hover:bg-[#5a3e2b] text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                  {loadingAction === "save_menu" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Updates
                </button>
                <button onClick={handleRevertMenu} disabled={!hasChanges || loadingAction !== null} className="w-full bg-white border border-[#C4A484]/40 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#6F4E37] py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Undo2 className="w-4 h-4" /> Discard
                </button>
              </div>
            </section>
          </div>
          
        </div>
      </main>
    </div>
  );
}