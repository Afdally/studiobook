/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PhotoPackage {
  id: string;
  name: string;
  price: number;
  duration: string; // e.g., "1 Jam"
  desc: string;
  inclusions: string[];
  popular?: boolean;
  active?: boolean;
  imageUrl?: string;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
  desc: string;
  active?: boolean;
}

export interface BookingDetails {
  packageId: string;
  selectedAddons: string[]; // Addon IDs
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  fullName: string;
  email: string;
  phone: string; // WhatsApp number
}
