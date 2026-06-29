export interface Product {
  id: number;
  name: string;
  category: "household" | "kids" | "decoration";
  emoji: string;
  price: number;
  oldPrice: number | null;
  badge: "popular" | "sale" | "new" | null;
}

export interface CartItem extends Product {
  qty: number;
}

export interface User {
  name: string;
  email: string;
  initials: string;
}
