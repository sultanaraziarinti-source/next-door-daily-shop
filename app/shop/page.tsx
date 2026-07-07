"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/lib/products";
import { Product } from "@/lib/types";
import { BUILTIN_CATEGORIES } from "@/lib/categories";
import Navbar from "@/components/Navbar";
import MobileDrawer from "@/components/MobileDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import CartSidebar from "@/components/CartSidebar";
import ProductCard from "@/components/ProductCard";
import Toast from "@/components/Toast";

type Filter = string; // "all" | built-in keys | custom category names
type Sort = "default" | "price-asc" | "price-desc" | "name";

function ShopContent() {
  const { user } = useAuth();
  const { clearCart, cartTotal } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState<Filter>((searchParams.get("cat") as Filter) || "all");
  const [sort, setSort] = useState<Sort>("default");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [adminItems, setAdminItems] = useState<{ name: string; category: string; image: string; price: string }[]>([]);
  const [customCategories, setCustomCategories] = useState<{ name: string; image: string }[]>([]);

  useEffect(() => { if (!user) router.replace("/"); }, [user, router]);
  useEffect(() => {
    setAdminItems(JSON.parse(localStorage.getItem("nd_items") || "[]"));
    setCustomCategories(JSON.parse(localStorage.getItem("nd_categories") || "[]"));
  }, []);
  // Keep the active filter in sync with the ?cat= URL (so "View All Products" resets to all)
  useEffect(() => { setFilter((searchParams.get("cat") as Filter) || "all"); }, [searchParams]);

  const filtered = useMemo(() => {
    // Map an admin item's category to a filter key, tolerating any form:
    // "Household Items", "Household", or "household" all -> "household".
    const normalize = (s: string) => s.toLowerCase().replace(/\s*items$/, "").trim();
    const keyFor = (label: string) => {
      const match = BUILTIN_CATEGORIES.find(c => normalize(c.label) === normalize(label) || c.key === normalize(label));
      return (match ? match.key : label) as Product["category"];
    };
    const adminProducts: Product[] = adminItems.map((it, idx) => ({
      id: 100000 + idx,
      name: it.name,
      category: keyFor(it.category),
      emoji: "🛍️",
      price: parseFloat(it.price) || 0,
      oldPrice: null,
      badge: null,
      image: it.image || undefined,
    }));
    let list = [...PRODUCTS, ...adminProducts];
    if (filter !== "all") list = list.filter(p => p.category === filter);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filter, sort, search, adminItems]);

  if (!user) return null;

  const handleCheckout = () => {
    const total = cartTotal;
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function")
      (window as any).gtag("event", "purchase", { value: parseFloat(total), currency: "BDT" });
    clearCart();
    setToast({ msg: `Order placed! Total: ৳${total} 🎉` });
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",        label: "All Items" },
    { key: "household",  label: "🏠 Household" },
    { key: "kids",       label: "🧸 Kids" },
    { key: "decoration", label: "✨ Decoration" },
    // Custom categories added from the admin page get their own filter
    // (exclude built-in categories, which already have their own filter above)
    ...customCategories
      .filter(c => !BUILTIN_CATEGORIES.some(b => b.label.toLowerCase() === c.name.toLowerCase()))
      .map(c => ({ key: c.name, label: `🏷️ ${c.name}` })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="shop" onHamburger={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CartSidebar onCheckout={handleCheckout} />
      <MobileBottomNav activePage="shop" />

      {/* Shop Header */}
      <div className="pt-16 text-white" style={{ background: "linear-gradient(135deg, #1E1E2E 0%, #2D1B5E 100%)", padding: "64px 0 40px" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black">Our Shop 🛍️</h1>
              <p className="text-gray-400 mt-1">Browse all products — household, kids & decoration</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setSearch(searchInput)}
                placeholder="Search products…"
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-gray-400 text-sm border border-white/10 focus:outline-none focus:border-white/30 w-56"
              />
              <button onClick={() => {
                setSearch(searchInput);
                if (searchInput && typeof window !== "undefined" && typeof (window as any).gtag === "function")
                  (window as any).gtag("event", "search", { search_term: searchInput });
              }} className="px-5 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "#FF6B35" }}>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3 overflow-x-auto">
          <span className="text-sm text-gray-500 font-medium flex-shrink-0 hidden md:block">Filter:</span>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 transition-colors cursor-pointer ${filter === f.key ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              style={filter === f.key ? { background: "#FF6B35" } : {}}>
              {f.label}
            </button>
          ))}
          <select value={sort} onChange={e => setSort(e.target.value as Sort)}
            className="ml-auto px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 focus:outline-none bg-white cursor-pointer flex-shrink-0">
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-28 md:pb-10">
        <p className="text-sm text-gray-500 mb-5">Showing <strong className="text-gray-800">{filtered.length}</strong> products</p>
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <p className="text-gray-500 font-medium">No products found.</p>
            <p className="text-gray-400 text-sm">Try a different filter or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} onToast={msg => setToast({ msg })} />)}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

export default function ShopPage() {
  return <Suspense><ShopContent /></Suspense>;
}
