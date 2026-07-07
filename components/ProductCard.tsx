"use client";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";

interface Props { product: Product; onToast: (msg: string) => void; }

const BADGE_STYLES: Record<string, string> = {
  popular: "bg-orange-100 text-orange-600",
  sale: "bg-red-100 text-red-600",
  new: "bg-green-100 text-green-600",
};
const BADGE_LABEL: Record<string, string> = {
  popular: "🔥 Hot",
  sale: "% Sale",
  new: "★ New",
};
const CAT_LABEL: Record<string, string> = {
  household: "🏠 Household",
  kids: "🧸 Kids",
  decoration: "✨ Decoration",
};

export default function ProductCard({ product: p, onToast }: Props) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(p);
    onToast(`${p.emoji} ${p.name} added to cart!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative bg-gray-50 flex items-center justify-center overflow-hidden" style={{ minHeight: "140px" }}>
        {p.image && <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />}
        {p.badge && (
          <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-bold ${BADGE_STYLES[p.badge]}`}>
            {BADGE_LABEL[p.badge]}
          </span>
        )}
        {!p.image && <span className="text-6xl">{p.emoji}</span>}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold text-gray-400 mb-1">{CAT_LABEL[p.category]}</span>
        <p className="font-bold text-gray-800 text-sm mb-2 leading-snug">{p.name}</p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg" style={{ color: "#FF6B35" }}>৳{p.price.toFixed(2)}</span>
            {p.oldPrice && <span className="text-xs text-gray-400 line-through">৳{p.oldPrice.toFixed(2)}</span>}
          </div>
          <button onClick={handleAdd} className="w-9 h-9 rounded-full text-white font-bold text-xl flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer" style={{ background: "#FF6B35" }}>+</button>
        </div>
      </div>
    </div>
  );
}
