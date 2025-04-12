import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "PP");
}

export function formatDateTime(date: Date | string) {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "PPp");
}

export function formatTimeAgo(date: Date | string) {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatCrypto(amount: number, symbol = "ETH") {
  return `${amount.toFixed(6)} ${symbol}`;
}

export function truncateText(text: string, maxLength = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getInitials(name: string) {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateAvatar(name: string, size = 40) {
  const initials = getInitials(name);
  const colors = [
    "#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#34495e",
    "#16a085", "#27ae60", "#2980b9", "#8e44ad", "#2c3e50",
    "#f1c40f", "#e67e22", "#e74c3c", "#ecf0f1", "#95a5a6",
    "#f39c12", "#d35400", "#c0392b", "#bdc3c7", "#7f8c8d"
  ];

  // Generate a consistent color based on the name
  const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const color = colors[charCodeSum % colors.length];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${color.replace("#", "")}&color=fff`;
}

export function getImagePlaceholder(type: "skin" | "avatar" | "item" | "glider" | "pickaxe" | "weapon" | "character" | string = "item") {
  const placeholders = {
    skin: "https://placehold.co/400x600/41148c/FFFFFF?text=Fortnite+Skin",
    avatar: "https://placehold.co/200x200/41148c/FFFFFF?text=Avatar",
    item: "https://placehold.co/300x300/41148c/FFFFFF?text=Fortnite+Item",
    glider: "https://placehold.co/400x300/41148c/FFFFFF?text=Fortnite+Glider",
    pickaxe: "https://placehold.co/300x500/41148c/FFFFFF?text=Fortnite+Pickaxe",
    weapon: "https://placehold.co/300x300/41148c/FFFFFF?text=Fortnite+Weapon",
    character: "https://placehold.co/400x600/41148c/FFFFFF?text=Fortnite+Character",
  };

  return placeholders[type] || "https://placehold.co/300x300/41148c/FFFFFF?text=Fortnite+Item";
}

export function getRarityColor(rarity: string) {
  // First check for Tailwind class colors
  const tailwindColors: Record<string, string> = {
    COMMON: "bg-gray-500 text-white",
    UNCOMMON: "bg-green-500 text-white",
    RARE: "bg-blue-500 text-white",
    EPIC: "bg-purple-500 text-white",
    LEGENDARY: "bg-amber-500 text-white",
    MYTHIC: "bg-rose-500 text-white",
  };

  // If it's a CSS property, use hexadecimal values instead
  const hexColors: Record<string, string> = {
    common: "#9d9d9d",
    uncommon: "#1eff00",
    rare: "#0070dd",
    epic: "#a335ee",
    legendary: "#ff8000",
    mythic: "#e268a8",
  };

  // Check for lowercase version for hex colors
  const lowerRarity = rarity.toLowerCase();
  if (hexColors[lowerRarity]) {
    return hexColors[lowerRarity];
  }

  // Check for uppercase version for tailwind classes
  const upperRarity = rarity.toUpperCase();
  if (tailwindColors[upperRarity]) {
    return tailwindColors[upperRarity];
  }

  // Default fallback
  return tailwindColors.COMMON;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    AVAILABLE: "bg-green-500 text-white",
    PENDING: "bg-amber-500 text-white",
    SOLD: "bg-gray-500 text-white",
    DELETED: "bg-red-500 text-white",
    PAID: "bg-blue-500 text-white",
    IN_ESCROW: "bg-purple-500 text-white",
    COMPLETED: "bg-emerald-500 text-white",
    CANCELLED: "bg-rose-500 text-white",
    DISPUTED: "bg-red-500 text-white",
    REFUNDED: "bg-cyan-500 text-white",
  };

  return colors[status] || "bg-gray-500 text-white";
}
