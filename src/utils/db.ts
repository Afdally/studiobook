/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhotoPackage, AddonOption } from "../types";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  updateDoc 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

export interface DBBooking {
  id: string;
  packageId: string;
  selectedAddons: string[];
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 - 10:45"
  fullName: string;
  email: string;
  phone: string;
  total: number;
  status: "LUNAS" | "PENDING" | "BATAL";
  createdAt: string;
}

export interface DaySchedule {
  active: boolean;
  start: string; // HH:MM
  end: string;   // HH:MM
  duration: number; // minutes
}

export interface SlotSettings {
  operational: {
    [key: string]: DaySchedule;
  };
  blockedDates: string[]; // YYYY-MM-DD
  blockedSlots: { [date: string]: string[] }; // { '2026-05-28': ['10:00 - 10:45'] }
}

export interface StudioSettings {
  studioName: string;
  studioDesc: string;
  paymentBank: string;
  paymentAccount: string;
  paymentName: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  desc: string;
  amount: number;
}

// Initial Packages seeded from screenshots
const DEFAULT_PACKAGES: PhotoPackage[] = [
  {
    id: "portrait-solo",
    name: "Solo Session",
    price: 125000,
    duration: "30 Menit",
    desc: "Sesi 30 menit penuh di dalam studio. Semua hasil foto dikirim dalam format digital. Background pilihan.",
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
    name: "Duo Frame",
    price: 185000,
    duration: "45 Menit",
    desc: "Paling populer untuk couple & best-friend. 45 menit sesi studio eksklusif. Semua hasil foto + 1 background.",
    inclusions: [
      "Maksimal 2 Orang",
      "8 Foto Retouch Premium (.JPG)",
      "Semua File Mentah (RAW/Original) via Google Drive Link",
      "2 Lembar Cetakan Fisik Ukuran 4R",
      "Pilihan Backdrop Studio"
    ],
    popular: true
  },
  {
    id: "wisuda-graduation",
    name: "Squad Session",
    price: 265000,
    duration: "60 Menit",
    desc: "Cocok untuk grup hingga 4 orang. 60 menit penuh sesi studio tanpa tambahan biaya. Semua hasil foto dikirim.",
    inclusions: [
      "Maksimal 4 Orang",
      "12 Foto Retouch Premium (.JPG)",
      "Semua File Mentah (RAW/Original) via Google Drive Link",
      "Cetak Foto Ukuran 10R",
      "Pilihan Backdrop Studio"
    ]
  },
  {
    id: "editorial-product",
    name: "Family Edition",
    price: 425000,
    duration: "90 Menit",
    desc: "Hingga 8 anggota keluarga dalam satu sesi. 90 menit sesi studio + gratis konsultasi pose. Termasuk cetakan.",
    inclusions: [
      "Maksimal 8 Orang",
      "20 Foto Hasil Retouch Premium",
      "Semua File Mentah (RAW/Original) via Google Drive Link",
      "Cetak Foto Ukuran 10R + Bingkai Minimalis",
      "Sesi Foto Santai & Homey"
    ]
  }
];

// Initial Addons seeded from screenshots
const DEFAULT_ADDONS: AddonOption[] = [
  {
    id: "extra-print-4r",
    name: "Cetak foto tambahan",
    price: 50000,
    desc: "4 lembar ukuran 4R"
  },
  {
    id: "bg-backdrop",
    name: "Background extra",
    price: 75000,
    desc: "1 background tambahan pilihan"
  },
  {
    id: "extra-time",
    name: "Extra waktu",
    price: 100000,
    desc: "Tambah 30 menit sesi"
  },
  {
    id: "mua-pro",
    name: "Makeup artist",
    price: 150000,
    desc: "Touch up profesional"
  }
];

// Initial Bookings seeded from screenshots
const DEFAULT_BOOKINGS: DBBooking[] = [
  {
    id: "BK-2041",
    packageId: "portrait-solo",
    selectedAddons: ["bg-backdrop"],
    date: "2026-04-24",
    timeSlot: "10:00 - 10:45",
    fullName: "Anindya Paramita",
    email: "anindya@mail.com",
    phone: "+62 812-3344-1290",
    total: 200000,
    status: "LUNAS",
    createdAt: "2026-04-20T10:00:00Z"
  },
  {
    id: "BK-2040",
    packageId: "couple-group",
    selectedAddons: ["mua-pro", "extra-print-4r"],
    date: "2026-04-25",
    timeSlot: "11:00 - 11:45",
    fullName: "Reza Darmawan",
    email: "reza@mail.com",
    phone: "+62 813-9900-4422",
    total: 360000,
    status: "LUNAS",
    createdAt: "2026-04-21T11:00:00Z"
  },
  {
    id: "BK-2039",
    packageId: "editorial-product",
    selectedAddons: [],
    date: "2026-04-26",
    timeSlot: "13:00 - 13:45",
    fullName: "Maria & Kevin",
    email: "maria.kevin@mail.com",
    phone: "+62 877-1122-3344",
    total: 425000,
    status: "PENDING",
    createdAt: "2026-04-22T13:00:00Z"
  },
  {
    id: "BK-2038",
    packageId: "couple-group",
    selectedAddons: ["bg-backdrop"],
    date: "2026-04-27",
    timeSlot: "14:00 - 14:45",
    fullName: "Dimas Prasetyo",
    email: "dimas@mail.com",
    phone: "+62 811-5566-7788",
    total: 260000,
    status: "LUNAS",
    createdAt: "2026-04-23T14:00:00Z"
  }
];

// Initial default operational slot schedules
const DEFAULT_SLOT_SETTINGS: SlotSettings = {
  operational: {
    "Senin": { active: true, start: "10:00", end: "22:00", duration: 45 },
    "Selasa": { active: true, start: "10:00", end: "22:00", duration: 45 },
    "Rabu": { active: true, start: "10:00", end: "22:00", duration: 45 },
    "Kamis": { active: true, start: "10:00", end: "22:00", duration: 45 },
    "Jumat": { active: true, start: "10:00", end: "23:00", duration: 45 },
    "Sabtu": { active: true, start: "10:00", end: "23:00", duration: 45 },
    "Minggu": { active: true, start: "10:00", end: "23:00", duration: 45 }
  },
  blockedDates: [],
  blockedSlots: {}
};

// Initial default studio profile settings
const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  studioName: "StudioBook Jakarta",
  studioDesc: "Studio foto profesional dengan konsep minimalis modern.",
  paymentBank: "BCA",
  paymentAccount: "1234567890",
  paymentName: "PT Studio Foto Jaya",
  whatsapp: "+62 812-3456-7890",
  email: "hello@studiobook.co.id",
  instagram: "@studiobook.jkt",
  address: "Jl. Senopati No. 42, Jakarta Selatan"
};

// Initial default expenses
const DEFAULT_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    date: "2026-04-24",
    category: "Operasional",
    desc: "Listrik studio bulanan",
    amount: 450000
  },
  {
    id: "exp-2",
    date: "2026-04-26",
    category: "Perlengkapan",
    desc: "Kertas cetak foto 4R isi 200 lembar",
    amount: 150000
  }
];

// --- FIREBASE APP INITIALIZATION ---
const app = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// --- ERROR HANDLING PRIMITIVE ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Local Storage Wrappers
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading localStorage key", key, error);
    return defaultValue;
  }
};

const setToStorage = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error writing localStorage key", key, error);
  }
};

const notifyListeners = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("sb_db_changed"));
  }
};

// Bootstrap standard DB initially in LocalStorage if absolutely empty
export const initializeDB = (force = false) => {
  if (typeof window === "undefined") return;
  if (force || !localStorage.getItem("sb_initialized")) {
    setToStorage("sb_packages", DEFAULT_PACKAGES);
    setToStorage("sb_addons", DEFAULT_ADDONS);
    setToStorage("sb_bookings", DEFAULT_BOOKINGS);
    setToStorage("sb_slots", DEFAULT_SLOT_SETTINGS);
    setToStorage("sb_settings", DEFAULT_STUDIO_SETTINGS);
    setToStorage("sb_expenses", DEFAULT_EXPENSES);
    localStorage.setItem("sb_initialized", "true");
  }
};

// Seeding locks to prevent races
const isSeeding = {
  packages: false,
  addons: false,
  bookings: false,
  expenses: false,
  settings: false
};

// Sync real-time Firestore collections to LocalStorage
function setupFirestoreSync() {
  // 1. Packages
  const colPackages = collection(firestoreDb, "packages");
  onSnapshot(colPackages, (snapshot) => {
    if (snapshot.empty) {
      if (!isSeeding.packages) {
        isSeeding.packages = true;
        DEFAULT_PACKAGES.forEach(pkg => {
          setDoc(doc(colPackages, pkg.id), pkg).catch(err => {
            handleFirestoreError(err, OperationType.CREATE, `packages/${pkg.id}`);
          });
        });
      }
    } else {
      const list: PhotoPackage[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as PhotoPackage);
      });
      setToStorage("sb_packages", list);
      notifyListeners();
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, "packages");
  });

  // 2. Addons
  const colAddons = collection(firestoreDb, "addons");
  onSnapshot(colAddons, (snapshot) => {
    if (snapshot.empty) {
      if (!isSeeding.addons) {
        isSeeding.addons = true;
        DEFAULT_ADDONS.forEach(addon => {
          setDoc(doc(colAddons, addon.id), addon).catch(err => {
            handleFirestoreError(err, OperationType.CREATE, `addons/${addon.id}`);
          });
        });
      }
    } else {
      const list: AddonOption[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as AddonOption);
      });
      setToStorage("sb_addons", list);
      notifyListeners();
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, "addons");
  });

  // 3. Bookings
  const colBookings = collection(firestoreDb, "bookings");
  onSnapshot(colBookings, (snapshot) => {
    if (snapshot.empty) {
      if (!isSeeding.bookings) {
        isSeeding.bookings = true;
        DEFAULT_BOOKINGS.forEach(b => {
          setDoc(doc(colBookings, b.id), b).catch(err => {
            handleFirestoreError(err, OperationType.CREATE, `bookings/${b.id}`);
          });
        });
      }
    } else {
      const list: DBBooking[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as DBBooking);
      });
      setToStorage("sb_bookings", list);
      notifyListeners();
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, "bookings");
  });

  // 4. Expenses
  const colExpenses = collection(firestoreDb, "expenses");
  onSnapshot(colExpenses, (snapshot) => {
    if (snapshot.empty) {
      if (!isSeeding.expenses) {
        isSeeding.expenses = true;
        DEFAULT_EXPENSES.forEach(e => {
          setDoc(doc(colExpenses, e.id), e).catch(err => {
            handleFirestoreError(err, OperationType.CREATE, `expenses/${e.id}`);
          });
        });
      }
    } else {
      const list: Expense[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as Expense);
      });
      setToStorage("sb_expenses", list);
      notifyListeners();
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, "expenses");
  });

  // 5. Settings -> Document: Slots
  const docSlots = doc(firestoreDb, "settings", "slots");
  onSnapshot(docSlots, (docSnap) => {
    if (!docSnap.exists()) {
      setDoc(docSlots, DEFAULT_SLOT_SETTINGS).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, "settings/slots");
      });
    } else {
      setToStorage("sb_slots", docSnap.data() as SlotSettings);
      notifyListeners();
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, "settings/slots");
  });

  // 6. Settings -> Document: Studio
  const docStudio = doc(firestoreDb, "settings", "studio");
  onSnapshot(docStudio, (docSnap) => {
    if (!docSnap.exists()) {
      setDoc(docStudio, DEFAULT_STUDIO_SETTINGS).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, "settings/studio");
      });
    } else {
      setToStorage("sb_settings", docSnap.data() as StudioSettings);
      notifyListeners();
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, "settings/studio");
  });
}

// Background login and sync initialization
if (typeof window !== "undefined") {
  initializeDB();
  signInAnonymously(auth).then(() => {
    setupFirestoreSync();
  }).catch(err => {
    console.error("Firebase auth initialization failed", err);
  });
}

export const db = {
  // Packages CRUD
  getPackages: (): PhotoPackage[] => {
    return getFromStorage<PhotoPackage[]>("sb_packages", DEFAULT_PACKAGES);
  },
  savePackages: (pkgs: PhotoPackage[]) => {
    setToStorage("sb_packages", pkgs);
    pkgs.forEach(pkg => {
      setDoc(doc(firestoreDb, "packages", pkg.id), pkg).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `packages/${pkg.id}`);
      });
    });
  },
  addPackage: (pkg: Omit<PhotoPackage, "id">): PhotoPackage => {
    const pkgs = db.getPackages();
    const id = `pkg-${Date.now()}`;
    const newPkg = { ...pkg, id };
    pkgs.push(newPkg);
    setToStorage("sb_packages", pkgs);
    setDoc(doc(firestoreDb, "packages", id), newPkg).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `packages/${id}`);
    });
    return newPkg;
  },
  updatePackage: (id: string, updated: Partial<PhotoPackage>) => {
    const pkgs = db.getPackages();
    const index = pkgs.findIndex(p => p.id === id);
    if (index !== -1) {
      const newPkg = { ...pkgs[index], ...updated };
      pkgs[index] = newPkg;
      setToStorage("sb_packages", pkgs);
      setDoc(doc(firestoreDb, "packages", id), newPkg).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `packages/${id}`);
      });
    }
  },
  deletePackage: (id: string) => {
    const pkgs = db.getPackages();
    const filtered = pkgs.filter(p => p.id !== id);
    setToStorage("sb_packages", filtered);
    deleteDoc(doc(firestoreDb, "packages", id)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `packages/${id}`);
    });
  },

  // Addons CRUD
  getAddons: (): AddonOption[] => {
    return getFromStorage<AddonOption[]>("sb_addons", DEFAULT_ADDONS);
  },
  saveAddons: (addons: AddonOption[]) => {
    setToStorage("sb_addons", addons);
    addons.forEach(addon => {
      setDoc(doc(firestoreDb, "addons", addon.id), addon).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `addons/${addon.id}`);
      });
    });
  },
  addAddon: (addon: Omit<AddonOption, "id">): AddonOption => {
    const addons = db.getAddons();
    const id = `addon-${Date.now()}`;
    const newAddon = { ...addon, id };
    addons.push(newAddon);
    setToStorage("sb_addons", addons);
    setDoc(doc(firestoreDb, "addons", id), newAddon).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `addons/${id}`);
    });
    return newAddon;
  },
  updateAddon: (id: string, updated: Partial<AddonOption>) => {
    const addons = db.getAddons();
    const index = addons.findIndex(a => a.id === id);
    if (index !== -1) {
      const newAddon = { ...addons[index], ...updated };
      addons[index] = newAddon;
      setToStorage("sb_addons", addons);
      setDoc(doc(firestoreDb, "addons", id), newAddon).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `addons/${id}`);
      });
    }
  },
  deleteAddon: (id: string) => {
    const addons = db.getAddons();
    const filtered = addons.filter(a => a.id !== id);
    setToStorage("sb_addons", filtered);
    deleteDoc(doc(firestoreDb, "addons", id)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `addons/${id}`);
    });
  },

  // Bookings CRUD
  getBookings: (): DBBooking[] => {
    const bookings = getFromStorage<DBBooking[]>("sb_bookings", DEFAULT_BOOKINGS);
    return bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  saveBookings: (bookings: DBBooking[]) => {
    setToStorage("sb_bookings", bookings);
    bookings.forEach(b => {
      setDoc(doc(firestoreDb, "bookings", b.id), b).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `bookings/${b.id}`);
      });
    });
  },
  addBooking: (booking: Omit<DBBooking, "id" | "createdAt">): DBBooking => {
    const bookings = db.getBookings();
    const prefix = "BK";
    const num = Math.floor(2000 + Math.random() * 8000);
    const id = `${prefix}-${num}`;
    const newBooking: DBBooking = {
      ...booking,
      id,
      createdAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    setToStorage("sb_bookings", bookings);
    setDoc(doc(firestoreDb, "bookings", id), newBooking).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `bookings/${id}`);
    });
    return newBooking;
  },
  updateBookingStatus: (id: string, status: "LUNAS" | "PENDING" | "BATAL") => {
    const bookings = db.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings[index].status = status;
      setToStorage("sb_bookings", bookings);
      updateDoc(doc(firestoreDb, "bookings", id), { status }).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `bookings/${id}`);
      });
    }
  },
  deleteBooking: (id: string) => {
    const bookings = db.getBookings();
    const filtered = bookings.filter(b => b.id !== id);
    setToStorage("sb_bookings", filtered);
    deleteDoc(doc(firestoreDb, "bookings", id)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `bookings/${id}`);
    });
  },

  // Slots operational rules CRUD
  getSlotsSettings: (): SlotSettings => {
    return getFromStorage<SlotSettings>("sb_slots", DEFAULT_SLOT_SETTINGS);
  },
  updateSlotsSettings: (settings: SlotSettings) => {
    setToStorage("sb_slots", settings);
    setDoc(doc(firestoreDb, "settings", "slots"), settings).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, "settings/slots");
    });
  },

  // Studio profile metadata CRUD
  getSettings: (): StudioSettings => {
    return getFromStorage<StudioSettings>("sb_settings", DEFAULT_STUDIO_SETTINGS);
  },
  updateSettings: (settings: StudioSettings) => {
    setToStorage("sb_settings", settings);
    setDoc(doc(firestoreDb, "settings", "studio"), settings).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, "settings/studio");
    });
  },

  // Expenses CRUD
  getExpenses: (): Expense[] => {
    return getFromStorage<Expense[]>("sb_expenses", DEFAULT_EXPENSES);
  },
  addExpense: (exp: Omit<Expense, "id">): Expense => {
    const expenses = db.getExpenses();
    const id = `exp-${Date.now()}`;
    const newExp = { ...exp, id };
    expenses.push(newExp);
    setToStorage("sb_expenses", expenses);
    setDoc(doc(firestoreDb, "expenses", id), newExp).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `expenses/${id}`);
    });
    return newExp;
  },
  deleteExpense: (id: string) => {
    const expenses = db.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    setToStorage("sb_expenses", filtered);
    deleteDoc(doc(firestoreDb, "expenses", id)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `expenses/${id}`);
    });
  }
};
