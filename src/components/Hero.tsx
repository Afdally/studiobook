/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import Camera3D from "./Camera3D";
import { Sparkles, ArrowRight, ArrowDown, Award, Clock, Users } from "lucide-react";

interface HeroProps {
  onStartBooking: () => void;
}

export default function Hero({ onStartBooking }: HeroProps) {
  
  // Smooth scroll helper to packages
  const scrollToPackages = () => {
    const section = document.getElementById("paket");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center bg-zinc-50 text-slate-900 overflow-hidden pt-28 pb-16">
      
      {/* Absolute floating premium background decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[600px] h-[600px] bg-zinc-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left: Text Content & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Top subtitle chip */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-zinc-200 rounded-full mb-6 text-xs font-mono text-slate-600 tracking-wider font-semibold"
            >
              <Sparkles size={13} className="text-slate-900 animate-spin" style={{ animationDuration: "12s" }} />
              STUDIO FOTO MINIMALIS & PREMIUM
            </motion.div>

            {/* Stunning Playfair Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-light font-display tracking-tight text-slate-950 mb-6 leading-[1.1]"
            >
              Abadikan Setiap Detik <br />
              <span className="italic font-normal text-slate-500 serif">Cerita Bermakna</span> Anda
            </motion.h1>

            {/* Paragraph body */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="max-w-xl text-slate-500 text-sm md:text-base leading-relaxed mb-8 font-sans"
            >
              Selamat datang di studiobook. Kami menyisipkan seni, presisi warna, kecanggihan lensa, dan kemudahan booking digital 4 langkah untuk pengalaman photoshoot studio paling bergaya di Indonesia.
            </motion.p>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 w-full"
            >
              <button
                id="hero-book-now-btn"
                onClick={onStartBooking}
                className="w-full sm:w-auto justify-center group relative flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-mono text-xs font-bold rounded-none uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md hover:bg-slate-800 active:scale-95 cursor-pointer"
              >
                <span>Reservasi Sekarang</span>
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>

              <button
                id="hero-explore-packages-btn"
                onClick={scrollToPackages}
                className="w-full sm:w-auto justify-center flex items-center gap-2 px-7 py-4 bg-white hover:bg-zinc-150 text-slate-905 font-mono text-xs font-bold rounded-none border border-zinc-200 hover:border-slate-300 transition-all duration-300 active:scale-95 cursor-pointer uppercase tracking-widest"
              >
                <span>Lihat Paket Foto</span>
                <ArrowDown size={14} className="animate-bounce" />
              </button>
            </motion.div>

            {/* Dynamic visual statistics counters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-12 pt-8 border-t border-zinc-200 w-full max-w-lg"
            >
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Award size={14} className="text-slate-600" />
                  <span className="font-mono text-[9px] tracking-wider font-bold">REPUTASI</span>
                </div>
                <div className="text-lg font-light font-title text-slate-800">4.9 ★ Rating</div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">Ulasan Google Maps</div>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Clock size={14} className="text-slate-600" />
                  <span className="font-mono text-[9px] tracking-wider font-bold">PENGERJAAN</span>
                </div>
                <div className="text-lg font-light font-title text-slate-800">1 Hari Edit</div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">Layanan ekspres kilat</div>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Users size={14} className="text-slate-600" />
                  <span className="font-mono text-[9px] tracking-wider font-bold">PORTOFOLIO</span>
                </div>
                <div className="text-lg font-light font-title text-slate-800">5,000+ Sesi</div>
                <div className="text-[10px] text-slate-400 font-sans mt-0.5">Klien terpuaskan</div>
              </div>
            </motion.div>

          </div>

          {/* Hero Right: Interactive 3D Camera Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 100, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center items-center w-full relative"
          >
            {/* Ambient lighting shadow behind camera */}
            <div className="absolute inset-0 bg-radial from-slate-300/10 via-transparent to-transparent blur-[80px] pointer-events-none rounded-full" />
            <div className="relative w-full rounded-none bg-white border border-zinc-200 p-4 md:p-6 shadow-md hover:shadow-lg transition-all backdrop-blur-sm overflow-hidden select-none">
              <Camera3D />
            </div>
          </motion.div>

        </div>
      </div>

    </section>
  );
}
