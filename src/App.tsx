/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Portfolio from "./components/Portfolio";
import Packages from "./components/Packages";
import Features from "./components/Features";
import Footer from "./components/Footer";
import BookingFlow from "./components/BookingFlow";
import AdminPanel from "./components/AdminPanel";
import { Sparkles, Calendar, ArrowRight, Instagram, Camera, Lock, User, AlertCircle } from "lucide-react";

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  // Administrative mode and authentication routing states
  const [isAdminMode, setIsAdminMode] = useState(() => {
    return window.location.pathname === "/admin" || 
           window.location.search.includes("admin=true") || 
           window.location.hash === "#admin";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  // Track popstate/hash to support seamless live previews or deep links
  useEffect(() => {
    const handleUrlChange = () => {
      const isParamAdmin = window.location.pathname === "/admin" || 
                           window.location.search.includes("admin=true") || 
                           window.location.hash === "#admin";
      setIsAdminMode(isParamAdmin);
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  const startBookingWithPackage = (packageId: string) => {
    setSelectedPackageId(packageId);
    setIsBookingOpen(true);
  };

  const startGeneralBooking = () => {
    setSelectedPackageId(null);
    setIsBookingOpen(true);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === "admin" && loginPass === "admin") {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Nama pengguna atau kata sandi tidak valid. Gunakan 'admin' & 'admin'.");
    }
  };

  const handleAdminLogout = () => {
    // Exit admin mode and reset url hash
    setIsLoggedIn(false);
    setLoginUser("");
    setLoginPass("");
    setIsAdminMode(false);
    window.location.hash = "";
  };

  // RENDER SWITCH: 
  if (isAdminMode) {
    if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 text-zinc-900 selection:bg-zinc-950 selection:text-white">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-zinc-200" />
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-white p-8 border border-zinc-200 rounded-none shadow-xl relative"
          >
            {/* Design header branding */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-10 h-10 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold mb-3 shadow-md">
                S
              </div>
              <h2 className="text-lg font-bold font-title tracking-tight text-center text-zinc-900 uppercase">
                Portal Admin StudioBook
              </h2>
              <p className="text-[10px] uppercase font-mono tracking-widest text-[#10B981] font-bold mt-1.5">
                MEMERLUKAN VERIFIKASI SEKURITI
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-500 rounded-none text-xs flex gap-2 items-start font-sans">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">
                  Nama Pengguna
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-450 pointer-events-none">
                    <User size={13} />
                  </span>
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#fafafa] border border-zinc-250 rounded-none text-xs font-mono focus:bg-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-450 pointer-events-none">
                    <Lock size={13} />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="......"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#fafafa] border border-zinc-250 rounded-none text-xs font-mono focus:bg-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 border text-white font-mono text-xs font-bold uppercase tracking-widest rounded-none shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Masuk Portal
                </button>
              </div>
            </form>

            <div className="mt-8 pt-4 border-t border-dashed text-center">
              <button 
                onClick={handleAdminLogout}
                className="text-xs text-zinc-500 hover:text-zinc-900 underline font-mono font-bold"
              >
                ← Kembali ke Website Pengunjung
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <AdminPanel onLogout={handleAdminLogout} />
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      
      {/* Decorative top border line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-zinc-200 z-30" />

      {/* Header component */}
      <Header onStartBooking={startGeneralBooking} />

      {/* Hero component */}
      <Hero onStartBooking={startGeneralBooking} />

      {/* Portfolio Gallery Section */}
      <Portfolio />

      {/* Features highlight Section */}
      <Features />

      {/* Photography Packages pricing Section */}
      <Packages onSelectPackage={startBookingWithPackage} />

      {/* Elegant CTA visual banner before footer */}
      <section className="relative py-24 bg-zinc-50 text-slate-900 overflow-hidden border-t border-zinc-200">
        <div className="absolute inset-0 bg-radial from-slate-900/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-14 bg-white border border-zinc-200 rounded-none shadow-sm backdrop-blur-md"
          >
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-slate-100 text-slate-900 rounded-full border border-zinc-200">
                <Calendar size={24} />
              </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-light font-display tracking-tight mb-4 text-slate-900">
              Siap Mengukir <span className="italic text-slate-500">Portret Ikonik</span> Anda?
            </h2>

            <p className="text-slate-500 text-xs md:text-sm font-sans mb-8 max-w-lg mx-auto leading-relaxed">
              Pilih tanggal, sesuaikan kebutuhan aksesori, dan amankan slot sesi Anda sebelum kehabisan. Tim profesional studiobook siap melayani Anda sepenuh hati.
            </p>

            <button
              id="cta-section-book-btn"
              onClick={startGeneralBooking}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold rounded-none uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Booking Jadwal Sekarang</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Beautiful Studio Footer */}
      <Footer onStartBooking={startGeneralBooking} />

      {/* Dynamic Multi-Step Wizard Booking Flow */}
      <AnimatePresence>
        {isBookingOpen && (
          <BookingFlow 
            initialPackageId={selectedPackageId}
            onClose={() => setIsBookingOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
