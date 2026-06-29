"use client";
import { useEffect, useState } from "react";

interface ToastProps { message: string; type?: "success" | "error"; onDone: () => void; }

export default function Toast({ message, type = "success", onDone }: ToastProps) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[9999] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium toast-animate ${type === "success" ? "bg-[#1E1E2E]" : "bg-red-500"}`}>
        <span>{type === "success" ? "✔" : "✖"}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
