/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Camera, Calendar, Instagram, Facebook, Mail, Phone, MapPin, ArrowUp } from "lucide-react";
import { db } from "../utils/db";

interface FooterProps {
  onStartBooking: () => void;
}

export default function Footer({ onStartBooking }: FooterProps) {
  const [settings, setSettings] = useState(() => db.getSettings());

  useEffect(() => {
    const handleDbChange = () => {
      setSettings(db.getSettings());
    };
    window.addEventListener("sb_db_changed", handleDbChange);
    return () => {
      window.removeEventListener("sb_db_changed", handleDbChange);
    };
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="tentang" className="relative bg-slate-900 text-slate-400 border-t border-slate-800 pt-24 pb-12 overflow-hidden">
      
      {/* Decorative blurred dot */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-slate-700/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Col 1: Studio Description */}
          <div className="md:col-span-4 flex flex-col items-start text-left">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0">
                <Camera size={14} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tighter uppercase text-white">
                studio<span className="font-extrabold text-slate-200">book</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs md:text-sm font-sans leading-relaxed mb-6">
              Studio foto komersial dan portrait premium berbasis di Jakarta Barat. Menghasilkan karya sinematik kelas atas dengan standar lighting internasional dan tim kreatif berpengalaman.
            </p>

            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 bg-slate-800 border border-slate-700 rounded-none hover:text-white hover:border-slate-500 transition-all text-slate-400"
              >
                <Instagram size={15} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 bg-slate-800 border border-slate-700 rounded-none hover:text-white hover:border-slate-500 transition-all text-slate-400"
              >
                <Facebook size={15} />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-2 flex flex-col items-start text-left">
            <h4 className="text-[10px] tracking-widest font-mono text-slate-500 uppercase mb-6 font-bold">
              NAVIGASI
            </h4>
            <ul className="space-y-3.5 text-xs text-slate-400 font-mono">
              <li>
                <a href="#galeri" className="hover:text-white transition-colors">GALLERY</a>
              </li>
              <li>
                <a href="#paket" className="hover:text-white transition-colors">PRICING</a>
              </li>
              <li>
                <a href="#keunggulan" className="hover:text-white transition-colors">WHY US</a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); onStartBooking(); }} className="text-slate-200 hover:text-white font-bold transition-colors">RESERVASI</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Operational Hours */}
          <div className="md:col-span-2 flex flex-col items-start text-left">
            <h4 className="text-[10px] tracking-widest font-mono text-slate-500 uppercase mb-6 font-bold">
              JAM BUKA
            </h4>
            <ul className="space-y-3 text-xs text-slate-400 font-mono">
              <li>
                <span className="block text-slate-500">SENIN - JUMAT:</span>
                <span>09:00 - 21:00 WIB</span>
              </li>
              <li>
                <span className="block text-slate-500">SABTU - MINGGU:</span>
                <span>08:00 - 22:00 WIB</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Studio Location / Contact */}
          <div className="md:col-span-4 flex flex-col items-start text-left">
            <h4 className="text-[10px] tracking-widest font-mono text-slate-500 uppercase mb-6 font-bold">
              KANTOR STUDIO
            </h4>
            
            <div className="space-y-4 text-xs font-sans text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-white shrink-0 mt-0.5" />
                <span className="leading-relaxed">{settings.address}</span>
              </div>

              <div className="flex items-center gap-2.5 font-mono">
                <Phone size={15} className="text-white shrink-0" />
                <span>{settings.whatsapp}</span>
              </div>

              <div className="flex items-center gap-2.5 font-mono">
                <Mail size={15} className="text-white shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Lower copyright bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
          <div className="font-mono">
            &copy; {new Date().getFullYear()} {settings.studioName.toLowerCase()}.co.id. Semua Hak Dilindungi.
          </div>
          
          <div className="flex items-center gap-3">
            <button
              id="footer-back-to-top"
              onClick={scrollToTop}
              className="group flex items-center gap-1.5 px-4 py-2 bg-slate-800 border border-slate-750 hover:border-slate-600 text-slate-200 font-mono text-[10px] rounded-none transition-all cursor-pointer"
            >
              <span>KEMBALI KE ATAS</span>
              <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </footer>
  );
}
