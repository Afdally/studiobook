/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhotoPackage, AddonOption } from "../types";
import { db } from "../utils/db";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  Check,
  ShoppingBag,
  Send,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface BookingFlowProps {
  initialPackageId: string | null;
  onClose: () => void;
}

export default function BookingFlow({ initialPackageId, onClose }: BookingFlowProps) {
  const PACKAGES = db.getPackages();
  const ADDONS = db.getAddons();

  // State variables for Wizard
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPackageId || (PACKAGES.length > 0 ? PACKAGES[0].id : "portrait-solo"));
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  
  // User Form Details
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });
  
  // Custom interactive Calendar date control
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2026, 4)); // Starts May 2026 (based on current metadata year 2026)

  // Dynamic time slot generator
  const availableSlotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const d = new Date(selectedDate);
    const dayName = days[d.getDay()];
    
    const slotSettings = db.getSlotsSettings();
    const daySchedule = slotSettings.operational[dayName];
    
    // Default static fallback list of slots
    const defaultTimeSlots = [
      "09:00 - 10:00",
      "10:15 - 11:15",
      "11:30 - 12:30",
      "13:30 - 14:30",
      "14:45 - 15:45",
      "16:00 - 17:00",
      "18:30 - 19:30",
      "19:45 - 20:45"
    ];

    if (!daySchedule || !daySchedule.active) return [];
    
    const slots: string[] = [];
    const [startH, startM] = daySchedule.start.split(":").map(Number);
    const [endH, endM] = daySchedule.end.split(":").map(Number);
    
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const slotDuration = daySchedule.duration;
    
    while (currentMinutes + slotDuration <= endMinutes) {
      const startHourStr = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
      const startMinStr = String(currentMinutes % 60).padStart(2, "0");
      const endMinutesCalculated = currentMinutes + slotDuration;
      const endHourStr = String(Math.floor(endMinutesCalculated / 60)).padStart(2, "0");
      const endMinStr = String(endMinutesCalculated % 60).padStart(2, "0");
      
      const slotString = `${startHourStr}:${startMinStr} - ${endHourStr}:${endMinStr}`;
      
      // Filter out if blocked
      const isDateBlocked = slotSettings.blockedDates && slotSettings.blockedDates.includes(selectedDate);
      const isSlotBlocked = slotSettings.blockedSlots && slotSettings.blockedSlots[selectedDate] && slotSettings.blockedSlots[selectedDate].includes(slotString);
      
      if (!isDateBlocked && !isSlotBlocked) {
        slots.push(slotString);
      }
      currentMinutes = endMinutesCalculated + 5; // 5 mins break
    }
    
    return slots.length > 0 ? slots : defaultTimeSlots;
  }, [selectedDate]);

  // Package lookup
  const activePackage = useMemo(() => {
    return PACKAGES.find(p => p.id === selectedPackageId) || PACKAGES[0] || { id: "portrait-solo", name: "Solo Session", price: 125000, duration: "30 Menit", desc: "", inclusions: [] };
  }, [selectedPackageId, PACKAGES]);

  // Formatters
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Convert English Date elements to Indonesian locale helper
  const formatIndonesianDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Pricing calculations
  const invoiceCalculations = useMemo(() => {
    const pkgPrice = activePackage.price;
    const addonsTotal = selectedAddons.reduce((sum, addonId) => {
      const addon = ADDONS.find(a => a.id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0);
    const grandTotal = pkgPrice + addonsTotal;
    
    return {
      pkgPrice,
      addonsTotal,
      grandTotal
    };
  }, [activePackage, selectedAddons]);

  // Validation rules
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!selectedPackageId;
      case 2:
        return !!selectedDate && !!selectedTimeSlot;
      case 3:
        return (
          formData.fullName.trim().length >= 3 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
          formData.phone.trim().length >= 9
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Wizard navigation logic
  const handleNextStep = () => {
    if (isStepValid(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle Addon Checkbox toggles
  const handleToggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  };

  // Pure React Custom Calendar Generator
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    // First day of current month
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sun = 0, Mon = 1, etc.
    const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Align Mon = 0
    
    // Days count in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const daysArr = [];
    
    // Empty cells for alignment before month starts
    for (let i = 0; i < adjustedFirstDayIndex; i++) {
      daysArr.push(null);
    }
    
    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      daysArr.push(new Date(year, month, d));
    }
    
    return daysArr;
  }, [calendarMonth]);

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    // Current server/metadata time year is 2026-05. Do not let them go before May 2026.
    const nowLimit = new Date(2026, 4, 1);
    const targetMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    if (targetMonth >= nowLimit) {
      setCalendarMonth(targetMonth);
    }
  };

  // Final confirmation: submit and redirect to WhatsApp API
  const handleFormSubmit = () => {
    // Save to the local database first!
    db.addBooking({
      packageId: selectedPackageId,
      selectedAddons,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      total: invoiceCalculations.grandTotal,
      status: "PENDING"
    });

    const addonsDetail = selectedAddons
      .map(id => {
        const ad = ADDONS.find(a => a.id === id);
        return ad ? `- ${ad.name} (${formatRupiah(ad.price)})` : "";
      })
      .filter(Boolean)
      .join("\n");

    const messageTemplate = `Halo Admin Studiobook! 📸
Saya ingin melakukan reservasi studio foto privat dengan detail pemesanan berikut:

📝 *DETAIL INVOICE (PESANAN)*
----------------------------------------
*Paket:* ${activePackage.name}
*Harga Dasar:* ${formatRupiah(activePackage.price)}
*Durasi Sesi:* ${activePackage.duration}

${selectedAddons.length > 0 ? `*Layanan Tambahan (Add-ons):*\n${addonsDetail}` : "*Tambahan Add-ons:* Nihil"}

📅 *JADWAL SESI FOTO*
----------------------------------------
*Hari/Tanggal:* ${formatIndonesianDate(selectedDate)}
*Jam Sesi:* ${selectedTimeSlot} WIB

👤 *DATA DIRI PELANGGAN*
----------------------------------------
*Nama:* ${formData.fullName}
*Email:* ${formData.email}
*No. WhatsApp:* ${formData.phone}

----------------------------------------
💵 *TOTAL PEMBAYARAN:* ${formatRupiah(invoiceCalculations.grandTotal)}

Mohon konfirmasi ketersediaan jadwal slot studio ini ya Admin. Terima kasih banyak! 🙏`;

    // Construct WhatsApp link
    // Replace custom number with studio destination.
    const studioAdminWhatsApp = "6281234567890"; 
    const waUrl = `https://wa.me/${studioAdminWhatsApp}?text=${encodeURIComponent(messageTemplate)}`;
    
    // Open WhatsApp link in new window tab
    window.open(waUrl, "_blank");
  };

  // Steps Configuration for header indicator
  const stepsMeta = [
    { num: 1, label: "Paket & Add-ons" },
    { num: 2, label: "Jadwal" },
    { num: 3, label: "Data Diri" },
    { num: 4, label: "Konfirmasi" }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 text-slate-800 flex items-start md:items-center justify-center p-0 md:p-6 backdrop-blur-md">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-[20%] right-[30%] w-[400px] h-[400px] bg-slate-500 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-6xl bg-white md:rounded-none border border-zinc-250 shadow-2xl flex flex-col md:flex-row md:overflow-hidden min-h-screen md:min-h-0 md:max-h-[85vh]">
        
        {/* UPPER/MAIN CLOSE TRIGGER */}
        <button
          id="close-booking-wizard-btn"
          onClick={onClose}
          className="fixed md:absolute top-5 right-5 z-20 p-2.5 bg-white hover:bg-zinc-100 text-slate-500 hover:text-slate-950 rounded-none transition-colors border border-zinc-200"
        >
          <X size={18} />
        </button>

        {/* LEFT COLUMN: THE STEPPING FORM CONTAINER */}
        <div className="flex-1 p-6 pt-16 md:pt-10 md:p-10 flex flex-col justify-between md:overflow-y-auto">
          
          {/* Header Progress Indicators */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-widest uppercase text-slate-500 font-bold">
              <Sparkles size={11} className="text-slate-950 animate-spin" style={{ animationDuration: "12s" }} />
              <span>LANGKAH {currentStep} DARI 4</span>
            </div>
            
            {/* Horizontal Segment progress indicator */}
            <div className="grid grid-cols-4 gap-2 h-1.5 w-full bg-zinc-100 rounded-none overflow-hidden mb-6 border border-zinc-200/50">
              {stepsMeta.map((s) => (
                <div 
                  key={s.num} 
                  className={`h-full rounded-none transition-all duration-300 ${
                    currentStep >= s.num ? "bg-slate-900" : "bg-zinc-200"
                  }`} 
                />
              ))}
            </div>

            {/* Labels under segment in md screens */}
            <div className="hidden md:flex justify-between text-[11px] font-mono text-slate-500 font-bold">
              {stepsMeta.map((s) => (
                <span key={s.num} className={currentStep === s.num ? "text-slate-950 font-bold" : "text-slate-400"}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* DYNAMIC FORM INNER VIEW */}
          <div className="flex-1 my-auto pr-0 md:pr-4">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl md:text-2xl font-light font-display text-slate-950 mb-2">
                    Sesuaikan Paket & Tambahan Anda
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 font-sans">
                    Pilih paket dasar studiobook dan tambahkan layanan opsional untuk menyempurnakan hasil potret Anda.
                  </p>

                  {/* Choose Basic Package Section */}
                  <div className="mb-6">
                    <label className="block text-[10px] tracking-wide font-mono text-slate-500 uppercase mb-3 font-bold">
                      PILIH PAKET UTAMA:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PACKAGES.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <div
                            id={`step1-opt-pkg-${pkg.id}`}
                            key={pkg.id}
                            onClick={() => {
                              setSelectedPackageId(pkg.id);
                              // Auto clear items if incompatible or just standard flow
                            }}
                            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "bg-amber-500/8 border-amber-500 shadow-sm border-2 text-slate-900"
                                : "bg-white border-zinc-200 text-slate-700 hover:bg-zinc-50/50 hover:border-zinc-300"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className={`text-xs font-mono uppercase ${
                                isSelected ? "text-amber-800 font-bold" : "text-slate-400"
                              }`}>
                                {pkg.duration}
                              </span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? "border-amber-500 bg-white" : "border-slate-300 bg-white"
                              }`}>
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                                )}
                              </div>
                            </div>
                            
                            <h4 className={`text-sm font-semibold tracking-tight ${
                              isSelected ? "text-slate-950 font-extrabold" : "text-slate-800"
                            }`}>
                              {pkg.name}
                            </h4>
                            <span className={`text-xs font-mono mt-1 ${
                              isSelected ? "text-amber-700 font-bold" : "text-slate-650"
                            }`}>
                              {formatRupiah(pkg.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Addons List */}
                  <div>
                    <label className="block text-[10px] tracking-wide font-mono text-slate-500 uppercase mb-3 text-left font-bold">
                      LAYANAN TAMBAHAN (ADD-ONS) - OPSIONAL:
                    </label>
                    <div className="space-y-2.5">
                      {ADDONS.map((addon) => {
                        const isChecked = selectedAddons.includes(addon.id);
                        return (
                          <div
                            id={`addon-toggle-${addon.id}`}
                            key={addon.id}
                            onClick={() => handleToggleAddon(addon.id)}
                            className={`flex justify-between items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ${
                              isChecked
                                ? "bg-amber-500/5 border-amber-500 border-2 text-slate-950 shadow-sm"
                                : "bg-white border-zinc-200 text-slate-700 hover:bg-zinc-50/50 hover:border-zinc-300"
                            }`}
                          >
                            <div className="flex items-start gap-3 text-left">
                              <div className={`w-4.5 h-4.5 rounded border mt-0.5 flex items-center justify-center transition-colors ${
                                isChecked ? "bg-amber-500 border-amber-500 text-white" : "border-zinc-300 bg-white"
                              }`}>
                                {isChecked && <Check size={12} strokeWidth={3} />}
                              </div>
                              <div>
                                <h5 className={`text-xs font-medium ${isChecked ? "text-slate-950 font-bold" : "text-slate-800"}`}>
                                  {addon.name}
                                </h5>
                                <p className={`text-[11px] font-sans leading-normal line-clamp-1 ${isChecked ? "text-amber-900/80" : "text-slate-500"}`}>
                                  {addon.desc}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs font-mono shrink-0 ml-3 ${isChecked ? "text-amber-700 font-bold" : "text-slate-650"}`}>
                              +{formatRupiah(addon.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl md:text-2xl font-light font-display text-slate-950 mb-2">
                    Tentukan Hari & Jam Sesi Foto
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 font-sans">
                    Pilih tanggal di kalender interaktif kami, lalu selaraskan waktu slot kosong yang tersedia.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Modern Calendar component */}
                    <div className="bg-zinc-50/50 p-4 rounded-none border border-zinc-200">
                      <div className="flex justify-between items-center mb-4">
                        <button
                          id="prev-month-btn"
                          onClick={handlePrevMonth}
                          className="p-1 text-slate-505 hover:text-slate-900 hover:bg-zinc-100 rounded-none transition-colors border border-transparent"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs font-mono font-bold tracking-widest text-slate-800 uppercase">
                          {calendarMonth.toLocaleString("id-ID", { month: "long", year: "numeric" })}
                        </span>
                        <button
                          id="next-month-btn"
                          onClick={handleNextMonth}
                          className="p-1 text-slate-505 hover:text-slate-900 hover:bg-zinc-100 rounded-none transition-colors border border-transparent"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Calendar grid headers */}
                      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-slate-400 font-bold mb-2 uppercase">
                        <span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span><span>M</span>
                      </div>

                      {/* Calendar grid days */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, dIdx) => {
                          if (!day) return <div key={`empty-${dIdx}`} />;
                          
                          const year = day.getFullYear();
                          const month = String(day.getMonth() + 1).padStart(2, "0");
                          const date = String(day.getDate()).padStart(2, "0");
                          const dateKey = `${year}-${month}-${date}`;
                          const isSelected = selectedDate === dateKey;
                          
                          // Past date check - server metadata current date is 2026-05-28
                          const pastLimit = new Date(2026, 4, 28);
                          const isDisabled = day < pastLimit;

                          return (
                            <button
                              id={`cal-day-btn-${dateKey}`}
                              key={dateKey}
                              disabled={isDisabled}
                              onClick={() => setSelectedDate(dateKey)}
                              className={`aspect-square text-[11px] font-mono rounded-none transition-all flex flex-col justify-center items-center ${
                                isDisabled
                                  ? "text-zinc-300 cursor-not-allowed bg-zinc-100/30 line-through"
                                  : isSelected
                                    ? "bg-slate-900 text-white font-extrabold shadow-sm"
                                    : "text-slate-700 bg-white border border-zinc-100 hover:bg-zinc-100 hover:text-slate-950"
                              }`}
                            >
                              <span>{day.getDate()}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                      <span className="block text-[10px] tracking-wide font-mono text-slate-400 uppercase mb-3 text-left font-bold">
                        JADWAL JAM YANG TERSEDIA:
                      </span>
                      
                      {!selectedDate ? (
                        <div className="h-[220px] rounded-none border border-dashed border-zinc-200 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                          <CalendarIcon size={24} className="mb-2 text-zinc-300" />
                          <span className="text-xs font-sans">Pilih tanggal di kalender terlebih dahulu untuk melihat slot jam kosong.</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {availableSlotsForDate.map((slot) => {
                            const isSlotSelected = selectedTimeSlot === slot;
                            return (
                              <button
                                id={`slot-btn-${slot.replace(/[^a-z0-9]/g, "")}`}
                                key={slot}
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={`py-3 px-4 rounded-none border text-xs font-mono transition-all duration-305 ${
                                  isSlotSelected
                                    ? "bg-slate-900 border-slate-900 text-white font-bold"
                                    : "bg-zinc-50/50 border-zinc-200 text-slate-600 hover:border-slate-400 hover:bg-zinc-100"
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl md:text-2xl font-light font-display text-slate-950 mb-2">
                    Lengkapi Informasi Kontak Anda
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 font-sans">
                    Kami memerlukan data kontak yang valid untuk koordinasi pra-pemotretan dan pengiriman file link Google Drive.
                  </p>

                  <div className="space-y-4 max-w-md mx-auto text-left">
                    <div>
                      <label className="block text-[10px] tracking-wider font-mono text-slate-500 uppercase mb-1.5 flex items-center gap-1.5 font-bold">
                        <User size={12} className="text-slate-400" />
                        NAMA LENGKAP SANG PEMESAN
                      </label>
                      <input
                        id="form-full-name"
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Contoh: Jessica Ariesta"
                        className="w-full px-4 py-3 bg-zinc-50/30 border border-zinc-200 rounded-none text-sm focus:outline-none focus:border-slate-900 font-sans tracking-wide text-slate-900 transition-colors placeholder-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-wider font-mono text-slate-500 uppercase mb-1.5 font-bold">
                        ALAMAT EMAIL AKTIF
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Contoh: jessica@mail.com"
                        className="w-full px-4 py-3 bg-zinc-50/30 border border-zinc-200 rounded-none text-sm focus:outline-none focus:border-slate-900 font-sans tracking-wide text-slate-900 transition-colors placeholder-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-wider font-mono text-slate-500 uppercase mb-1.5 flex items-center gap-1.5 font-bold">
                        No. HP / WHATSAPP AKTIF
                      </label>
                      <div className="relative">
                        <input
                          id="form-phone-number"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Contoh: 08123456789"
                          className="w-full px-4 py-3 bg-zinc-50/30 border border-zinc-200 rounded-none text-sm focus:outline-none focus:border-slate-900 font-sans tracking-wide text-slate-900 transition-colors placeholder-zinc-400"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-sans">
                        Admin kami akan menggunakan info WhatsApp ini untuk berkomunikasi langsung dengan Anda.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl md:text-2xl font-light font-display text-slate-950 mb-2">
                    Review Pemesanan & Pembayaran
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 font-sans">
                    Sesi Anda hampir diproses! Harap lakukan peninjauan komprehensif pada detail booking di samping sebelum mengonfirmasi ke WhatsApp Admin.
                  </p>

                  <div className="bg-zinc-50/50 rounded-none p-5 border border-zinc-200 max-w-lg mx-auto text-left space-y-4">
                    <div className="flex items-center gap-2 mb-3 text-emerald-600 text-xs font-mono font-bold">
                      <CheckCircle size={14} />
                      Reservasi Terverifikasi (Tinggal Mengirim Pesan)
                    </div>

                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs border-b border-zinc-200 pb-4">
                      <div>
                        <span className="text-slate-400 block font-mono text-[10px] tracking-wider uppercase mb-0.5 font-bold">SANG PEMOTRET:</span>
                        <span className="text-slate-800 font-bold text-sm">{formData.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono text-[10px] tracking-wider uppercase mb-0.5 font-bold">WHATSAPP LINK:</span>
                        <span className="text-slate-800 font-bold text-sm">{formData.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono text-[10px] tracking-wider uppercase mb-0.5 font-bold">TANGGAL RESERVASI:</span>
                        <span className="text-slate-800 font-bold text-sm">{formatIndonesianDate(selectedDate)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-mono text-[10px] tracking-wider uppercase mb-0.5 font-bold">JAM JADWAL SESI:</span>
                        <span className="text-slate-800 font-bold text-sm">{selectedTimeSlot} WIB</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-slate-400 block font-mono text-[10px] tracking-wider uppercase mb-1 font-bold">KETENTUAN RESERVASI:</span>
                      <ul className="space-y-1.5 text-[11px] text-slate-500 font-sans">
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-900 font-extrabold mt-0.5">▪</span>
                          <span>Pembayaran uang muka (DP) biasanya dilakukan setelah konfirmasi manual via WhatsApp.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-slate-900 font-extrabold mt-0.5">▪</span>
                          <span>Reservasi dapat dijadwal ulang (reschedule) maksimal 3 hari sebelum waktu sesi.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BACK AND NEXT BUTTON TRIGGERS */}
          <div className="flex justify-between items-center pt-8 border-t border-zinc-200 mt-8">
            <button
              id="back-step-btn"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-none text-xs font-mono transition-all ${
                currentStep === 1
                  ? "text-zinc-300 opacity-20 cursor-not-allowed"
                  : "text-slate-500 hover:text-slate-905 hover:bg-zinc-100 font-bold"
              }`}
            >
              <ArrowLeft size={14} />
              Kembali
            </button>

            {currentStep < 4 ? (
              <button
                id="next-step-btn"
                onClick={handleNextStep}
                disabled={!isStepValid(currentStep)}
                className={`flex items-center gap-1.5 px-6 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-sm ${
                  isStepValid(currentStep)
                    ? "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none border border-zinc-200"
                }`}
              >
                Lanjutkan
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                id="submit-booking-btn"
                onClick={handleFormSubmit}
                className="flex items-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold rounded-none transition-all shadow-md cursor-pointer"
              >
                <Send size={13} />
                Pesan via WhatsApp
              </button>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: THE PERSISTENT SIDEBAR INVOICE */}
        <div className="w-full md:w-[360px] bg-zinc-50 border-t md:border-t-0 md:border-l border-zinc-200 p-6 md:p-8 flex flex-col justify-between md:overflow-y-auto">
          <div>
            {/* Invoice upper label */}
            <div className="flex items-center justify-between mb-6 border-b border-zinc-200 pb-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-800 font-mono font-bold tracking-widest leading-none">
                <ShoppingBag size={14} className="text-slate-900" />
                DETAIL INVOICE
              </span>
            </div>

            {/* Simulated physical layout receipt styling */}
            <div className="rounded-none bg-white p-5 border border-zinc-200 relative overflow-hidden shadow-sm">
              {/* Receipt decorative serrated top pattern */}
              <div className="absolute top-0 inset-x-0 h-1 bg-zinc-200 grid grid-cols-12 gap-0.5 opacity-50">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-full bg-white rounded-b-sm border-r border-zinc-150" />
                ))}
              </div>

              {/* Invoice breakdown body list */}
              <div className="space-y-4">
                {/* Active Basic Package description */}
                <div>
                  <span className="text-[9px] font-mono tracking-wider text-slate-400 block uppercase mb-1 font-bold">PAKET UTAMA:</span>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-slate-800 tracking-tight">{activePackage.name}</span>
                    <span className="text-xs font-mono text-slate-950 font-bold whitespace-nowrap">{formatRupiah(activePackage.price)}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">{activePackage.duration} Sesi</span>
                </div>

                {/* Selected addons section */}
                {selectedAddons.length > 0 && (
                  <div className="border-t border-dashed border-zinc-200 pt-3">
                    <span className="text-[9px] font-mono tracking-wider text-slate-400 block uppercase mb-1.5 font-bold">LAYANAN TAMBAHAN (ADD-ONS):</span>
                    <div className="space-y-2">
                      {selectedAddons.map((addonId) => {
                        const addon = ADDONS.find(a => a.id === addonId);
                        if (!addon) return null;
                        return (
                          <div key={addon.id} className="flex justify-between text-[11px] text-slate-700 leading-none">
                            <span className="text-left font-sans line-clamp-1">{addon.name}</span>
                            <span className="font-mono text-slate-950 font-bold ml-2">+{formatRupiah(addon.price)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Date & time slot section */}
                {(selectedDate || selectedTimeSlot) && (
                  <div className="border-t border-dashed border-zinc-200 pt-3 space-y-1.5">
                    <span className="text-[9px] font-mono tracking-wider text-slate-400 block uppercase font-bold">JADWAL YANG DIPILIH:</span>
                    {selectedDate && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-650 font-sans">
                        <CalendarIcon size={12} className="text-slate-400 shrink-0" />
                        <span className="text-left leading-normal">{formatIndonesianDate(selectedDate)}</span>
                      </div>
                    )}
                    {selectedTimeSlot && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-650 font-mono">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>Sesi Jam {selectedTimeSlot} WIB</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Customer data peek */}
                {formData.fullName.trim() && (
                  <div className="border-t border-dashed border-zinc-200 pt-3">
                    <span className="text-[9px] font-mono tracking-wider text-slate-400 block uppercase mb-1 font-bold">INFORMASI KONTAK:</span>
                    <span className="text-[11px] text-slate-700 font-sans block truncate text-left font-bold">{formData.fullName}</span>
                    {formData.phone && (
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{formData.phone}</span>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Grand total footer inside right sidebar */}
          <div className="border-t border-zinc-200 pt-4 mt-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">TOTAL INVOICE (ESTIMASI):</span>
              <span className="text-[10px] text-emerald-600 font-mono tracking-wider font-bold">MATA UANG IDR</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-light font-title text-slate-950 tracking-tighter font-extrabold">
                {formatRupiah(invoiceCalculations.grandTotal)}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 leading-normal text-left font-sans">
              *Harga estimasi bruto belum termasuk potongan promosi/diskon jika ada. Penyesuaian akhir diverifikasi admin.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
