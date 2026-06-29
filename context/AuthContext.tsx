"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("nd_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const gaEvent = (name: string, params?: Record<string, unknown>) => {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function")
      (window as any).gtag("event", name, params || {});
  };

  const login = (u: User) => {
    localStorage.setItem("nd_user", JSON.stringify(u));
    setUser(u);
    gaEvent("login", { method: "email" });
  };

  const logout = () => {
    localStorage.removeItem("nd_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
