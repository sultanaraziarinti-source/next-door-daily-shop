"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface Props { activePage: "home" | "shop"; onHamburger: () => void; }

export default function Navbar({ activePage, onHamburger }: Props) {
  const { user, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`}
      style={{ background: "rgba(30,30,46,0.96)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/home" className="text-xl font-black text-white tracking-tight">
          NextDoor<span style={{ color: "#FF6B35" }}>Shop</span>
        </Link>

        <ul className="hidden md:flex gap-8">
          {(["home", "shop"] as const).map(p => (
            <li key={p}>
              <Link href={`/${p}`}
                className={`text-sm font-semibold capitalize transition-colors ${activePage === p ? "text-[#FF6B35]" : "text-gray-400 hover:text-white"}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button onClick={openCart} className="relative w-10 h-10 rounded-full flex items-center justify-center text-lg cursor-pointer transition-colors hidden md:flex" style={{ background: "rgba(255,255,255,0.08)" }}>
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: "#EF4444" }}>{cartCount}</span>
            )}
          </button>
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#FF6B35" }}>{user.initials}</div>
              <span className="text-white text-sm font-medium">{user.name.split(" ")[0]}</span>
              <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-white ml-1 cursor-pointer">Sign out</button>
              <Link href="/admin/login" className="text-xs font-semibold ml-1 px-3 py-1.5 rounded-full cursor-pointer transition-opacity hover:opacity-90" style={{ background: "rgba(255,107,53,0.15)", color: "#FF6B35" }}>Admin login</Link>
            </div>
          )}
          <button onClick={onHamburger} className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer">
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>
        </div>
      </div>
    </nav>
  );
}
