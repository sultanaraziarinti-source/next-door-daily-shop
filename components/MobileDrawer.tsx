"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Props { open: boolean; onClose: () => void; }

export default function MobileDrawer({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => { logout(); onClose(); router.push("/"); };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ background: "#1E1E2E" }}>
          <span className="font-black text-white text-lg">NextDoor<span style={{ color: "#FF6B35" }}>Shop</span></span>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl cursor-pointer">✕</button>
        </div>
        <ul className="flex-1 py-4">
          {[["🏠", "Home", "/home"], ["🛍️", "Shop", "/shop"], ["🏡", "Household", "/shop?cat=household"], ["🧸", "Kids", "/shop?cat=kids"], ["✨", "Decoration", "/shop?cat=decoration"]].map(([icon, label, href]) => (
            <li key={label}>
              <Link href={href} onClick={onClose} className="flex items-center gap-3 px-5 py-3.5 text-gray-700 hover:text-[#FF6B35] hover:bg-orange-50 font-medium transition-colors">
                <span>{icon}</span>{label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-5 py-4 border-t bg-gray-50">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: "#FF6B35" }}>{user.initials}</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">Sign Out</button>
            </div>
          ) : (
            <Link href="/" onClick={onClose} className="block w-full py-2.5 text-center rounded-lg text-white text-sm font-bold cursor-pointer" style={{ background: "#FF6B35" }}>Sign In</Link>
          )}
        </div>
      </div>
    </>
  );
}
