"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@/lib/types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (p: Product) => void;
  removeFromCart: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: string;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nd_cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  const save = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem("nd_cart", JSON.stringify(items));
  };

  const gaEvent = (name: string, params?: Record<string, unknown>) => {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function")
      (window as any).gtag("event", name, params || {});
  };

  const addToCart = (p: Product) => {
    const existing = cart.find(x => x.id === p.id);
    if (existing) {
      save(cart.map(x => x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
    } else {
      save([...cart, { ...p, qty: 1 }]);
    }
    gaEvent("add_to_cart", { item_name: p.name, item_category: p.category, value: p.price, currency: "BDT" });
  };

  const removeFromCart = (id: number) => save(cart.filter(x => x.id !== id));

  const changeQty = (id: number, delta: number) => {
    save(
      cart
        .map(x => x.id === id ? { ...x, qty: x.qty + delta } : x)
        .filter(x => x.qty > 0)
    );
  };

  const clearCart = () => save([]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, changeQty, clearCart, cartCount, cartTotal, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
