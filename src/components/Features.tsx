/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Award, ShieldAlert, Cpu, Heart, CheckCircle2, Sliders } from "lucide-react";

export default function Features() {
  const highlights = [
    {
      icon: <Cpu className="text-slate-900" size={22} />,
      title: "Peralatan Kelas Premium",
      desc: "Kami mempercayakan sesi Anda pada kamera high-end Sony/Fujifilm & lighting Profoto standar profesional internasional untuk ketajaman paripurna."
    },
    {
      icon: <Award className="text-slate-900" size={22} />,
      title: "Arsitektur Retouch Alami",
      desc: "Proses penyuntingan (retouch) manual profesional yang teliti. Kami menghindari filter murahan demi mempertahankan keaslian tekstur kulit Anda."
    },
    {
      icon: <Sliders className="text-slate-900" size={22} />,
      title: "Instan Drive Link",
      desc: "Semua data file asli (RAW) beresolusi tinggi langsung diunggah ke link Google Drive pribadi Anda sesaat setelah pemotretan berakhir."
    },
    {
      icon: <Heart className="text-slate-900" size={22} />,
      title: "Privat Studio Eksklusif",
      desc: "Studio privat ber-AC dingin yang nyaman, steril, kedap suara, dilengkapi kaca rias besar, ruang ganti baju tertutup, dan air mineral gratis."
    }
  ];

  return (
    <section id="keunggulan" className="relative py-24 bg-white text-slate-900 overflow-hidden border-t border-zinc-205">
      
      {/* Visual background gradient circle */}
      <div className="absolute top-[30%] left-[-10%] w-[350px] h-[350px] bg-slate-100/30 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Title */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-baseline mb-20">
          
          <div className="lg:col-span-5 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full mb-4 text-xs font-mono text-slate-600 tracking-wider font-semibold"
            >
              <CheckCircle2 size={13} className="text-slate-900" />
              KEUNGGULAN KAMI
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-light font-display tracking-tight text-slate-950"
            >
              Mengapa Memilih <span className="italic text-slate-505 font-normal">studiobook</span>?
            </motion.h2>
          </div>

          <div className="lg:col-span-7 text-left">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-500 font-sans text-sm md:text-base leading-relaxed max-w-xl"
            >
              Kami mengutamakan kualitas visual premium dan kemudahan pelayanan. Setiap jepretan dirancang secara individual agar keunikan personality Anda bersinar melampaui lembar cetak standar.
            </motion.p>
          </div>

        </div>

        {/* Features Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => (
            <motion.div
              id={`feature-card-${i}`}
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="p-6 rounded-none bg-zinc-50 w-full text-left border border-zinc-200 hover:border-slate-400 hover:bg-white hover:shadow-xs transition-all duration-300 flex flex-col justify-between"
            >
              <div className="mb-6">
                {/* Icon wrapper badge */}
                <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-6 shadow-sm">
                  {h.icon}
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-3 tracking-tight">
                  {h.title}
                </h3>
                
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  {h.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200 text-[10px] font-mono text-slate-400 tracking-wider font-bold">
                CERTIFIED SERVICE
              </div>
            </motion.div>
          ))}
        </div>

      </div>

    </section>
  );
}
