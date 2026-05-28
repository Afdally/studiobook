/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { db } from "../utils/db";
import { PhotoPackage } from "../types";
import { Check, Clock, Sparkles } from "lucide-react";

interface PackagesProps {
  onSelectPackage: (packageId: string) => void;
}

export default function Packages({ onSelectPackage }: PackagesProps) {
  const [packagesList, setPackagesList] = useState<PhotoPackage[]>(() => db.getPackages());
  
  useEffect(() => {
    const handleDbChange = () => {
      setPackagesList(db.getPackages());
    };
    window.addEventListener("sb_db_changed", handleDbChange);
    return () => {
      window.removeEventListener("sb_db_changed", handleDbChange);
    };
  }, []);
  
  // Indonesian currency formatter
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <section id="paket" className="relative py-24 bg-zinc-50 text-slate-900 overflow-hidden border-t border-zinc-200">
      {/* Decorative colored glow circles */}
      <div className="absolute top-[10%] right-[10%] w-[450px] h-[450px] bg-slate-300/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[450px] h-[450px] bg-slate-400/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-zinc-200 rounded-full mb-4 text-xs font-mono text-slate-600 tracking-wider font-bold"
          >
            <Sparkles size={13} className="text-slate-900" />
            PAKET INSTAN & EDITORIAL
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-light font-display tracking-tight text-slate-950 mb-6">
            Pilih Paket <span className="italic text-slate-550 font-display">Fotografi Premium</span> Anda
          </h2>
          
          <p className="max-w-2xl mx-auto text-slate-500 text-sm md:text-base font-sans line-relaxed">
            Semua paket telah mencakup file resolusi tinggi, pengerjaan retouch premium oleh editor profesional, dan aksesori studio lengkap tanpa biaya tersembunyi.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {packagesList.filter(pkg => pkg.active !== false).map((pkg, index) => {
            const isPopular = pkg.popular;
            
            return (
              <motion.div
                id={`package-card-${pkg.id}`}
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative flex flex-col justify-between rounded-none p-6 transition-all duration-300 ${
                  isPopular 
                    ? "bg-white border-2 border-slate-900 shadow-xl" 
                    : "bg-white border border-zinc-200 hover:border-slate-450 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900 text-white text-[10px] font-mono tracking-widest px-4 py-1 rounded-none font-bold shadow-md">
                    <Sparkles size={11} className="fill-white text-white" />
                    PALING POPULER
                  </div>
                )}

                <div>
                  {/* Category / Duration */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] tracking-widest font-mono text-slate-400 uppercase font-bold">
                      STUDIO PACKAGE
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                      <Clock size={12} className="text-slate-600" />
                      {pkg.duration}
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-xl font-bold font-title tracking-tight mb-2 text-slate-900">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 font-sans line-clamp-3">
                    {pkg.desc}
                  </p>

                  {/* Pricing */}
                  <div className="mb-6 pb-6 border-b border-zinc-200">
                    <span className="text-3xl font-light font-title text-slate-950 tracking-tight">
                      {formatRupiah(pkg.price)}
                    </span>
                    <span className="text-slate-400 text-xs ml-1">/ Sesi</span>
                  </div>

                  {/* Inclusions */}
                  <div className="space-y-3 mb-8">
                    <h4 className="text-[10px] tracking-wider uppercase font-mono text-slate-400 font-bold">
                      SUDAH TERMASUK:
                    </h4>
                    <ul className="space-y-2.5">
                      {pkg.inclusions.map((inc, indexIdx) => (
                        <li key={indexIdx} className="flex items-start gap-2.5 text-xs text-slate-605 leading-normal">
                          <Check size={14} className="text-slate-900 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Booking Button trigger */}
                <button
                  id={`book-btn-${pkg.id}`}
                  onClick={() => onSelectPackage(pkg.id)}
                  className={`w-full py-3.5 rounded-none text-xs font-mono font-bold uppercase tracking-widest transition-all duration-300 ${
                    isPopular
                      ? "bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg"
                      : "bg-transparent border border-zinc-200 text-slate-800 hover:bg-slate-50 hover:border-slate-900"
                  }`}
                >
                  Pesan Paket Sekarang
                </button>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
