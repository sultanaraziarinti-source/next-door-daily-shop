"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/lib/products";
import Navbar from "@/components/Navbar";
import MobileDrawer from "@/components/MobileDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import CartSidebar from "@/components/CartSidebar";
import ProductCard from "@/components/ProductCard";
import Toast from "@/components/Toast";

const CATEGORIES = [
  { key: "household", label: "Household Items", icon: "🏠", gradient: "linear-gradient(135deg,#667eea,#764ba2)", count: 6 },
  { key: "kids",      label: "Kids Items",       icon: "🧸", gradient: "linear-gradient(135deg,#f093fb,#f5576c)", count: 6 },
  { key: "decoration",label: "Decoration Items", icon: "✨", gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", count: 6 },
];

const featured = PRODUCTS.filter(p => p.badge === "popular" || p.badge === "sale").slice(0, 8);

export default function HomePage() {
  const { user } = useAuth();
  const { clearCart, cartTotal } = useCart();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null);
  const [customCategories, setCustomCategories] = useState<{ name: string; image: string }[]>([]);

  useEffect(() => { if (!user) router.replace("/"); }, [user, router]);
  useEffect(() => { setCustomCategories(JSON.parse(localStorage.getItem("nd_categories") || "[]")); }, []);
  if (!user) return null;

  const handleCheckout = () => {
    const total = cartTotal;
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function")
      (window as any).gtag("event", "purchase", { value: parseFloat(total), currency: "USD" });
    clearCart();
    setToast({ msg: `Order placed! Total: $${total} 🎉` });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="home" onHamburger={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CartSidebar onCheckout={handleCheckout} />
      <MobileBottomNav activePage="home" />

      {/* Hero */}
      <section className="pt-16 text-white" style={{ background: "linear-gradient(135deg, #1E1E2E 0%, #2D1B5E 50%, #1a0a2e 100%)", minHeight: "520px" }}>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(255,107,53,0.2)", color: "#FF6B35" }}>🔥 New Arrivals</span>
            <h1 className="mt-4 text-4xl md:text-6xl font-black leading-tight">
              Shop <span style={{ color: "#FF6B35" }}>Smarter,</span><br />Live Better
            </h1>
            <p className="mt-4 text-gray-400 text-lg max-w-lg">Discover quality products across household, kids & decoration — all in one place.</p>
            <div className="mt-8 flex gap-4 flex-wrap">
              <Link href="/shop" className="px-7 py-3.5 rounded-full font-bold text-sm text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "#FF6B35" }}>Browse Shop →</Link>
              <button onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
                className="px-7 py-3.5 rounded-full font-bold text-sm text-white border border-white/20 cursor-pointer hover:border-white/50 transition-colors">
                View Categories
              </button>
            </div>
            <div className="mt-10 flex gap-8">
              {[["50+", "Products"], ["1K+", "Customers"]].map(([n, l]) => (
                <div key={l}><div className="text-2xl font-black">{n}</div><div className="text-gray-500 text-xs mt-0.5">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#fff0eb", color: "#FF6B35" }}>Shop by Category</span>
          <h2 className="mt-3 text-3xl font-black text-gray-800">What are you <span style={{ color: "#FF6B35" }}>looking for?</span></h2>
          <p className="mt-2 text-gray-500">Browse our handpicked collections for your daily life.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATEGORIES.map(c => (
            <Link key={c.key} href={`/shop?cat=${c.key}`}
              className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:-translate-y-2 transition-all duration-300" style={{ minHeight: "220px" }}>
              <div className="absolute inset-0" style={{ background: c.gradient }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.6))" }} />
              <div className="relative p-8 flex flex-col justify-end h-full" style={{ minHeight: "220px" }}>
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="text-white font-black text-xl">{c.label}</h3>
                <p className="text-white/70 text-sm">{c.count} products available</p>
                <span className="mt-4 inline-flex items-center justify-center gap-2 text-white font-bold" style={{ background: "#FF6B35", padding: "11px 28px", borderRadius: "50px", fontSize: "15px", letterSpacing: "0.01em", boxShadow: "0 4px 14px rgba(255,107,53,0.4)" }}>Shop Now →</span>
              </div>
            </Link>
          ))}
          {customCategories.map((c, i) => (
            <Link key={`custom-${i}`} href={`/shop?cat=${encodeURIComponent(c.name.toLowerCase())}`}
              className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:-translate-y-2 transition-all duration-300" style={{ minHeight: "220px" }}>
              {c.image
                ? <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover" />
                : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#FF6B35,#E55A24)" }} />}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.6))" }} />
              <div className="relative p-8 flex flex-col justify-end h-full" style={{ minHeight: "220px" }}>
                <h3 className="text-white font-black text-xl capitalize">{c.name}</h3>
                <span className="mt-4 inline-flex items-center justify-center gap-2 text-white font-bold" style={{ background: "#FF6B35", padding: "11px 28px", borderRadius: "50px", fontSize: "15px", letterSpacing: "0.01em", boxShadow: "0 4px 14px rgba(255,107,53,0.4)" }}>Shop Now →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#fff0eb", color: "#FF6B35" }}>Hand-Picked</span>
          <h2 className="mt-3 text-3xl font-black text-gray-800">Featured <span style={{ color: "#FF6B35" }}>Products</span></h2>
          <p className="mt-2 text-gray-500">Our most-loved items chosen by thousands of happy shoppers.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map(p => <ProductCard key={p.id} product={p} onToast={msg => setToast({ msg })} />)}
        </div>
        <div className="text-center mt-10">
          <Link href="/shop" className="inline-block px-10 py-3.5 rounded-full font-bold text-sm text-white cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "#1E1E2E" }}>
            View All Products →
          </Link>
        </div>
      </section>

      {/* Promo */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white" style={{ background: "linear-gradient(135deg,#FF6B35,#E55A24)" }}>
          <div>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">Limited Time Offer</span>
            <h2 className="mt-3 text-3xl font-black">Get 20% Off Your<br />First Order!</h2>
            <p className="mt-2 text-white/80">Use code <strong>DAILY20</strong> at checkout. Valid on all categories.</p>
          </div>
          <Link href="/shop" className="px-8 py-3.5 bg-white font-bold rounded-full text-sm cursor-pointer hover:bg-gray-100 transition-colors" style={{ color: "#FF6B35" }}>
            Shop the Sale →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-12 px-6" style={{ background: "#1E1E2E" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-black mb-2">NextDoor<span style={{ color: "#FF6B35" }}>Shop</span></div>
            <p className="text-gray-400 text-sm">Your one-stop destination for household essentials, kids products & decorations.</p>
          </div>
          {[["Shop", [["All Products", "/shop"], ["Household", "/shop?cat=household"], ["Kids", "/shop?cat=kids"], ["Decoration", "/shop?cat=decoration"]]],
            ["Support", [["Help Center", "#"], ["Track Order", "#"], ["Returns", "#"], ["Contact Us", "#"]]],
            ["Company", [["About Us", "#"], ["Blog", "#"], ["Privacy Policy", "#"], ["Terms", "#"]]]].map(([title, links]) => (
            <div key={title as string}>
              <h4 className="font-bold mb-3">{title as string}</h4>
              <ul className="space-y-2">
                {(links as [string, string][]).map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-gray-400 text-sm hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-center text-gray-500 text-sm">
          © 2025 NextDoor<span style={{ color: "#FF6B35" }}>Shop</span>. All rights reserved.
        </div>
      </footer>

      <div className="pb-20 md:pb-0" />
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
