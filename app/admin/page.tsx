"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BUILTIN_CATEGORIES } from "@/lib/categories";

interface Category {
  name: string;
  image: string; // data URL
}

interface Item {
  name: string;
  category: string;
  image: string; // data URL
  price: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // Add Category form
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");

  // Add Item form
  const [itemCategory, setItemCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemImage, setItemImage] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemMessage, setItemMessage] = useState("");

  useEffect(() => {
    if (localStorage.getItem("nd_admin") !== "true") {
      router.replace("/admin/login");
      return;
    }
    setCategories(JSON.parse(localStorage.getItem("nd_categories") || "[]"));
    setItems(JSON.parse(localStorage.getItem("nd_items") || "[]"));
    setChecked(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("nd_admin");
    router.push("/admin/login");
  };

  const readImage = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  // All category names that already exist: built-in + admin-added
  const existingNames = [...BUILTIN_CATEGORIES.map(c => c.label), ...categories.map(c => c.name)];

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Please enter a category name.");
      return;
    }
    if (existingNames.some(n => n.toLowerCase() === trimmed.toLowerCase())) {
      setMessage(`"${trimmed}" already exists — no need to add it again.`);
      return;
    }
    const next = [...categories, { name: trimmed, image }];
    setCategories(next);
    localStorage.setItem("nd_categories", JSON.stringify(next));
    setName("");
    setImage("");
    setMessage("Category saved ✓");
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setItemMessage("");
    if (!itemCategory.trim() || !itemName.trim() || !itemPrice.trim()) {
      setItemMessage("Please choose a category and enter an item name and price.");
      return;
    }
    const next = [...items, { name: itemName.trim(), category: itemCategory, image: itemImage, price: itemPrice.trim() }];
    setItems(next);
    localStorage.setItem("nd_items", JSON.stringify(next));
    setItemName("");
    setItemImage("");
    setItemPrice("");
    setItemMessage("Item saved ✓");
  };

  if (!checked) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 h-16 text-white" style={{ background: "#1E1E2E" }}>
        <div className="flex items-center gap-3">
          <Link href="/home" className="text-xl font-black cursor-pointer hover:opacity-90 transition-opacity">
            NextDoor<span style={{ color: "#FF6B35" }}>Shop</span>
          </Link>
          <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "rgba(255,107,53,0.2)", color: "#FF6B35" }}>ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/home" className="text-sm text-gray-400 hover:text-white">View store</Link>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white cursor-pointer">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-800 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome back, administrator 👋</p>

        {/* Add Category section */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-bold text-gray-800 text-lg mb-5">Add Category</h2>
          {message && (
            <div className={`mb-4 px-4 py-3 text-sm rounded-xl border ${message.includes("✓") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>{message}</div>
          )}
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Household" list="category-suggestions"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
              <datalist id="category-suggestions">
                {existingNames.map((n, i) => <option key={i} value={n} />)}
              </datalist>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-xs text-gray-400 mr-1">Already exists:</span>
                {existingNames.map((n, i) => (
                  <button key={i} type="button" onClick={() => setName(n)}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer">{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Image</label>
              <input type="file" accept="image/*" onChange={e => readImage(e, setImage)}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#FF6B35] hover:file:bg-orange-100 cursor-pointer" />
              {image && <img src={image} alt="preview" className="mt-3 w-24 h-24 object-cover rounded-xl border border-gray-200" />}
            </div>
            <button type="submit" className="py-3 px-6 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "#FF6B35" }}>
              Save
            </button>
          </form>
        </section>

        {/* Add Item section */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-bold text-gray-800 text-lg mb-5">Add Item</h2>
          {itemMessage && (
            <div className={`mb-4 px-4 py-3 text-sm rounded-xl border ${itemMessage.includes("✓") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>{itemMessage}</div>
          )}
          <form onSubmit={handleSaveItem} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select value={itemCategory} onChange={e => setItemCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white">
                <option value="">Select a category…</option>
                {BUILTIN_CATEGORIES.map(c => (
                  <option key={c.key} value={c.label}>{c.label}</option>
                ))}
                {categories.map((c, i) => (
                  <option key={`custom-${i}`} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Name</label>
              <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Ceramic Coffee Mug"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Image</label>
              <input type="file" accept="image/*" onChange={e => readImage(e, setItemImage)}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#FF6B35] hover:file:bg-orange-100 cursor-pointer" />
              {itemImage && <img src={itemImage} alt="preview" className="mt-3 w-24 h-24 object-cover rounded-xl border border-gray-200" />}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price</label>
              <input type="number" step="0.01" min="0" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="e.g. 12.99"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
            </div>
            <button type="submit" className="py-3 px-6 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "#FF6B35" }}>
              Save
            </button>
          </form>
        </section>

        {/* Saved items */}
        <section>
          <h2 className="font-bold text-gray-800 text-lg mb-4">Saved Items ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-gray-500 text-sm">No items added yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((it, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-[#FF6B35] font-semibold">{it.category}</p>
                    <p className="font-semibold text-gray-800 text-sm truncate">{it.name}</p>
                    <p className="text-gray-700 font-bold text-sm mt-1">${it.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
