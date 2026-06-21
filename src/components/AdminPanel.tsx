/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db, DBBooking, DaySchedule, SlotSettings, StudioSettings, Expense } from "../utils/db";
import { PhotoPackage, AddonOption } from "../types";
import {
  LayoutDashboard,
  Calendar,
  Package,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash,
  Search,
  Save,
  Check,
  TrendingUp,
  X,
  Eye,
  Mail,
  Phone,
  Instagram,
  MapPin,
  Wallet,
  AlertCircle,
  TrendingDown,
  ShoppingBag,
  DollarSign
} from "lucide-react";

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "packages" | "slots" | "reports" | "settings">("dashboard");

  // Load database tables
  const [bookings, setBookings] = useState<DBBooking[]>(() => db.getBookings());
  const [packages, setPackages] = useState<PhotoPackage[]>(() => db.getPackages());
  const [addons, setAddons] = useState<AddonOption[]>(() => db.getAddons());
  const [slotsSettings, setSlotsSettings] = useState<SlotSettings>(() => db.getSlotsSettings());
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(() => db.getSettings());
  const [expenses, setExpenses] = useState<Expense[]>(() => db.getExpenses());

  // Search and filter helpers
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>("ALL");
  const [bookingSearch, setBookingSearch] = useState<string>("");
  const [packageTab, setPackageTab] = useState<"paket" | "addon">("paket");

  // Modals / Trigger States
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PhotoPackage | null>(null);
  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<AddonOption | null>(null);
  
  // Expense Form / Trigger State
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Operasional");
  const [expenseDesc, setExpenseDesc] = useState("");

  // Target Date Filter for Daily Schedule View (Defaults to May 28, 2026 based on local metadata)
  const [selectedScheduleDay, setSelectedScheduleDay] = useState("Senin");
  
  const refreshData = () => {
    setBookings(db.getBookings());
    setPackages(db.getPackages());
    setAddons(db.getAddons());
    setSlotsSettings(db.getSlotsSettings());
    setStudioSettings(db.getSettings());
    setExpenses(db.getExpenses());
  };

  // Listen for real-time background Firestore synchronizations to update local states
  useEffect(() => {
    const handleDbChange = () => {
      refreshData();
    };
    window.addEventListener("sb_db_changed", handleDbChange);
    return () => {
      window.removeEventListener("sb_db_changed", handleDbChange);
    };
  }, []);

  // Helper formatter for Indonesian Currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const getDayNameFromDate = (dateString: string) => {
    const d = new Date(dateString);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return dayNames[d.getDay()];
  };

  // --- TAB 1: DASHBOARD ANALYTICS ---
  const dashboardStats = useMemo(() => {
    // Current Local Date specified: 2026-05-28
    const targetTodayStr = "2026-05-28";
    
    // bookings today
    const todayBookings = bookings.filter(b => b.date === targetTodayStr);
    const todayPremiumRevenue = todayBookings
      .filter(b => b.status === "LUNAS")
      .reduce((sum, b) => sum + b.total, 0);

    const pendingCount = bookings.filter(b => b.status === "PENDING").length;
    const lunasCount = bookings.filter(b => b.status === "LUNAS").length;

    return {
      todayRevenue: todayPremiumRevenue,
      totalBookings: bookings.length,
      pendingToday: pendingCount,
      completedToday: lunasCount,
      todayBookingsList: todayBookings
    };
  }, [bookings]);

  // Handle Booking Status Update directly
  const handleStatusChange = (id: string, nextStatus: "LUNAS" | "PENDING" | "BATAL") => {
    db.updateBookingStatus(id, nextStatus);
    refreshData();
  };

  // Delete Booking
  const handleDeleteBooking = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan booking ini?")) {
      db.deleteBooking(id);
      refreshData();
    }
  };

  // --- PACKAGES CRUD OPERATIONS ---
  const [pkgPayload, setPkgPayload] = useState({
    name: "",
    price: 0,
    duration: "",
    desc: "",
    inclusions: "",
    popular: false,
    active: true
  });

  const openPkgModal = (pkg: PhotoPackage | null = null) => {
    setSelectedPkg(pkg);
    if (pkg) {
      setPkgPayload({
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration,
        desc: pkg.desc,
        inclusions: pkg.inclusions.join("\n"),
        popular: pkg.popular || false,
        active: pkg.active !== false
      });
    } else {
      setPkgPayload({
        name: "",
        price: 0,
        duration: "45 Menit",
        desc: "",
        inclusions: "Sesi foto premium murni\nRetouching foto premium\nGoogle Drive link akses",
        popular: false,
        active: true
      });
    }
    setPkgModalOpen(true);
  };

  const handleSavePackage = () => {
    const formattedInclusions = pkgPayload.inclusions.split("\n").map(i => i.trim()).filter(Boolean);
    if (!pkgPayload.name || pkgPayload.price <= 0) {
      alert("Mohon isi nama paket dan harga dengan benar.");
      return;
    }

    if (selectedPkg) {
      // Update Package
      const updatedList = packages.map(p => {
        if (p.id === selectedPkg.id) {
          return {
            ...p,
            name: pkgPayload.name,
            price: pkgPayload.price,
            duration: pkgPayload.duration,
            desc: pkgPayload.desc,
            inclusions: formattedInclusions,
            popular: pkgPayload.popular,
            active: pkgPayload.active
          };
        }
        return p;
      });
      db.savePackages(updatedList);
    } else {
      // Add Package
      db.addPackage({
        name: pkgPayload.name,
        price: pkgPayload.price,
        duration: pkgPayload.duration,
        desc: pkgPayload.desc,
        inclusions: formattedInclusions,
        popular: pkgPayload.popular,
        active: pkgPayload.active
      });
    }
    setPkgModalOpen(false);
    refreshData();
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus paket fotografi ini?")) {
      db.deletePackage(id);
      refreshData();
    }
  };

  const handleTogglePackageActive = (id: string, curActive: boolean) => {
    const updated = packages.map(p => {
      if (p.id === id) return { ...p, active: !curActive };
      return p;
    });
    db.savePackages(updated);
    refreshData();
  };

  // --- ADDONS CRUD OPERATIONS ---
  const [addonPayload, setAddonPayload] = useState({
    name: "",
    price: 0,
    desc: "",
    active: true
  });

  const openAddonModal = (addon: AddonOption | null = null) => {
    setSelectedAddon(addon);
    if (addon) {
      setAddonPayload({
        name: addon.name,
        price: addon.price,
        desc: addon.desc,
        active: addon.active !== false
      });
    } else {
      setAddonPayload({
        name: "",
        price: 0,
        desc: "",
        active: true
      });
    }
    setAddonModalOpen(true);
  };

  const handleSaveAddon = () => {
    if (!addonPayload.name || addonPayload.price <= 0) {
      alert("Mohon lengkapi formulir add-on.");
      return;
    }

    if (selectedAddon) {
      const updatedList = addons.map(a => {
        if (a.id === selectedAddon.id) {
          return {
            ...a,
            name: addonPayload.name,
            price: addonPayload.price,
            desc: addonPayload.desc,
            active: addonPayload.active
          };
        }
        return a;
      });
      db.saveAddons(updatedList);
    } else {
      db.addAddon({
        name: addonPayload.name,
        price: addonPayload.price,
        desc: addonPayload.desc,
        active: addonPayload.active
      });
    }
    setAddonModalOpen(false);
    refreshData();
  };

  const handleDeleteAddon = (id: string) => {
    if (window.confirm("Yakin ingin menghapus add-on ini?")) {
      db.deleteAddon(id);
      refreshData();
    }
  };

  const handleToggleAddonActive = (id: string, curActive: boolean) => {
    const updated = addons.map(a => {
      if (a.id === id) return { ...a, active: !curActive };
      return a;
    });
    db.saveAddons(updated);
    refreshData();
  };

  // --- TAB 4: SLOT OPERATIONS & BLOCK SCHEDULER ---
  const updateDaySchedule = (day: string, field: keyof DaySchedule, value: string | number | boolean) => {
    const updatedSlots = { ...slotsSettings };
    updatedSlots.operational[day] = {
      ...updatedSlots.operational[day],
      [field]: value
    };
    db.updateSlotsSettings(updatedSlots);
    refreshData();
  };

  const [dateToBlock, setDateToBlock] = useState("");
  const handleBlockDate = () => {
    if (!dateToBlock) return;
    const updated = { ...slotsSettings };
    if (!updated.blockedDates) updated.blockedDates = [];
    if (!updated.blockedDates.includes(dateToBlock)) {
      updated.blockedDates.push(dateToBlock);
      db.updateSlotsSettings(updated);
      refreshData();
      setDateToBlock("");
    }
  };

  const handleUnblockDate = (idx: number) => {
    const updated = { ...slotsSettings };
    updated.blockedDates.splice(idx, 1);
    db.updateSlotsSettings(updated);
    refreshData();
  };

  // Helper slots calculator for schedule preview
  const livePreviewSlots = useMemo(() => {
    const schedule = slotsSettings.operational[selectedScheduleDay];
    if (!schedule || !schedule.active) return [];
    
    const calculatedSlots: string[] = [];
    const [startH, startM] = schedule.start.split(":").map(Number);
    const [endH, endM] = schedule.end.split(":").map(Number);
    
    let currentMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    const duration = schedule.duration;
    
    while (currentMin + duration <= endMin) {
      const sh = String(Math.floor(currentMin / 60)).padStart(2, "0");
      const sm = String(currentMin % 60).padStart(2, "0");
      const eh = String(Math.floor((currentMin + duration) / 60)).padStart(2, "0");
      const em = String((currentMin + duration) % 60).padStart(2, "0");
      calculatedSlots.push(`${sh}:${sm} - ${eh}:${em}`);
      currentMin = currentMin + duration + 5; // 5 mins gap
    }
    return calculatedSlots;
  }, [slotsSettings, selectedScheduleDay]);

  // --- TAB 5: REPORTS & FINANCIALS ---
  const [reportsTab, setReportsTab] = useState<"pemasukan" | "pemesanan" | "pengeluaran">("pemasukan");
  
  const reportSummary = useMemo(() => {
    const totalPemasukan = bookings
      .filter(b => b.status === "LUNAS")
      .reduce((sum, b) => sum + b.total, 0);

    const totalLunasCount = bookings.filter(b => b.status === "LUNAS").length;
    const avgNilaiBooking = totalLunasCount > 0 ? totalPemasukan / totalLunasCount : 0;
    
    const totalPengeluaran = expenses.reduce((sum, e) => sum + e.amount, 0);
    const labaBersih = totalPemasukan - totalPengeluaran;

    // Package Popularity stats count
    const packageStats: { [name: string]: { count: number; revenue: number } } = {};
    bookings.filter(b => b.status === "LUNAS").forEach(b => {
      const matchPkg = packages.find(p => p.id === b.packageId);
      const pkgName = matchPkg ? matchPkg.name : "Solo Session";
      if (!packageStats[pkgName]) {
        packageStats[pkgName] = { count: 0, revenue: 0 };
      }
      packageStats[pkgName].count += 1;
      packageStats[pkgName].revenue += b.total;
    });

    const popularPackagesList = Object.entries(packageStats).map(([name, stat]) => ({
      name,
      count: stat.count,
      revenue: stat.revenue
    })).sort((a, b) => b.revenue - a.revenue);

    return {
      totalPemasukan,
      totalLunasCount,
      avgNilaiBooking,
      totalPengeluaran,
      labaBersih,
      popularPackagesList
    };
  }, [bookings, expenses, packages]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (!expenseDesc || isNaN(amountNum) || amountNum <= 0) {
      alert("Mohon masukkan deskripsi dan jumlah pengeluaran.");
      return;
    }

    db.addExpense({
      date: new Date().toISOString().split("T")[0],
      category: expenseCategory,
      desc: expenseDesc,
      amount: amountNum
    });

    setExpenseAmount("");
    setExpenseDesc("");
    refreshData();
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Yakin ingin menghapus catatan pengeluaran ini?")) {
      db.deleteExpense(id);
      refreshData();
    }
  };

  // --- TAB 6: SETTINGS MANAGEMENT ---
  const [settingsPayload, setSettingsPayload] = useState<StudioSettings>(() => db.getSettings());
  
  const handleSaveSettings = () => {
    db.updateSettings(settingsPayload);
    alert("Pengaturan sistem studio berhasil disimpan!");
    refreshData();
  };

  // Booking search list filter
  const filteredBookingsList = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = bookingFilterStatus === "ALL" || b.status === bookingFilterStatus;
      const matchSearch = bookingSearch === "" || 
        b.fullName.toLowerCase().includes(bookingSearch.toLowerCase()) || 
        b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.phone.includes(bookingSearch);
      return matchStatus && matchSearch;
    });
  }, [bookings, bookingFilterStatus, bookingSearch]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-zinc-100 text-zinc-800 font-sans overflow-hidden">
      
      {/* SIDE NAVIGATION DRAWER */}
      <aside className="w-full md:w-64 bg-zinc-950 text-zinc-300 flex flex-row md:flex-col justify-between md:border-r border-b border-zinc-900 z-10 shrink-0 overflow-x-auto md:overflow-hidden::-webkit-scrollbar { display: none; } scrollbar-width: none;">
        <div className="flex flex-row md:flex-col items-center md:items-stretch min-w-max md:min-w-0">
          {/* Logo Brand Brand Details */}
          <div className="p-4 md:p-6 md:border-b border-zinc-900 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center font-bold">
              S
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-bold tracking-tight text-white uppercase font-display block leading-none">
                StudioBook.
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#10B981] font-bold block uppercase mt-1">
                ONLINE PORTAL
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-row md:flex-col p-2 md:p-4 gap-1 md:gap-0 md:space-y-1 items-center md:items-stretch">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "bookings", label: "Booking", icon: Calendar },
              { id: "packages", label: "Paket", icon: Package },
              { id: "slots", label: "Slot Jadwal", icon: Clock },
              { id: "reports", label: "Laporan", icon: BarChart3 },
              { id: "settings", label: "Pengaturan", icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 text-xs font-mono font-bold tracking-wide transition-all shrink-0 ${
                    isActive
                      ? "bg-zinc-900 text-[#10B981] md:border-l-2 md:border-b-0 border-b-2 border-[#10B981]"
                      : "hover:bg-zinc-900 hover:text-white border-b-2 border-transparent md:border-b-0"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-[#10B981]" : ""} />
                  <span className="hidden sm:inline md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Foot Action Button */}
        <div className="p-2 md:p-4 md:border-t border-zinc-900 flex items-center shrink-0">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 hover:bg-red-950/40 text-rose-400 hover:text-rose-300 text-xs font-mono font-bold transition-all rounded-md md:rounded-none"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline md:inline">Keluar</span>
          </button>
        </div>
      </aside>

      {/* CORE WORKSPACE VIEW */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#fafafa]">
        {/* Top Header Controls bar */}
        <header className="h-auto md:h-16 py-4 md:py-0 border-b border-zinc-200 bg-white flex flex-col md:flex-row items-center justify-between px-4 md:px-8 shrink-0 shadow-sm gap-3 md:gap-0">
          <div className="text-center md:text-left">
            <h1 className="text-lg md:text-xl font-light font-display tracking-tight text-zinc-900 uppercase">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "bookings" && "Daftar Booking Masuk"}
              {activeTab === "packages" && "Manajemen Paket & Add-on"}
              {activeTab === "slots" && "Manajemen Slot Operasional"}
              {activeTab === "reports" && "Laporan Keuangan & Statistika"}
              {activeTab === "settings" && "Pengaturan Sistem Studio"}
            </h1>
          </div>

          {/* User Account Detail */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-zinc-900 block leading-none">Admin Studio</span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-1">hello@studiobook.id</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-mono text-sm font-bold border border-zinc-300">
              A
            </div>
          </div>
        </header>

        {/* VIEW PORT SCROLL CONTENT */}
        <section className="flex-1 p-8 overflow-y-auto">
          
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: DASHBOARD OVERVIEW */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* 4 Cards Grid Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  
                  {/* Metric 1 */}
                  <div className="bg-white p-6 border border-zinc-200 rounded-none shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase">
                      PEMASUKAN BULAN INI
                    </span>
                    <div className="mt-3">
                      <h2 className="text-2xl font-light text-[#10B981] font-display">
                        {formatRupiah(reportSummary.totalPemasukan)}
                      </h2>
                      <span className="text-[9px] text-[#10B981] font-mono font-bold mt-1 block">
                        ↑ 12.4% dari bulan lalu
                      </span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-white p-6 border border-zinc-200 rounded-none shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase">
                      TOTAL AKTIVITAS BOOKING
                    </span>
                    <div className="mt-3">
                      <h2 className="text-3xl font-light font-display text-zinc-900">
                        {dashboardStats.totalBookings}
                      </h2>
                      <span className="text-[9px] text-zinc-500 font-mono mt-1 block">
                        ↓ 60% bulan ini
                      </span>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-white p-6 border border-zinc-200 rounded-none shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase">
                      PENDING JADWAL
                    </span>
                    <div className="mt-3">
                      <h2 className="text-3xl font-light font-display text-amber-500">
                        {dashboardStats.pendingToday}
                      </h2>
                      <span className="text-[9px] text-zinc-500 font-mono mt-1 block">
                        Memerlukan verifikasi admin
                      </span>
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-white p-6 border border-zinc-200 rounded-none shadow-sm flex flex-col justify-between min-h-[120px]">
                    <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase">
                      SELESAI LUNAS
                    </span>
                    <div className="mt-3">
                      <h2 className="text-3xl font-bold font-display text-emerald-600">
                        {dashboardStats.completedToday}
                      </h2>
                      <span className="text-[9px] text-[#10B981] font-mono font-bold mt-1 block">
                        Konfirmasi selesai
                      </span>
                    </div>
                  </div>

                </div>

                {/* GRAPH & WORK-LIST SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Graphic Chart */}
                  <div className="lg:col-span-8 bg-white border border-zinc-200 p-6 shadow-sm rounded-none">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-700">
                        Grafik Pemasukan Bulanan
                      </h3>
                      <select className="text-xs font-mono p-1 border border-zinc-300 rounded-none">
                        <option>Minggu Ini</option>
                        <option>Bulan Ini</option>
                      </select>
                    </div>

                    {/* Highly Polished SVG Chart */}
                    <div className="h-64 relative bg-[#fafafa] border border-zinc-150 p-4">
                      {/* Simple dynamic SVG visual line representing the sales data */}
                      <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area path */}
                        <path
                          d="M 10,180 C 80,165 150,140 220,130 S 360,70 500,50 L 500,200 L 10,200 Z"
                          fill="url(#chartGradient)"
                        />
                        {/* Line path */}
                        <path
                          d="M 10,180 C 80,165 150,140 220,130 S 360,70 500,50"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Dot marks */}
                        <circle cx="10" cy="180" r="4" fill="#10B981" />
                        <circle cx="150" cy="148" r="4" fill="#10B981" />
                        <circle cx="220" cy="130" r="4" fill="#10B981" />
                        <circle cx="360" cy="78" r="4" fill="#10B981" />
                        <circle cx="500" cy="50" r="4" fill="#10B981" />
                      </svg>
                      {/* X-axis labels */}
                      <div className="absolute bottom-1 left-4 right-4 flex justify-between text-[8px] font-mono text-zinc-400">
                        <span>Sen</span>
                        <span>Sel</span>
                        <span>Rab</span>
                        <span>Kam</span>
                        <span>Jum</span>
                        <span>Sab</span>
                        <span>Min</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Daily Schedule View */}
                  <div className="lg:col-span-4 bg-white border border-zinc-200 p-6 shadow-sm rounded-none">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-700 mb-6">
                      Jadwal Pemotretan Hari Ini
                    </h3>
                    
                    {/* Schedule date control filter */}
                    <div className="mb-4">
                      <select 
                        value={selectedScheduleDay}
                        onChange={(e) => setSelectedScheduleDay(e.target.value)}
                        className="w-full text-xs font-mono p-2 border border-zinc-250 bg-zinc-50"
                      >
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                        <option value="Minggu">Minggu</option>
                      </select>
                    </div>

                    {/* Operational Slots list preview */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {livePreviewSlots.length === 0 ? (
                        <div className="text-center py-8 text-zinc-400 text-xs font-sans">
                          Tidak ada jadwal operasional hari ini.
                        </div>
                      ) : (
                        livePreviewSlots.map((slot, i) => {
                          const isBooked = bookings.some(b => b.timeSlot === slot && b.status === "LUNAS");
                          const matchedBooking = bookings.find(b => b.timeSlot === slot);
                          
                          return (
                            <div 
                              key={i} 
                              className={`p-3 border flex items-center justify-between text-xs rounded-none transition-colors ${
                                isBooked
                                  ? "bg-red-50 border-red-200"
                                  : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                              }`}
                            >
                              <div>
                                <span className="font-mono font-bold text-zinc-900 block">{slot}</span>
                                <span className={`text-[9px] font-mono ${isBooked ? "text-red-500 font-bold" : "text-zinc-400"}`}>
                                  {isBooked ? `TERISI: ${matchedBooking?.fullName}` : "KOSONG/OPEN"}
                                </span>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" style={{ backgroundColor: isBooked ? "#EF4444" : "#10B981" }} />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* RECENT BOOKINGS LIST PANEL */}
                <div className="bg-white border border-zinc-200 shadow-sm rounded-none">
                  <div className="p-6 border-b border-zinc-250 flex items-center justify-between">
                    <h3 className="text-sm font-bold font-mono tracking-wider text-zinc-800 uppercase">
                      Pemesanan / Booking Masuk Terbaru
                    </h3>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="text-xs text-[#10B981] font-mono hover:underline font-bold"
                    >
                      Lihat Semua &apos;
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-450 uppercase font-mono tracking-wider">
                          <th className="py-4 px-6 font-bold">CUSTOMER</th>
                          <th className="py-4 px-6 font-bold">KODE</th>
                          <th className="py-4 px-6 font-bold">TANGGAL</th>
                          <th className="py-4 px-6 font-bold">SLOT WAKTU</th>
                          <th className="py-4 px-6 font-bold">STATUS JADWAL</th>
                          <th className="py-4 px-6 font-bold text-right">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {bookings.slice(0, 5).map(b => {
                          const currentPkg = packages.find(p => p.id === b.packageId);
                          return (
                            <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="py-4 px-6 font-bold text-zinc-900">
                                {b.fullName}
                                <span className="block text-[10px] text-zinc-400 font-mono font-light mt-0.5">{b.phone}</span>
                              </td>
                              <td className="py-4 px-6 font-mono font-medium text-zinc-650">{b.id}</td>
                              <td className="py-4 px-6 font-mono text-zinc-500">{b.date}</td>
                              <td className="py-4 px-6 font-mono text-zinc-600 font-medium">{b.timeSlot}</td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-0.5 rounded-none font-mono text-[9px] font-bold tracking-wide ${
                                  b.status === "LUNAS" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                                  b.status === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                                  "bg-zinc-50 text-zinc-400 border border-zinc-200"
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-mono font-bold text-zinc-900 text-right">{formatRupiah(b.total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEW 2: BOOKINGS LIST DIRECTORY */}
            {activeTab === "bookings" && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Search and Filters */}
                <div className="bg-white border border-zinc-200 p-6 shadow-sm rounded-none flex flex-col md:flex-row gap-4 justify-between items-center">
                  
                  {/* Search Bar input */}
                  <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-450 pointer-events-none">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Cari nama, kode / HP..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-zinc-250 rounded-none text-xs font-mono bg-[#fafafa] focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Filter Select Status Tab */}
                  <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {["ALL", "PENDING", "LUNAS", "BATAL"].map(status => (
                      <button
                        key={status}
                        onClick={() => setBookingFilterStatus(status)}
                        className={`px-4 py-2 text-xs font-mono font-bold tracking-wide transition-all border ${
                          bookingFilterStatus === status
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        {status === "ALL" ? "SEMUA" : status}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Table Directory Bookings */}
                <div className="bg-white border border-zinc-200 shadow-sm rounded-none overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-mono tracking-wider font-bold">
                          <th className="py-4 px-6">PELANGGAN</th>
                          <th className="py-4 px-6">KODE</th>
                          <th className="py-4 px-6">PAKET/SESI</th>
                          <th className="py-4 px-6">TANGGAL SENSIONAL</th>
                          <th className="py-4 px-6">JAM SLOT</th>
                          <th className="py-4 px-6">STATUS BAYAR</th>
                          <th className="py-4 px-6 text-right">TOTAL NET</th>
                          <th className="py-4 px-6 text-center">TINDAKAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150">
                        {filteredBookingsList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-12 text-zinc-400 font-sans">
                              Tidak ada data pendaftaran booking yang cocok dengan filter.
                            </td>
                          </tr>
                        ) : (
                          filteredBookingsList.map(b => {
                            const matchPkg = packages.find(p => p.id === b.packageId);
                            return (
                              <tr key={b.id} className="hover:bg-zinc-50/20 transition-colors">
                                <td className="py-4 px-6">
                                  <span className="font-bold text-zinc-900 block text-xs">{b.fullName}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono mt-1 block font-light">{b.phone}</span>
                                </td>
                                <td className="py-4 px-6 font-mono font-medium text-zinc-650">{b.id}</td>
                                <td className="py-4 px-6 font-sans">
                                  <span className="font-medium text-zinc-700 block">{matchPkg ? matchPkg.name : "Solo Session"}</span>
                                  <span className="text-[9px] text-zinc-400 font-mono">{b.selectedAddons.length} Add-ons</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-zinc-650">{b.date}</td>
                                <td className="py-4 px-6 font-mono text-zinc-650 font-bold">{b.timeSlot}</td>
                                <td className="py-4 px-6 text-xs">
                                  <div className="relative">
                                    <select
                                      value={b.status}
                                      onChange={(e) => handleStatusChange(b.id, e.target.value as any)}
                                      className={`p-1.5 border font-mono text-[10px] font-bold rounded-none focus:outline-none cursor-pointer ${
                                        b.status === "LUNAS" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                        b.status === "PENDING" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                        "bg-rose-50 text-rose-500 border-rose-200"
                                      }`}
                                    >
                                      <option value="PENDING">PENDING</option>
                                      <option value="LUNAS">LUNAS</option>
                                      <option value="BATAL">BATAL</option>
                                    </select>
                                  </div>
                                </td>
                                <td className="py-4 px-6 font-mono font-bold text-zinc-900 text-right">
                                  {formatRupiah(b.total)}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center gap-3 text-zinc-400">
                                    <button
                                      onClick={() => handleDeleteBooking(b.id)}
                                      className="hover:text-rose-500 transition-colors p-1"
                                      title="Hapus Rekaman"
                                    >
                                      <Trash size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: PACKAGES & ADDONS LIST */}
            {activeTab === "packages" && (
              <motion.div
                key="packages"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                
                {/* Content header tab toggle */}
                <div className="flex items-center justify-between">
                  <div className="bg-white border p-1 border-zinc-200 rounded-none shadow-sm flex inline-flex">
                    <button
                      onClick={() => setPackageTab("paket")}
                      className={`px-4 py-2 font-mono text-xs font-bold transition-all ${
                        packageTab === "paket"
                          ? "bg-zinc-950 text-white"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Paket Foto
                    </button>
                    <button
                      onClick={() => setPackageTab("addon")}
                      className={`px-4 py-2 font-mono text-xs font-bold transition-all ${
                        packageTab === "addon"
                          ? "bg-zinc-950 text-white"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Add-on Layanan
                    </button>
                  </div>

                  <button
                    onClick={() => packageTab === "paket" ? openPkgModal() : openAddonModal()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-bold rounded-none shadow-md"
                  >
                    <Plus size={14} />
                    <span>Tambah Data</span>
                  </button>
                </div>

                {/* Tab Content Rendering */}
                {packageTab === "paket" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {packages.map(p => (
                      <div key={p.id} className="bg-white border border-zinc-200 p-6 flex flex-col justify-between shadow-sm relative">
                        <div>
                          {/* Active State Toggle badge */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-mono tracking-widest text-zinc-400 font-bold uppercase">
                              {p.duration} • ID: {p.id}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-mono font-bold uppercase ${p.active !== false ? "text-emerald-500" : "text-rose-400"}`}>
                                {p.active !== false ? "AKTIF" : "TIDAK AKTIF"}
                              </span>
                              
                              {/* Quick active toggle trigger */}
                              <button
                                onClick={() => handleTogglePackageActive(p.id, p.active !== false)}
                                className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                                  p.active !== false ? "bg-emerald-500" : "bg-zinc-300"
                                }`}
                              >
                                <div className={`w-3 h-3 bg-white transition-transform ${p.active !== false ? "translate-x-4" : ""}`} />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-lg font-bold text-zinc-905">{p.name}</h3>
                          <p className="text-xs text-zinc-400 mt-1 lines-clamp-2">{p.desc}</p>
                          
                          <div className="my-4 pt-4 border-t border-dashed border-zinc-200">
                            <h4 className="text-[9px] font-mono tracking-wider font-bold text-zinc-400 uppercase mb-2">SUDAH TERMASUK:</h4>
                            <ul className="text-xs text-zinc-650 space-y-1 pl-4 list-disc">
                              {p.inclusions.slice(0, 3).map((inc, i) => (
                                <li key={i}>{inc}</li>
                              ))}
                              {p.inclusions.length > 3 && <li className="text-[10px] italic text-[#10B981] font-mono">+ {p.inclusions.length - 3} lainnya</li>}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-150 pt-4 mt-6">
                          <span className="text-xl font-light font-display text-zinc-900">{formatRupiah(p.price)}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              onClick={() => openPkgModal(p)}
                              className="px-3 py-1.5 border border-zinc-200 font-mono hover:border-zinc-400 text-zinc-600 bg-zinc-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePackage(p.id)}
                              className="px-3 py-1.5 border border-rose-100 text-rose-500 bg-rose-50/10 hover:bg-rose-50"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addons.map(a => (
                      <div key={a.id} className="bg-white border border-zinc-200 p-5 flex items-center justify-between shadow-sm">
                        <div className="flex-1 pr-4">
                          <span className="text-[9px] font-mono text-zinc-400 block font-bold mb-1">ID: {a.id}</span>
                          <h4 className="text-sm font-bold text-zinc-900">{a.name}</h4>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{a.desc}</p>
                          <span className="text-xs font-mono font-bold text-[#10B981] block mt-2">{formatRupiah(a.price)}</span>
                        </div>

                        <div className="flex flex-col items-end gap-3 justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono font-bold ${a.active !== false ? "text-[#10B981]" : "text-zinc-400"}`}>
                              {a.active !== false ? "AKTIF" : "OFF"}
                            </span>
                            <button
                              onClick={() => handleToggleAddonActive(a.id, a.active !== false)}
                              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                                a.active !== false ? "bg-[#10B981]" : "bg-zinc-300"
                              }`}
                            >
                              <div className={`w-3 h-3 bg-white transition-transform ${a.active !== false ? "translate-x-4" : ""}`} />
                            </button>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => openAddonModal(a)}
                              className="p-1 hover:text-[#10B981] border border-zinc-100 bg-[#f9f9f9]"
                              title="Edit"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddon(a.id)}
                              className="p-1 text-rose-400 hover:text-rose-500 border border-thin bg-rose-50/5 hover:bg-rose-50"
                              title="Hapus"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </motion.div>
            )}

            {/* VIEW 4: OPERATIONAL SLOT SCHEDULER */}
            {activeTab === "slots" && (
              <motion.div
                key="slots"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                
                {/* Left Daily Configuration Form */}
                <div className="lg:col-span-8 bg-white border border-zinc-200 p-6 shadow-sm rounded-none">
                  <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-700 mb-6 pb-2 border-b">
                    Jam Operasional & Durasi per Hari
                  </h3>

                  <div className="divide-y divide-zinc-200">
                    {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(day => {
                      const daySched = slotsSettings.operational[day] || { active: true, start: "10:00", end: "22:00", duration: 45 };
                      return (
                        <div key={day} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="w-24 shrink-0 flex items-center justify-between">
                            <span className="font-bold text-xs text-zinc-900">{day}</span>
                            <button
                              onClick={() => updateDaySchedule(day, "active", !daySched.active)}
                              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                                daySched.active ? "bg-emerald-500" : "bg-zinc-300"
                              }`}
                            >
                              <div className={`w-3 h-3 bg-white transition-transform ${daySched.active ? "translate-x-4" : ""}`} />
                            </button>
                          </div>

                          {daySched.active ? (
                            <div className="flex flex-1 flex-wrap items-center gap-3 text-xs font-mono">
                              <input
                                type="text"
                                style={{ width: "60px" }}
                                maxLength={5}
                                value={daySched.start}
                                onChange={(e) => updateDaySchedule(day, "start", e.target.value)}
                                className="p-1 border border-zinc-300 text-center rounded-none bg-[#fafafa]"
                              />
                              <span className="text-zinc-400">s/d</span>
                              <input
                                type="text"
                                style={{ width: "60px" }}
                                maxLength={5}
                                value={daySched.end}
                                onChange={(e) => updateDaySchedule(day, "end", e.target.value)}
                                className="p-1 border border-zinc-300 text-center rounded-none bg-[#fafafa]"
                              />
                              
                              <span className="text-zinc-300 pl-2">|</span>
                              
                              <span className="text-zinc-500 pl-2 font-sans text-[11px]">Durasi:</span>
                              <select
                                value={daySched.duration}
                                onChange={(e) => updateDaySchedule(day, "duration", Number(e.target.value))}
                                className="p-1 border border-zinc-300 rounded-none bg-[#fafafa]"
                              >
                                <option value={30}>30 Min</option>
                                <option value={45}>45 Min</option>
                                <option value={60}>60 Min</option>
                                <option value={90}>90 Min</option>
                              </select>
                            </div>
                          ) : (
                            <span className="flex-1 text-xs text-zinc-400 font-sans italic">Tutup (Libur nasional/libur studio)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Block Date Control Calendar */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Block lists */}
                  <div className="bg-white border border-zinc-200 p-6 shadow-sm rounded-none">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-700 mb-6 pb-2 border-b">
                      Set Tanggal Tidak Available
                    </h3>
                    
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dateToBlock}
                        onChange={(e) => setDateToBlock(e.target.value)}
                        className="flex-1 p-2 border border-zinc-250 text-xs font-mono bg-[#fafafa]"
                      />
                      <button
                        onClick={handleBlockDate}
                        className="px-3 bg-zinc-900 text-white font-mono text-xs font-bold hover:bg-zinc-800"
                      >
                        Block
                      </button>
                    </div>

                    <div className="mt-6 space-y-2 max-h-[140px] overflow-y-auto">
                      {(slotsSettings.blockedDates || []).length === 0 ? (
                        <p className="text-xs text-zinc-400 font-sans italic">Tidak ada tanggal diblokir.</p>
                      ) : (
                        slotsSettings.blockedDates.map((d, i) => (
                          <div key={i} className="flex justify-between items-center text-xs p-2 bg-red-50 border border-red-100 font-mono text-zinc-700">
                            <span>{d}</span>
                            <button onClick={() => handleUnblockDate(i)} className="text-zinc-400 hover:text-rose-500">
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Simulator Preview */}
                  <div className="bg-white border border-zinc-200 p-6 shadow-sm rounded-none">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-700 mb-4">
                      Preview Slot Jadwal Senggang
                    </h3>
                    <select 
                      value={selectedScheduleDay}
                      onChange={(e) => setSelectedScheduleDay(e.target.value)}
                      className="w-full text-xs font-mono p-2 border border-zinc-250 bg-[#fafafa] uppercase mb-4"
                    >
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                      <option value="Sabtu">Sabtu</option>
                      <option value="Minggu">Minggu</option>
                    </select>

                    <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto font-mono text-[9px] border p-2 bg-[#fbfbfb]">
                      {livePreviewSlots.length === 0 ? (
                        <div className="col-span-2 text-center py-6 text-zinc-400 font-sans italic">Tutup (Tidak ada data)</div>
                      ) : (
                        livePreviewSlots.map((s, idx) => (
                          <div key={idx} className="p-1 text-center bg-white border border-zinc-200">
                            {s}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEW 5: FINANCE REPORTS */}
            {activeTab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                
                {/* Reports Navigation tabs sub-bar */}
                <div className="flex items-center justify-between">
                  <div className="bg-white border border-zinc-200 p-1 flex shadow-sm">
                    <button
                      onClick={() => setReportsTab("pemasukan")}
                      className={`px-4 py-2 font-mono text-xs font-bold transition-all ${
                        reportsTab === "pemasukan" ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      onClick={() => setReportsTab("pemesanan")}
                      className={`px-4 py-2 font-mono text-xs font-bold transition-all ${
                        reportsTab === "pemesanan" ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Pemesanan / Booking
                    </button>
                    <button
                      onClick={() => setReportsTab("pengeluaran")}
                      className={`px-4 py-2 font-mono text-xs font-bold transition-all ${
                        reportsTab === "pengeluaran" ? "bg-zinc-950 text-white" : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      Pengeluaran
                    </button>
                  </div>

                  {/* Aesthetic Export excel button */}
                  <button className="px-4 py-2 bg-[#fafafa] border border-zinc-300 text-xs font-mono font-bold tracking-wide flex items-center gap-1 hover:border-zinc-500 shadow-sm">
                    <span>Export Excel</span>
                  </button>
                </div>

                {/* Sub Tab: Pemasukan */}
                {reportsTab === "pemasukan" && (
                  <div className="space-y-8">
                    {/* Metrics row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white border p-6 text-left shadow-sm">
                        <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase block mb-2">TOTAL PEMASUKAN BRUTO</span>
                        <h2 className="text-2xl font-light font-display text-[#10B981]">{formatRupiah(reportSummary.totalPemasukan)}</h2>
                        <span className="text-[10px] text-zinc-400 font-mono block mt-1">Lunas terverifikasi</span>
                      </div>
                      <div className="bg-white border p-6 text-left shadow-sm">
                        <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase block mb-2">TOTAL TRANSAKSI LUNAS</span>
                        <h2 className="text-2xl font-bold font-display text-zinc-900">{reportSummary.totalLunasCount} Sesi</h2>
                        <span className="text-[10px] text-zinc-400 font-mono block mt-1">Maksimum target +20%</span>
                      </div>
                      <div className="bg-white border p-6 text-left shadow-sm">
                        <span className="text-[9px] font-mono tracking-widest text-[#455A64] font-bold uppercase block mb-2">AVG. NILAI PEMESANAN</span>
                        <h2 className="text-2xl font-light font-display text-[#37474F]">{formatRupiah(reportSummary.avgNilaiBooking)}</h2>
                        <span className="text-[10px] text-zinc-400 font-mono block mt-1">Rata-rata keranjang belanja</span>
                      </div>
                    </div>

                    {/* Popular packages and summary table split */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: detail transactions table */}
                      <div className="lg:col-span-8 bg-white border border-zinc-200 shadow-sm p-6">
                        <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-700 mb-4 pb-2 border-b">Detail Rincian Pemasukan</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs font-mono">
                            <thead>
                              <tr className="border-b text-zinc-400 uppercase font-bold text-[10px]">
                                <th className="py-2.5">TANGGAL</th>
                                <th className="py-2.5">KODE</th>
                                <th className="py-2.5">PELANGGAN</th>
                                <th className="py-2.5 text-right">JUMLAH</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bookings.filter(b => b.status === "LUNAS").map(b => (
                                <tr key={b.id} className="border-b hover:bg-zinc-50 border-zinc-100">
                                  <td className="py-3 text-zinc-500">{b.date}</td>
                                  <td className="py-3 font-bold text-zinc-650">{b.id}</td>
                                  <td className="py-3 text-zinc-700">{b.fullName}</td>
                                  <td className="py-3 text-right font-bold text-emerald-500">+{formatRupiah(b.total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: popular categories widget */}
                      <div className="lg:col-span-4 bg-white border border-zinc-200 shadow-sm p-6">
                        <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-700 mb-4 pb-2 border-b">Paket Paling Laris</h3>
                        <div className="space-y-4">
                          {reportSummary.popularPackagesList.length === 0 ? (
                            <p className="text-xs text-zinc-400 font-sans italic text-center py-6">Belum ada statistics penjualan.</p>
                          ) : (
                            reportSummary.popularPackagesList.map((st, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-bold text-zinc-800 block">{st.name}</span>
                                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">{st.count} Pemesanan</span>
                                </div>
                                <span className="font-mono font-bold text-zinc-900">{formatRupiah(st.revenue)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab: Pemesanan / Booking counts */}
                {reportsTab === "pemesanan" && (
                  <div className="space-y-6">
                    {/* Metrics block */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white border p-6 shadow-sm0 text-left">
                        <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase block mb-1">TOTAL BOOKING</span>
                        <h2 className="text-2xl font-light font-display text-zinc-900">{bookings.length}</h2>
                        <span className="text-[10px] text-zinc-400 font-mono">Keseluruhan entri masuk</span>
                      </div>
                      <div className="bg-white border p-6 shadow-sm text-emerald-600 border-l-2 border-emerald-500 text-left">
                        <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase block mb-1">LUNAS DIKONFIRMASI</span>
                        <h2 className="text-2xl font-bold font-display">{bookings.filter(b => b.status === "LUNAS").length}</h2>
                        <span className="text-[10px] text-zinc-400 font-mono">75% dari total target</span>
                      </div>
                      <div className="bg-white border p-6 shadow-sm text-yellow-500 border-l-2 border-yellow-500 text-left">
                        <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase block mb-1">MENUNGGU VERIFIKASI</span>
                        <h2 className="text-2xl font-bold font-display">{bookings.filter(b => b.status === "PENDING").length}</h2>
                        <span className="text-[10px] text-zinc-400 font-mono">Perlu direspon admin</span>
                      </div>
                      <div className="bg-white border p-6 shadow-sm text-rose-500 border-l-2 border-rose-500 text-left">
                        <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase block mb-1">DIBATALKAN</span>
                        <h2 className="text-2xl font-bold font-display">{bookings.filter(b => b.status === "BATAL").length}</h2>
                        <span className="text-[10px] text-zinc-400 font-mono">Pesanan tidak tereksekusi</span>
                      </div>
                    </div>

                    <div className="bg-white border border-zinc-200 p-6 shadow-sm rounded-none">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-700 uppercase mb-4 pb-2 border-b">
                        Antrean Log Status Pesanan Reservasi
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="border-b text-zinc-400 font-bold text-[10px]">
                              <th className="py-2.5">KODE Reservasi</th>
                              <th className="py-2.5">PELANGGAN (WHATSAPP)</th>
                              <th className="py-2.5">TANGGAL RESERVED</th>
                              <th className="py-2.5">STADIUM STATUS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.map(b => (
                              <tr key={b.id} className="border-b hover:bg-zinc-50 border-zinc-100">
                                <td className="py-3 font-bold text-zinc-700">{b.id}</td>
                                <td className="py-3 text-zinc-850">{b.fullName} ({b.phone})</td>
                                <td className="py-3 text-zinc-500">{b.date} • {b.timeSlot}</td>
                                <td className="py-3">
                                  <span className={`px-1.5 py-0.5 hover:shadow-xs rounded-none text-[8.5px] font-bold ${
                                    b.status === "LUNAS" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    b.status === "PENDING" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                    "bg-rose-50 text-rose-500 border border-rose-100"
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub Tab: Pengeluaran expenses ledger and form */}
                {reportsTab === "pengeluaran" && (
                  <div className="space-y-8">
                    {/* Grid metrics split */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: expenses ledger lists */}
                      <div className="lg:col-span-8 bg-white border border-zinc-200 p-6 shadow-sm rounded-none">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b">
                          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-700">Rincian Pengeluaran Pembukuan</h3>
                          <span className="text-xs font-bold text-[#f87171] font-mono">Total: -{formatRupiah(reportSummary.totalPengeluaran)}</span>
                        </div>

                        <div className="overflow-x-auto font-mono text-xs">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b text-zinc-400 font-bold uppercase text-[9px]">
                                <th className="py-2">TANGGAL</th>
                                <th className="py-2">KATEGORI</th>
                                <th className="py-2">KETERANGAN</th>
                                <th className="py-2 text-right">JUMLAH</th>
                                <th className="py-2 text-center">AKSI</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {expenses.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-8 text-zinc-400 font-sans italic">Belum ada pengeluaran dicatatkan pada periode ini.</td>
                                </tr>
                              ) : (
                                expenses.map(e => (
                                  <tr key={e.id} className="hover:bg-[#fbfbfb]">
                                    <td className="py-2.5 text-zinc-500">{e.date}</td>
                                    <td className="py-2.5"><span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-650 rounded-none text-[9px] font-sans font-bold">{e.category}</span></td>
                                    <td className="py-2.5 text-zinc-700">{e.desc}</td>
                                    <td className="py-2.5 text-right font-bold text-rose-500">-{formatRupiah(e.amount)}</td>
                                    <td className="py-2.5 text-center">
                                      <button onClick={() => handleDeleteExpense(e.id)} className="text-zinc-400 hover:text-rose-500">
                                        <X size={12} />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right side form block & ringkasan laba rugi */}
                      <div className="lg:col-span-4 space-y-6">
                        
                        {/* Transaction add form */}
                        <form onSubmit={handleAddExpense} className="bg-white border border-zinc-200 p-6 shadow-sm rounded-none">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 mb-4 pb-2 border-b">+ Catat Pengeluaran</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[10px] text-zinc-400 font-mono uppercase mb-1">Kategori</label>
                              <select 
                                value={expenseCategory}
                                onChange={(e) => setExpenseCategory(e.target.value)}
                                className="w-full text-xs font-sans p-2 border border-zinc-250 bg-[#fafafa]"
                              >
                                <option value="Operasional">Operasional (Listrik, Air)</option>
                                <option value="Perlengkapan">Perlengkapan Studio</option>
                                <option value="Sewa">Sewa / Gedung</option>
                                <option value="Gaji">Gaji / Honor Tim</option>
                                <option value="Marketing">Marketing & Ads</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] text-zinc-400 font-mono uppercase mb-1">Keterangan / Memo</label>
                              <input 
                                type="text"
                                value={expenseDesc}
                                onChange={(e) => setExpenseDesc(e.target.value)}
                                placeholder="e.g. beli filter lighting"
                                className="w-full text-xs font-sans p-2 border border-zinc-350 bg-[#fafafa]"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-zinc-400 font-mono uppercase mb-1">Jumlah Pengeluaran (Rp)</label>
                              <input
                                type="number"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                placeholder="50000"
                                className="w-full text-xs font-mono p-2 border border-zinc-350 bg-[#fafafa]"
                              />
                            </div>

                            <button 
                              type="submit"
                              className="w-full py-2.5 bg-zinc-900 border hover:bg-zinc-800 text-white font-mono text-xs font-bold rounded-none"
                            >
                              Catat Pengeluaran
                            </button>
                          </div>
                        </form>

                        {/* Balance sheet P&L */}
                        <div className="bg-zinc-900 border border-zinc-850 p-6 text-white rounded-none">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#10B981] mb-4">Ringkasan Laba Rugi</h4>
                          
                          <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between">
                              <span className="text-zinc-450 text-[11px]">Total Pendapatan:</span>
                              <span className="text-emerald-400">{formatRupiah(reportSummary.totalPemasukan)}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                              <span className="text-zinc-450 text-[11px]">Total Pengeluaran:</span>
                              <span className="text-rose-400">-{formatRupiah(reportSummary.totalPengeluaran)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 font-sans font-bold text-sm">
                              <span className="text-zinc-200">Laba Bersih:</span>
                              <span className={reportSummary.labaBersih >= 0 ? "text-emerald-400 text-base" : "text-rose-400 text-base"}>
                                {formatRupiah(reportSummary.labaBersih)}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            )}

            {/* VIEW 6: STUDIO SETTINGS */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white border border-zinc-200 p-6 shadow-sm rounded-none">
                  
                  {/* Action submit row */}
                  <div className="flex justify-between items-center mb-8 pb-3 border-b">
                    <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-700">Form Pengaturan Profil & Kontak</h3>
                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-white font-mono text-xs font-bold tracking-wider rounded-none uppercase flex items-center gap-1.5"
                    >
                      <Save size={13} />
                      Simpan Perubahan
                    </button>
                  </div>

                  {/* Form inputs layouts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-medium">
                    
                    {/* Column Left: Studio Profile */}
                    <div className="space-y-5">
                      <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-4">Profil Studio</h4>
                      
                      <div>
                        <label className="block text-zinc-500 mb-1.5">Nama Studio Foto</label>
                        <input
                          type="text"
                          value={settingsPayload.studioName}
                          onChange={(e) => setSettingsPayload({ ...settingsPayload, studioName: e.target.value })}
                          className="w-full text-zinc-800 p-3 border border-zinc-250 bg-[#fafafa]"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 mb-1.5">Deskripsi Singkat Studio</label>
                        <textarea
                          rows={3}
                          value={settingsPayload.studioDesc}
                          onChange={(e) => setSettingsPayload({ ...settingsPayload, studioDesc: e.target.value })}
                          className="w-full text-zinc-800 p-3 border border-zinc-250 bg-[#fafafa]"
                        />
                      </div>

                      {/* Payment gateway bank setup */}
                      <div className="pt-6 border-t border-dashed border-zinc-200">
                        <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-4">Konfigurasi Pembayaran (WhatsApp Info)</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-500 mb-1.5">Nama Bank / E-Wallet</label>
                            <input
                              type="text"
                              value={settingsPayload.paymentBank}
                              onChange={(e) => setSettingsPayload({ ...settingsPayload, paymentBank: e.target.value })}
                              className="w-full text-zinc-800 p-3 border border-zinc-250 bg-[#fafafa]"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-500 mb-1.5">No. Rekening / No. HP</label>
                            <input
                              type="text"
                              value={settingsPayload.paymentAccount}
                              onChange={(e) => setSettingsPayload({ ...settingsPayload, paymentAccount: e.target.value })}
                              className="w-full text-zinc-850 p-3 border border-zinc-250 bg-[#fafafa]"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-zinc-500 mb-1.5">Atas Nama Pemilik (A.N)</label>
                          <input
                            type="text"
                            value={settingsPayload.paymentName}
                            onChange={(e) => setSettingsPayload({ ...settingsPayload, paymentName: e.target.value })}
                            className="w-full text-zinc-800 p-3 border border-zinc-250 bg-[#fafafa]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Column Right: Contact info */}
                    <div className="space-y-5">
                      <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-4">Informasi Kontak & Sosial</h4>
                      
                      <div>
                        <label className="block text-zinc-500 mb-1.5">Nomor WhatsApp / Hotline</label>
                        <input
                          type="text"
                          value={settingsPayload.whatsapp}
                          onChange={(e) => setSettingsPayload({ ...settingsPayload, whatsapp: e.target.value })}
                          className="w-full text-zinc-800 p-3 border border-zinc-250 bg-[#fafafa] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 mb-1.5">Alamat Email Bisnis</label>
                        <input
                          type="email"
                          value={settingsPayload.email}
                          onChange={(e) => setSettingsPayload({ ...settingsPayload, email: e.target.value })}
                          className="w-full text-zinc-805 p-3 border border-zinc-250 bg-[#fafafa] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 mb-1.5">Akun Twitter / Instagram Link</label>
                        <input
                          type="text"
                          value={settingsPayload.instagram}
                          onChange={(e) => setSettingsPayload({ ...settingsPayload, instagram: e.target.value })}
                          className="w-full text-zinc-805 p-3 border border-zinc-250 bg-[#fafafa] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 mb-1.5">Alamat Lengkap Studio</label>
                        <textarea
                          rows={3}
                          value={settingsPayload.address}
                          onChange={(e) => setSettingsPayload({ ...settingsPayload, address: e.target.value })}
                          className="w-full text-zinc-800 p-3 border border-zinc-250 bg-[#fafafa]"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>
      </main>

      {/* MODAL 1: ADD / EDIT PACKAGE MODAL */}
      <AnimatePresence>
        {pkgModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white p-6 max-w-lg w-full rounded-none shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b pb-3 mb-6">
                <h3 className="text-sm font-bold font-mono uppercase text-zinc-800">
                  {selectedPkg ? "Edit Paket Fotografi" : "Tambah Paket Seni Baru"}
                </h3>
                <button onClick={() => setPkgModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-zinc-450 mb-1 select-none">Nama Paket</label>
                  <input
                    type="text"
                    value={pkgPayload.name}
                    onChange={(e) => setPkgPayload({ ...pkgPayload, name: e.target.value })}
                    className="w-full p-2.5 border border-zinc-250 text-xs bg-zinc-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-450 mb-1 select-none">Harga Sesi (IDR)</label>
                    <input
                      type="number"
                      value={pkgPayload.price}
                      onChange={(e) => setPkgPayload({ ...pkgPayload, price: Number(e.target.value) })}
                      className="w-full p-2.5 border border-zinc-250 text-xs font-mono bg-zinc-50/50"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-450 mb-1 select-none">Durasi Sesi</label>
                    <input
                      type="text"
                      value={pkgPayload.duration}
                      onChange={(e) => setPkgPayload({ ...pkgPayload, duration: e.target.value })}
                      className="w-full p-2.5 border border-zinc-250 text-xs bg-zinc-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-450 mb-1 select-none">Deskripsi Sesi</label>
                  <textarea
                    rows={2}
                    value={pkgPayload.desc}
                    onChange={(e) => setPkgPayload({ ...pkgPayload, desc: e.target.value })}
                    className="w-full p-2.5 border border-zinc-250 text-xs bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="block text-zinc-450 mb-1 select-none">Inklusi Layanan (Satu Per Baris)</label>
                  <textarea
                    rows={4}
                    value={pkgPayload.inclusions}
                    onChange={(e) => setPkgPayload({ ...pkgPayload, inclusions: e.target.value })}
                    className="w-full p-2.5 border border-zinc-250 text-xs font-sans bg-zinc-50/50"
                  />
                </div>

                <div className="flex items-center gap-6 py-2 border-t border-dashed">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkgPayload.popular}
                      onChange={(e) => setPkgPayload({ ...pkgPayload, popular: e.target.checked })}
                      className="border-zinc-350 bg-zinc-100"
                    />
                    <span>Recomended (Paling Populer)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pkgPayload.active}
                      onChange={(e) => setPkgPayload({ ...pkgPayload, active: e.target.checked })}
                      className="border-zinc-350 bg-zinc-100"
                    />
                    <span>Aktif (Tampilkan di web)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => setPkgModalOpen(false)}
                    className="px-4 py-2 border text-zinc-500 font-mono text-xs font-bold hover:bg-zinc-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSavePackage}
                    className="px-6 py-2 bg-zinc-950 text-white font-mono text-xs font-bold hover:bg-zinc-900"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD / EDIT ADDON MODAL */}
      <AnimatePresence>
        {addonModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white p-6 max-w-sm w-full rounded-none shadow-2xl"
            >
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <h3 className="text-sm font-bold font-mono uppercase text-zinc-800">
                  {selectedAddon ? "Edit Add-on Layanan" : "Tambah Add-on Baru"}
                </h3>
                <button onClick={() => setAddonModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-zinc-450 mb-1 select-none">Nama Addon</label>
                  <input
                    type="text"
                    value={addonPayload.name}
                    onChange={(e) => setAddonPayload({ ...addonPayload, name: e.target.value })}
                    className="w-full p-2.5 border border-zinc-250 text-xs bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="block text-zinc-450 mb-1 select-none">Tarif Layanan (IDR)</label>
                  <input
                    type="number"
                    value={addonPayload.price}
                    onChange={(e) => setAddonPayload({ ...addonPayload, price: Number(e.target.value) })}
                    className="w-full p-2.5 border border-zinc-250 text-xs font-mono bg-zinc-50/50"
                  />
                </div>

                <div>
                  <label className="block text-zinc-450 mb-1 select-none">Deskripsi Addon</label>
                  <input
                    type="text"
                    value={addonPayload.desc}
                    onChange={(e) => setAddonPayload({ ...addonPayload, desc: e.target.value })}
                    className="w-full p-2.5 border border-zinc-250 text-xs bg-zinc-50/50"
                  />
                </div>

                <div className="flex items-center gap-2 py-2 border-t">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addonPayload.active}
                      onChange={(e) => setAddonPayload({ ...addonPayload, active: e.target.checked })}
                      className="border-zinc-350 bg-zinc-100"
                    />
                    <span>Aktif (Tampilkan di form pesanan)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    onClick={() => setAddonModalOpen(false)}
                    className="px-4 py-2 border text-zinc-500 font-mono text-xs font-bold hover:bg-zinc-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveAddon}
                    className="px-6 py-2 bg-zinc-950 text-white font-mono text-xs font-bold hover:bg-zinc-900"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
