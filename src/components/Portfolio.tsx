/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PORTFOLIO_ITEMS, PortfolioItem } from "../data";
import { Maximize2, X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Get categories list
  const categories = ["Semua", "Portrait", "Couple / Group", "Wisuda", "Product / Brand"];

  // Filter items
  const filteredItems = selectedCategory === "Semua"
    ? PORTFOLIO_ITEMS
    : PORTFOLIO_ITEMS.filter((item) => item.category === selectedCategory);

  // Lightbox Navigation
  const openLightbox = (itemIndex: number) => {
    // We map index in filtered list to index in filtered list
    setLightboxIndex(itemIndex);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  const prevPhoto = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  return (
    <section id="galeri" className="relative py-24 bg-zinc-50 text-slate-905 overflow-hidden border-t border-zinc-200">
      {/* Dynamic background element */}
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-slate-300/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-zinc-200 rounded-full mb-4 text-xs font-mono text-slate-600 tracking-wider font-semibold"
          >
            <Camera size={14} className="text-slate-800" />
            GALERI STUDIO
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-light font-display tracking-tight text-slate-950 mb-6"
          >
            Abadikan Momen Terindah <span className="italic text-slate-500">Penuh Makna</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-500 font-sans text-sm md:text-base leading-relaxed"
          >
            Lihat hasil karya potret dari fotografer profesional studiobook. Kami mendedikasikan pencahayaan prima, komposisi premium, serta pengerjaan editing detail tinggi.
          </motion.p>
        </div>

        {/* Category Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center items-center gap-2 mb-12 border-b border-zinc-200 pb-8"
        >
          {categories.map((cat) => (
            <button
              id={`cat-btn-${cat.toLowerCase().replace(/[^a-z0-9]/g, "")}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-none text-xs font-mono transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white font-bold shadow-sm"
                  : "bg-white text-slate-500 border border-zinc-200 hover:text-slate-900 hover:bg-zinc-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Masonry or Elegant Grid Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                layout
                id={`portfolio-card-${item.id}`}
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -6 }}
                className="group relative h-[380px] rounded-none overflow-hidden bg-white border border-zinc-200 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => openLightbox(index)}
              >
                {/* Image */}
                <div className="w-full h-full overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-100 transition-all duration-750 ease-out"
                  />
                </div>

                {/* Ambient Overlay Shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

                {/* Details Container */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-[10px] tracking-widest font-mono text-slate-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-sm self-start mb-2 uppercase font-bold">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-light tracking-tight text-white mb-2 font-display">
                    {item.title}
                  </h3>
                  
                  {/* Expand view trigger icons */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-350 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-fade-in">
                    <Maximize2 size={13} className="text-white" />
                    <span>Lihat Fullsize</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-md"
          >
            {/* Background click to close */}
            <div className="absolute inset-0 cursor-zoom-out" onClick={closeLightbox} />

            {/* Lightbox controls upper bar */}
            <div className="absolute top-4 left-4 z-10 text-xs font-mono text-zinc-400 flex items-center gap-3 bg-zinc-950/80 px-4 py-2 rounded-full border border-zinc-900 pointer-events-none">
              <span>{filteredItems[lightboxIndex].category}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <span>{lightboxIndex + 1} / {filteredItems.length}</span>
            </div>

            <button
              id="close-lightbox-btn"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full transition-colors border border-zinc-800 shadow-xl"
            >
              <X size={18} />
            </button>

            {/* Navigation Chevron Buttons */}
            <button
              id="prev-lightbox-btn"
              onClick={prevPhoto}
              className="absolute left-4 p-3.5 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full transition-colors border border-zinc-800 shadow-xl z-10"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              id="next-lightbox-btn"
              onClick={nextPhoto}
              className="absolute right-4 p-3.5 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full transition-colors border border-zinc-800 shadow-xl z-10"
            >
              <ChevronRight size={20} />
            </button>

            {/* Center Content Image Frame */}
            <div className="relative max-w-4xl max-h-[80vh] z-0 flex flex-col items-center">
              <motion.img
                key={lightboxIndex}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                src={filteredItems[lightboxIndex].imageUrl}
                alt={filteredItems[lightboxIndex].title}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-zinc-900"
              />
              <motion.h4
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center text-sm md:text-base font-light text-zinc-300"
              >
                {filteredItems[lightboxIndex].title}
              </motion.h4>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
