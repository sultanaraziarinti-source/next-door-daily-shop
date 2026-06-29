"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.firstName || !form.lastName || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    const users = JSON.parse(localStorage.getItem("nd_users") || "[]");
    if (users.find((u: { email: string }) => u.email === form.email.toLowerCase())) { setError("Account with this email already exists."); return; }
    users.push({ ...form, email: form.email.toLowerCase() });
    localStorage.setItem("nd_users", JSON.stringify(users));
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function")
      (window as any).gtag("event", "sign_up", { method: "email" });
    setSuccess(true);
    setTimeout(() => router.push("/"), 1600);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center p-12 text-white" style={{ background: "linear-gradient(145deg, #1E1E2E 0%, #2D1B5E 60%, #3D0B0B 100%)" }}>
        <div className="text-3xl font-black mb-2">NextDoor<span style={{ color: "#FF6B35" }}>Shop</span></div>
        <p className="text-gray-400 mb-10">Join thousands of happy shoppers</p>
        {[["🎁", "Exclusive Deals", "Members get special discounts & early sales"], ["🛒", "Easy Shopping", "Add to cart, track orders in seconds"], ["⭐", "Loyalty Rewards", "Earn points on every purchase"], ["🔒", "100% Secure", "Your data is fully protected"]].map(([icon, title, desc]) => (
          <div key={title} className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(255,107,53,0.15)" }}>{icon}</div>
            <div><h4 className="font-bold text-white">{title}</h4><p className="text-gray-400 text-sm">{desc}</p></div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="md:hidden text-2xl font-black mb-6 text-center">NextDoor<span style={{ color: "#FF6B35" }}>Shop</span></div>
          <h2 className="text-3xl font-black text-gray-800 mb-1">Create your account ✨</h2>
          <p className="text-gray-500 mb-8">Start your NextDoor journey today — it&apos;s free!</p>
          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}
          {success && <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">Account created! Redirecting to login…</div>}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[["First Name", "firstName", "Jane"], ["Last Name", "lastName", "Doe"]].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input type="text" value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={ph}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
                </div>
              ))}
            </div>
            {[["Email Address", "email", "email", "you@example.com"], ["Password", "password", "password", "At least 6 characters"], ["Confirm Password", "confirm", "password", "Repeat your password"]].map(([label, key, type, ph]) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <input type={type} value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder={ph}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF6B35] bg-white" />
              </div>
            ))}
            <button type="submit" className="w-full py-3.5 rounded-xl text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "#FF6B35" }}>
              Create Account →
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link href="/" className="font-bold" style={{ color: "#FF6B35" }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
