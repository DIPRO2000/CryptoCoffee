"use client"; // Required for the stateful mobile menu toggle

import { useState } from "react";
import Link from "next/link";
// Added 'Lock' to the lucide-react imports!
import { Coffee, ArrowRight, ShieldCheck, Zap, Gem, Code2, Menu, X, Lock } from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col font-sans selection:bg-[#6F4E37] selection:text-white overflow-x-hidden">
      
      {/* Glassmorphism Header */}
      <header className="border-b border-[#C4A484]/20 bg-[#FFF8E7]/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6F4E37] to-[#3d2b1a] rounded-xl flex items-center justify-center shadow-lg shadow-[#6F4E37]/20 flex-shrink-0">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-[#3d2b1a] text-lg sm:text-xl tracking-tight leading-none block">Café Web3</span>
              <span className="text-[#6F4E37]/60 text-xs font-medium uppercase tracking-wider">Sepolia Testnet</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6F4E37]">
            <a href="#features" className="hover:text-[#3d2b1a] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#3d2b1a] transition-colors">How it Works</a>
            <a href="https://sepolia.etherscan.io/" target="_blank" rel="noreferrer" className="hover:text-[#3d2b1a] transition-colors">Contract</a>
            
            {/* Added: Desktop Admin Link */}
            <Link href="/admin" className="hover:text-[#3d2b1a] transition-colors flex items-center gap-1.5 opacity-70 hover:opacity-100">
              <Lock className="w-3.5 h-3.5" /> Admin
            </Link>
          </nav>

          {/* Desktop Launch Button */}
          <div className="hidden md:block">
            <Link 
              href="/marketplace"
              className="bg-[#3d2b1a] hover:bg-[#2a1d12] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              Launch App
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#6F4E37] hover:bg-[#C4A484]/10 rounded-xl transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-[#C4A484]/20 p-6 shadow-xl flex flex-col gap-5 animate-fade-in z-50">
            <nav className="flex flex-col gap-4 text-base font-semibold text-[#6F4E37]">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#3d2b1a] py-2 border-b border-zinc-100 transition-colors"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#3d2b1a] py-2 border-b border-zinc-100 transition-colors"
              >
                How it Works
              </a>
              <a 
                href="https://sepolia.etherscan.io/" 
                target="_blank" 
                rel="noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#3d2b1a] py-2 border-b border-zinc-100 transition-colors"
              >
                Contract Link
              </a>
              
              {/* Added: Mobile Admin Link */}
              <Link 
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#3d2b1a] py-2 transition-colors flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Admin Portal
              </Link>
            </nav>
            <Link 
              href="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-[#3d2b1a] hover:bg-[#2a1d12] text-white text-center font-bold py-3.5 rounded-xl transition-all shadow-md w-full block mt-2"
            >
              Launch Marketplace App
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Sections */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-32 overflow-hidden flex flex-col items-center text-center">
          {/* Background decorative blobs */}
          <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#C4A484]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none"></div>
          <div className="absolute top-1/3 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-[#6F4E37]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white border border-[#C4A484]/30 text-[#6F4E37] text-[11px] sm:text-xs font-bold rounded-full px-3 py-1.5 mb-6 sm:mb-8 shadow-sm max-w-full text-left sm:text-center">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
              Smart Contracts Live on Sepolia
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#3d2b1a] leading-[1.15] sm:leading-[1.1] mb-6 tracking-tight">
              Decentralized <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F4E37] to-[#C4A484]">
                Caffeine.
              </span>
            </h1>
            
            <p className="text-[#6F4E37]/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
              Skip the fiat. Pay for your morning brew directly with ETH or USDC. Earn on-chain CafeTokens with every purchase and redeem them for real-world rewards.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 px-4 sm:px-0 max-w-sm sm:max-w-none mx-auto">
              <Link 
                href="/marketplace"
                className="group flex items-center justify-center gap-2 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-full px-8 py-3.5 sm:py-4 font-bold text-base sm:text-lg transition-all shadow-xl shadow-[#6F4E37]/20 hover:-translate-y-0.5"
              >
                Enter Marketplace
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#how-it-works"
                className="flex items-center justify-center gap-2 bg-white text-[#6F4E37] border border-[#C4A484]/30 rounded-full px-8 py-3.5 sm:py-4 font-bold text-base sm:text-lg transition-all hover:bg-[#FFF8E7] hover:border-[#6F4E37]/30"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Value Proposition Grid */}
        <section id="features" className="bg-white py-16 sm:py-24 border-y border-[#C4A484]/20 scroll-mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#3d2b1a] mb-4">Why Web3 Coffee?</h2>
              <p className="text-[#6F4E37]/70 text-sm sm:text-base max-w-2xl mx-auto px-2">Traditional loyalty programs are siloed and controlled by corporations. Our on-chain tokenomics put the ownership back in your wallet.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { icon: <ShieldCheck className="w-7 sm:w-8 h-7 sm:h-8 text-[#6F4E37]" />, title: "Immutable Records", desc: "Every transaction and loyalty point earned is securely recorded on the Ethereum blockchain." },
                { icon: <Zap className="w-7 sm:w-8 h-7 sm:h-8 text-[#6F4E37]" />, title: "Instant Settlement", desc: "Lightning-fast payments using USDC or native Sepolia ETH. No credit card fees, no intermediaries." },
                { icon: <Gem className="w-7 sm:w-8 h-7 sm:h-8 text-[#6F4E37]" />, title: "True Ownership", desc: "Your CafeTokens are real ERC-20 tokens. Hold them, trade them, or redeem them for a free espresso." }
              ].map((feature, i) => (
                <div key={i} className="p-6 sm:p-8 rounded-3xl bg-[#FFF8E7]/50 border border-[#C4A484]/20 hover:bg-[#FFF8E7] transition-all duration-300">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-5 sm:mb-6 border border-[#C4A484]/10">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#3d2b1a] mb-2.5 sm:mb-3">{feature.title}</h3>
                  <p className="text-[#6F4E37]/70 text-sm sm:text-base leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-16">
          <div className="bg-[#3d2b1a] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-12 sm:mb-16">Three Steps to Web3 Brew</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6 relative">
                {/* Horizontal Connecting Line for Desktops */}
                <div className="hidden sm:block absolute top-[32px] left-[15%] right-[15%] h-0.5 bg-[#6F4E37] -z-10"></div>

                {[
                  { step: "01", title: "Connect Wallet", desc: "Link your MetaMask securely on the Sepolia testnet." },
                  { step: "02", title: "Order & Pay", desc: "Select your drinks and pay using smart contracts." },
                  { step: "03", title: "Earn Tokens", desc: "Watch ERC-20 loyalty tokens drop directly into your wallet." }
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center relative group">
                    <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#6F4E37] text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold border-4 border-[#3d2b1a] mb-4 sm:mb-6 shadow-xl relative z-10">
                      {s.step}
                    </div>
                    <h3 className="font-bold text-white text-lg sm:text-xl mb-2 sm:mb-3">{s.title}</h3>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-xs">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Responsive Footer */}
      <footer className="bg-white border-t border-[#C4A484]/20 py-10 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <div className="flex items-center gap-2 opacity-80">
            <Coffee className="w-5 h-5 text-[#6F4E37]" />
            <span className="font-bold text-[#3d2b1a]">Café Web3</span>
          </div>
          
          <div className="text-[#6F4E37]/60 text-xs sm:text-sm flex items-center justify-center gap-1.5 order-last sm:order-none">
            Built with <Code2 className="w-4 h-4 text-[#6F4E37]" /> Next.js & Solidity
          </div>

          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white transition-all duration-200">
              <FaGithub className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center text-[#6F4E37] hover:bg-[#6F4E37] hover:text-white transition-all duration-200">
              <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}