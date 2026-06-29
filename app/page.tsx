"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const users = JSON.parse(localStorage.getItem("nd_users") || "[]");
    const found = users.find((u: { email: string; password: string; firstName: string; lastName: string }) => u.email === email.toLowerCase() && u.password === password);
    if (!found) { setError("Invalid email or password."); return; }
    login({ name: `${found.firstName} ${found.lastName}`, email: found.email, initials: (found.firstName[0] + found.lastName[0]).toUpperCase() });
    router.push("/home");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center p-12 text-white" style={{ background: "linear-gradient(145deg, #1E1E2E 0%, #2D1B5E 60%, #3D0B0B 100%)" }}>
        <div className="text-3xl font-black mb-2">NextDoor<span style={{ color: "#FF6B35" }}>Shop</span></div>
        <p className="text-gray-400 mb-10">Your everyday shopping destination</p>
        {[["🏠", "Household Essentials", "Everything your home needs"], ["🧸", "Kids Collection", "Safe & fun products for children"], ["✨", "Decoration & Decor", "Transform your space"], ["🚚", "Fast Delivery", "Free shipping on orders above $50"]].map(([icon, title, desc]) => (
          <div key={title} className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(255,107,53,0.15)" }}>{icon}</div>
            <div><h4 className="font-bold text-white">{title}</h4><p className="text-gray-400 text-sm">{desc}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="md:hidden text-2xl font-black mb-6 text-center">NextDoor<span style={{ color: "#FF6B35" }}>Shop</span></div>
          <h2 className="text-3xl font-black text-gray-800 mb-1">Welcome back 👋</h2>
          <p className="text-gray-500 mb-8">Sign in to your account</p>
          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">✉</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "#FF6B35" }}>
              Sign In →
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account? <Link href="/signup" className="font-bold" style={{ color: "#FF6B35" }}>Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
