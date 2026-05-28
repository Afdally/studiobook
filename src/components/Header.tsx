/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Camera, Calendar, Menu, X, ArrowUpRight } from "lucide-react";

interface HeaderProps {
  onStartBooking: () => void;
}

export default function Header({ onStartBooking }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-350 border-b ${
      isScrolled 
        ? "bg-white/90 backdrop-blur-md py-4 border-zinc-200 shadow-sm text-slate-900" 
        : "bg-transparent py-6 border-transparent text-slate-800"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <a 
          href="#" 
          onClick={(e) => handleNavLinkClick(e, "root")}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Camera size={14} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase text-slate-950">
            studio<span className="font-extrabold text-slate-900">book</span>
          </span>
        </a>

        {/* DESKTOP NAV BAR */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
          <a 
            href="#galeri" 
            onClick={(e) => handleNavLinkClick(e, "galeri")}
            className="hover:text-slate-900 transition-colors"
          >
            Galeri
          </a>
          <a 
            href="#paket" 
            onClick={(e) => handleNavLinkClick(e, "paket")}
            className="hover:text-slate-900 transition-colors"
          >
            Paket
          </a>
          <a 
            href="#keunggulan" 
            onClick={(e) => handleNavLinkClick(e, "keunggulan")}
            className="hover:text-slate-900 transition-colors"
          >
            Keunggulan
          </a>
          <a 
            href="#tentang" 
            onClick={(e) => handleNavLinkClick(e, "tentang")}
            className="hover:text-slate-900 transition-colors"
          >
            Kontak
          </a>
        </nav>

        {/* HEADER CTA BUTTON */}
        <div className="hidden md:flex items-center gap-4">
          <button
            id="header-booking-btn"
            onClick={onStartBooking}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-[10px] font-bold tracking-widest uppercase transition-all hover:shadow-md active:scale-95 cursor-pointer rounded-none"
          >
            <Calendar size={13} />
            <span>PESAN SESI</span>
            <ArrowUpRight size={12} strokeWidth={2.5} />
          </button>
        </div>

        {/* MOBILE TRIGGER */}
        <div className="flex items-center md:hidden gap-3">
          <button
            id="mobile-quick-book-btn"
            onClick={onStartBooking}
            className="p-2.5 bg-slate-900 text-white rounded-none hover:bg-slate-800 transition-colors"
          >
            <Calendar size={15} />
          </button>
          
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 bg-white border border-zinc-200 rounded-none text-slate-600 hover:text-slate-950 transition-colors"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-zinc-250 backdrop-blur-lg flex flex-col p-6 space-y-4 md:hidden shadow-lg">
          <a 
            href="#galeri" 
            onClick={(e) => handleNavLinkClick(e, "galeri")}
            className="text-xs font-bold tracking-widest text-slate-500 py-2 border-b border-zinc-100"
          >
            GALERI
          </a>
          <a 
            href="#paket" 
            onClick={(e) => handleNavLinkClick(e, "paket")}
            className="text-xs font-bold tracking-widest text-slate-500 py-2 border-b border-zinc-100"
          >
            PAKET
          </a>
          <a 
            href="#keunggulan" 
            onClick={(e) => handleNavLinkClick(e, "keunggulan")}
            className="text-xs font-bold tracking-widest text-slate-500 py-2 border-b border-zinc-100"
          >
            KEUNGGULAN
          </a>
          <a 
            href="#tentang" 
            onClick={(e) => handleNavLinkClick(e, "tentang")}
            className="text-xs font-bold tracking-widest text-slate-500 py-2"
          >
            KONTAK
          </a>
        </div>
      )}

    </header>
  );
}
