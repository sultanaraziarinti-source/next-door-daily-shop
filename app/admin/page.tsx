"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BUILTIN_CATEGORIES } from "@/lib/categories";
import { useAuth } from "@/context/AuthContext";
import {
  getCategories, getItems, upsertCategory, deleteCategory,
  addItem, deleteItemByName, deleteItemsByCategory, uploadImage,
  DbCategory, DbItem,
} from "@/lib/db";

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, loading, logout } = useAuth();
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [items, setItems] = useState<DbItem[]>([]);

  // Add Category form
  const [name, setName] = useState("");
  const [catFile, setCatFile] = useState<File | null>(null);
  const [catPreview, setCatPreview] = useState("");
  const [message, setMessage] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  // Add Item form
  const [itemCategory, setItemCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemFile, setItemFile] = useState<File | null>(null);
  const [itemPreview, setItemPreview] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemMessage, setItemMessage] = useState("");
  const [savingItem, setSavingItem] = useState(false);

  // Remove form
  const [removeType, setRemoveType] = useState("");
  const [removeName, setRemoveName] = useState("");
  const [removeMessage, setRemoveMessage] = useState("");
  const [removing, setRemoving] = useState(false);

  const load = async () => {
    const [cats, its] = await Promise.all([getCategories(), getItems()]);
    setCategories(cats);
    setItems(its);
  };

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) { router.replace("/admin/login"); return; }
    load().finally(() => setReady(true));
  }, [loading, isAdmin, router]);

  const handleLogout = async () => { await logout(); router.push("/admin/login"); };

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void, setPreview: (v: string) => void) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const existingNames = [...BUILTIN_CATEGORIES.map(c => c.label), ...categories.map(c => c.name)]
    .filter((n, i, arr) => arr.findIndex(x => x.toLowerCase() === n.toLowerCase()) === i);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const trimmed = name.trim();
    if (!trimmed) { setMessage("Please enter a category name."); return; }
    setSavingCat(true);
    try {
      const existing = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
      const imageUrl = catFile ? await uploadImage(catFile) : (existing?.image_url ?? null);
      await upsertCategory(trimmed, imageUrl);
      setName(""); setCatFile(null); setCatPreview("");
      setMessage("Category saved ✓");
      await load();
    } catch (err) {
      setMessage((err as Error).message || "Could not save category.");
    } finally { setSavingCat(false); }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemMessage("");
    if (!itemCategory.trim() || !itemName.trim() || !itemPrice.trim()) {
      setItemMessage("Please choose a category and enter an item name and price.");
      return;
    }
    setSavingItem(true);
    try {
      const imageUrl = itemFile ? await uploadImage(itemFile) : null;
      await addItem({ name: itemName.trim(), category: itemCategory, price: parseFloat(itemPrice) || 0, imageUrl });
      setItemName(""); setItemFile(null); setItemPreview(""); setItemPrice("");
      setItemMessage("Item saved ✓");
      await load();
    } catch (err) {
      setItemMessage((err as Error).message || "Could not save item.");
    } finally { setSavingItem(false); }
  };

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    setRemoveMessage("");
    const target = removeName.trim();
    if (!removeType) { setRemoveMessage("Please choose what to remove."); return; }
    if (!target) { setRemoveMessage("Please enter the name to remove."); return; }
    setRemoving(true);
    try {
      if (removeType === "category") {
        await deleteItemsByCategory(target);
        await deleteCategory(target);
        setRemoveMessage("Category and its items removed ✓");
      } else {
        await deleteItemByName(target);
        setRemoveMessage("Item removed ✓");
      }
      setRemoveName("");
      await load();
    } catch (err) {
      setRemoveMessage((err as Error).message || "Could not remove.");
    } finally { setRemoving(false); }
  };

  if (loading || !ready) return null;

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

        {/* Add Category */}
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
              <input type="file" accept="image/*" onChange={e => pickImage(e, setCatFile, setCatPreview)}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#FF6B35] hover:file:bg-orange-100 cursor-pointer" />
              {catPreview && <img src={catPreview} alt="preview" className="mt-3 w-24 h-24 object-cover rounded-xl border border-gray-200" />}
            </div>
            <button type="submit" disabled={savingCat} className="py-3 px-6 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "#FF6B35" }}>
              {savingCat ? "Saving…" : "Save"}
            </button>
          </form>
        </section>

        {/* Add Item */}
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
                {BUILTIN_CATEGORIES.map(c => <option key={c.key} value={c.label}>{c.label}</option>)}
                {categories
                  .filter(c => !BUILTIN_CATEGORIES.some(b => b.label.toLowerCase() === c.name.toLowerCase()))
                  .map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Name</label>
              <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Ceramic Coffee Mug"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Image</label>
              <input type="file" accept="image/*" onChange={e => pickImage(e, setItemFile, setItemPreview)}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#FF6B35] hover:file:bg-orange-100 cursor-pointer" />
              {itemPreview && <img src={itemPreview} alt="preview" className="mt-3 w-24 h-24 object-cover rounded-xl border border-gray-200" />}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (৳)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                <input type="number" step="0.01" min="0" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="e.g. 250"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
              </div>
            </div>
            <button type="submit" disabled={savingItem} className="py-3 px-6 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "#FF6B35" }}>
              {savingItem ? "Saving…" : "Save"}
            </button>
          </form>
        </section>

        {/* Remove Category or Item */}
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
            <button type="submit" disabled={removing} className="py-3 px-6 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: "#EF4444" }}>
              {removing ? "Removing…" : "Remove"}
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
              {items.map(it => (
                <div key={it.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.name} className="w-full h-32 object-cover" />
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
