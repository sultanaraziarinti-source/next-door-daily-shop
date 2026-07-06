export interface Product {
  id: number;
  name: string;
  category: "household" | "kids" | "decoration";
  emoji: string;
  price: number;
  oldPrice: number | null;
  badge: "popular" | "sale" | "new" | null;
  image?: string; // optional uploaded image (data URL) for admin-added items
}

export interface CartItem extends Product {
  qty: number;
}

export interface User {
  name: string;
  email: string;
  initials: string;
}
