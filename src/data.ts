/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhotoPackage, AddonOption } from "./types";

export const PACKAGES: PhotoPackage[] = [
  {
    id: "portrait-solo",
    name: "Paket Portrait Solo",
    price: 450000,
    duration: "45 Menit",
    desc: "Sesi foto personal studio untuk kebutuhan profil, CV, portfolio model, atau kenang-kenangan individu.",
    inclusions: [
      "1 Orang (Solo)",
      "5 Foto Retouch Premium (.JPG)",
      "Semua File Mentah (RAW/Original) via Google Drive Link",
      "1 Lembar Cetakan Fisik Ukuran 4R",
      "Pilihan Background Minimalis"
    ]
  },
  {
    id: "couple-group",
    name: "Paket Couple & Group",
    price: 750000,
    duration: "1 Jam",
    desc: "Sesi foto hangat bersama pasangan, lingkaran sahabat, wisuda kecil, atau keluarga terdekat.",
    inclusions: [
      "Maksimal 4 Orang (bisa ditambah)",
      "10 Foto Retouch Premium (.JPG)",
      "Semua File Mentah (RAW/Original) via Google Drive Link",
      "2 Lembar Cetakan Fisik Ukuran 4R",
      "Pilihan 2 Warna Background (Backdrop)",
      "Bisa Ganti 1x Kostum Pribadi"
    ],
    popular: true
  },
  {
    id: "wisuda-graduation",
    name: "Paket Wisuda Premium",
    price: 850000,
    duration: "1 Jam",
    desc: "Rayakan momen kelulusan dan pencapaian akademik berharga Anda bersama keluarga dengan cetakan berbingkai kayu.",
    inclusions: [
      "Maksimal 5 Orang (Termasuk Orang Tua)",
      "12 Foto Retouch Premium (.JPG)",
      "Cetak 1 Foto Ukuran 10R + Bingkai Premium",
      "Semua File Mentah (RAW/Original) via Google Drive Link",
      "Aksesoris Wisuda Lengkap (Toga palsu, boneka kelulusan, buku dummy)",
      "Pilihan Backdrop Wisuda Mewah"
    ]
  },
  {
    id: "editorial-product",
    name: "Paket Brand / Product / Editorial",
    price: 1500000,
    duration: "2 Jam",
    desc: "Suhu studio profesional untuk katalog produk, fashion lookbook brand lokal, portrait bisnis, atau komersial.",
    inclusions: [
      "Penggunaan Studio Eksklusif & Professional Lighting Set",
      "20 Foto Hasil Retouch Editorial",
      "Asistensi Moodboard & Penataan Gaya",
      "Penyerahan File Maksimal 3 Hari Kerja",
      "Bisa Mengirimkan Produk ke Studio (Sistem Drop-off)"
    ]
  }
];

export const ADDONS: AddonOption[] = [
  {
    id: "mua-pro",
    name: "Professional Makeup Artist (MUA)",
    price: 250000,
    desc: "Make-up & hair styling eksklusif di tempat dari tim MUA rekanan studiobook sebelum foto dimulai."
  },
  {
    id: "extra-print-10r",
    name: "Cetak Tambahan + Bingkai Minimalis 10R",
    price: 100000,
    desc: "Cetak 1 foto retouch pilihan Anda berukuran 10R lengkap dengan bingkai kayu modern berkualitas tinggi."
  },
  {
    id: "extra-person",
    name: "Penambahan Orang (Per Orang)",
    price: 50000,
    desc: "Berlaku untuk Paket Couple/Wisuda apabila peserta melebihi ketentuan reguler."
  },
  {
    id: "express-service",
    name: "Layanan Ekspres (Selesai 1 Hari)",
    price: 150000,
    desc: "Proses editing, retouching, dan pengunggahan file selesai dalam waktu 24 jam setelah sesi foto."
  }
];

export interface PortfolioItem {
  id: string;
  category: "Portrait" | "Couple / Group" | "Wisuda" | "Product / Brand";
  title: string;
  imageUrl: string;
}

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: "p1",
    category: "Portrait",
    title: "Minimalist Soft Portrait",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "p2",
    category: "Portrait",
    title: "Chiaroscuro Mens Look",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c1",
    category: "Couple / Group",
    title: "Golden Vintage Pre-Wedding",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "w1",
    category: "Wisuda",
    title: "Joyful Graduation Moment",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "pr1",
    category: "Product / Brand",
    title: "Organic Skincare Bottle",
    imageUrl: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "pr2",
    category: "Product / Brand",
    title: "Luxury Leather Watch Shoot",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "c2",
    category: "Couple / Group",
    title: "Intimate Couple Studio",
    imageUrl: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "p3",
    category: "Portrait",
    title: "High Fashion Editorial portrait",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800"
  }
];

export const TIME_SLOTS: string[] = [
  "09:00 - 10:00",
  "10:15 - 11:15",
  "11:30 - 12:30",
  "13:30 - 14:30",
  "14:45 - 15:45",
  "16:00 - 17:00",
  "18:30 - 19:30",
  "19:45 - 20:45"
];
