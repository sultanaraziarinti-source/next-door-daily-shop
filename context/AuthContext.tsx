"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";
import type { User as SupaUser } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function mapUser(u: SupaUser): User {
  const name = (u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "User";
  const parts = name.trim().split(" ").filter(Boolean);
  const initials = ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || name.slice(0, 1).toUpperCase();
  return { name, email: u.email || "", initials };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAdmin = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("is_admin").eq("id", userId).single();
    setIsAdmin(!!data?.is_admin);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) { setUser(mapUser(u)); loadAdmin(u.id); }
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) { setUser(mapUser(u)); loadAdmin(u.id); }
      else { setUser(null); setIsAdmin(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); };

  return <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
