"use client";
import { useCart } from "@/context/CartContext";

interface Props { onCheckout: () => void; }

export default function CartSidebar({ onCheckout }: Props) {
  const { cart, isOpen, closeCart, changeQty, removeFromCart, cartTotal } = useCart();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-40 fade-in" onClick={closeCart} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0 cart-open" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ background: "#fff0eb" }}>
          <h3 className="font-bold text-lg text-[#1E1E2E]">🛒 Your Cart</h3>
          <button onClick={closeCart} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="text-6xl">🛒</div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm">Add some items to get started!</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl border border-gray-100">{item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1E1E2E] truncate">{item.name}</p>
                  <p className="text-[#FF6B35] font-bold text-sm">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => changeQty(item.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 text-sm font-bold hover:bg-gray-100 cursor-pointer flex items-center justify-center">−</button>
                  <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)} className="w-7 h-7 rounded-full border border-gray-200 text-sm font-bold hover:bg-gray-100 cursor-pointer flex items-center justify-center">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer text-sm">✕</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-5 py-4 border-t" style={{ background: "#fff0eb" }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-600">Total</span>
              <span className="text-xl font-black text-[#1E1E2E]">${cartTotal}</span>
            </div>
            <button onClick={onCheckout} className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-colors cursor-pointer" style={{ background: "#FF6B35" }}>
              Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
