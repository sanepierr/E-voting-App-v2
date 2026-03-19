"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getUser, logout as doLogout } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setLoading(false);
  }, []);

  const updateUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    doLogout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
