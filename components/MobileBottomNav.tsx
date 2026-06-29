"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface Props { activePage: "home" | "shop"; }

export default function MobileBottomNav({ activePage }: Props) {
  const { cartCount, openCart } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg md:hidden" style={{ height: "68px" }}>
      <ul className="flex h-full">
        <li className="flex-1 flex justify-center items-center">
          <Link href="/home" className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activePage === "home" ? "text-[#FF6B35]" : "text-gray-500"}`}>
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </Link>
        </li>
        <li className="flex-1 flex justify-center items-center">
          <Link href="/shop" className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${activePage === "shop" ? "text-[#FF6B35]" : "text-gray-500"}`}>
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
            Category
          </Link>
        </li>
        <li className="flex-1 flex justify-center items-center relative" style={{ marginTop: "-24px" }}>
          <div className="flex flex-col items-center gap-1">
            <button onClick={openCart} className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg relative cursor-pointer border-4 border-white" style={{ background: "#2196C4" }}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">{cartCount}</span>
              )}
            </button>
            <span className="text-xs font-medium text-gray-500">Cart</span>
          </div>
        </li>
        <li className="flex-1 flex justify-center items-center">
          <Link href="/shop" className="flex flex-col items-center gap-1 text-xs font-medium text-gray-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Wishlist
          </Link>
        </li>
        <li className="flex-1 flex justify-center items-center">
          <Link href="/" className="flex flex-col items-center gap-1 text-xs font-medium text-gray-500">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}
