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

  // Remove form
  const [removeType, setRemoveType] = useState("");
  const [removeName, setRemoveName] = useState("");
  const [removeMessage, setRemoveMessage] = useState("");

  useEffect(() => {
    if (localStorage.getItem("nd_admin") !== "true") {
      router.replace("/admin/login");
      return;
    }
    // Load categories, removing any duplicate entries (case-insensitive, keep the latest)
    const rawCats: { name: string; image: string }[] = JSON.parse(localStorage.getItem("nd_categories") || "[]");
    const dedupMap = new Map<string, { name: string; image: string }>();
    for (const c of rawCats) dedupMap.set(c.name.toLowerCase(), c);
    const dedupedCats = [...dedupMap.values()];
    if (dedupedCats.length !== rawCats.length) localStorage.setItem("nd_categories", JSON.stringify(dedupedCats));
    setCategories(dedupedCats);
    setItems(JSON.parse(localStorage.getItem("nd_items") || "[]"));
    setChecked(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("nd_admin");
    router.push("/admin/login");
  };

  // Read an image, downscale + compress it (so it fits in localStorage), and return a data URL
  const readImage = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        let { width, height } = img;
        if (width > height && width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
        else if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setter(canvas.toDataURL("image/jpeg", 0.7));
        } else {
          setter(reader.result as string);
        }
      };
      img.onerror = () => setter(reader.result as string);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // All category names that already exist: built-in + admin-added, de-duplicated (case-insensitive)
  const seenNames = new Set<string>();
  const existingNames = [...BUILTIN_CATEGORIES.map(c => c.label), ...categories.map(c => c.name)].filter(n => {
    const key = n.toLowerCase();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Please enter a category name.");
      return;
    }
    // Upsert: if the category already exists (built-in or custom), update its image
    const idx = categories.findIndex(c => c.name.toLowerCase() === trimmed.toLowerCase());
    const next = idx >= 0
      ? categories.map((c, i) => (i === idx ? { name: c.name, image } : c))
      : [...categories, { name: trimmed, image }];
    try {
      localStorage.setItem("nd_categories", JSON.stringify(next));
    } catch {
      setMessage("Could not save — the image is too large for browser storage. Try a smaller image.");
      return;
    }
    setCategories(next);
    setName("");
    setImage("");
    setMessage(idx >= 0 ? "Category image updated ✓" : "Category saved ✓");
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setItemMessage("");
    if (!itemCategory.trim() || !itemName.trim() || !itemPrice.trim()) {
      setItemMessage("Please choose a category and enter an item name and price.");
      return;
    }
    const next = [...items, { name: itemName.trim(), category: itemCategory, image: itemImage, price: itemPrice.trim() }];
    try {
      localStorage.setItem("nd_items", JSON.stringify(next));
    } catch {
      setItemMessage("Could not save — the image is too large for browser storage. Try a smaller image.");
      return;
    }
    setItems(next);
    setItemName("");
    setItemImage("");
    setItemPrice("");
    setItemMessage("Item saved ✓");
  };

  const handleRemove = (e: React.FormEvent) => {
    e.preventDefault();
    setRemoveMessage("");
    const target = removeName.trim().toLowerCase();
    if (!removeType) { setRemoveMessage("Please choose what to remove."); return; }
    if (!target) { setRemoveMessage("Please enter the name to remove."); return; }
    if (removeType === "category") {
      const next = categories.filter(c => c.name.toLowerCase() !== target);
      if (next.length === categories.length) { setRemoveMessage(`No category named "${removeName.trim()}" found.`); return; }
      try { localStorage.setItem("nd_categories", JSON.stringify(next)); } catch { setRemoveMessage("Could not update storage."); return; }
      setCategories(next);
      setRemoveMessage("Category removed ✓");
    } else {
      const next = items.filter(it => it.name.toLowerCase() !== target);
      if (next.length === items.length) { setRemoveMessage(`No item named "${removeName.trim()}" found.`); return; }
      try { localStorage.setItem("nd_items", JSON.stringify(next)); } catch { setRemoveMessage("Could not update storage."); return; }
      setItems(next);
      setRemoveMessage("Item removed ✓");
    }
    setRemoveName("");
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
                <span className="text-xs text-gray-400 mr-1">Pick one to set its image:</span>
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
                {categories
                  .filter(c => !BUILTIN_CATEGORIES.some(b => b.label.toLowerCase() === c.name.toLowerCase()))
                  .map((c, i) => (
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (৳)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                <input type="number" step="0.01" min="0" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="e.g. 250"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
              </div>
            </div>
            <button type="submit" className="py-3 px-6 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "#FF6B35" }}>
              Save
            </button>
          </form>
        </section>

        {/* Remove Category or Item section */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="font-bold text-gray-800 text-lg mb-5">Remove Category or Item</h2>
          {removeMessage && (
            <div className={`mb-4 px-4 py-3 text-sm rounded-xl border ${removeMessage.includes("✓") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>{removeMessage}</div>
          )}
          <form onSubmit={handleRemove} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">What do you want to remove?</label>
              <select value={removeType} onChange={e => { setRemoveType(e.target.value); setRemoveName(""); setRemoveMessage(""); }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white">
                <option value="">Select…</option>
                <option value="category">Category</option>
                <option value="item">Item</option>
              </select>
            </div>
            {removeType && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{removeType === "category" ? "Category name" : "Item name"}</label>
                <input type="text" value={removeName} onChange={e => setRemoveName(e.target.value)} list="remove-suggestions"
                  placeholder={removeType === "category" ? "e.g. Vases" : "e.g. puzzle"}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
                <datalist id="remove-suggestions">
                  {(removeType === "category" ? categories.map(c => c.name) : items.map(it => it.name)).map((n, i) => <option key={i} value={n} />)}
                </datalist>
              </div>
            )}
            <button type="submit" className="py-3 px-6 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "#EF4444" }}>
              Remove
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
                    <p className="text-gray-700 font-bold text-sm mt-1">৳{it.price}</p>
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
