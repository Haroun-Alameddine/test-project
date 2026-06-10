"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

/* ================================================================
   Auth Context — MVP mock (no Supabase for now)
   ================================================================ */

export type MockUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

type AuthContextValue = {
  user: MockUser | null;
  isLoading: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <Providers>");
  }
  return ctx;
}

/* ================================================================
   App Context — global UI state
   ================================================================ */

type AppContextValue = {
  sidebarLeftOpen: boolean;
  sidebarRightOpen: boolean;
  toggleSidebarLeft: () => void;
  toggleSidebarRight: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within <Providers>");
  }
  return ctx;
}

/* ================================================================
   Providers — compose all context providers here
   ================================================================ */

export function Providers({ children }: { children: React.ReactNode }) {
  /* --- mock auth state ----------------------------------------- */
  const [user, setUser] = useState<MockUser | null>({
    id: "mock-user-1",
    name: "مستخدم تجريبي",
    email: "demo@pedabook.app",
  });
  const [isLoading] = useState(false);

  const signIn = useCallback((email: string) => {
    setUser({
      id: "mock-user-1",
      name: "مستخدم تجريبي",
      email,
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  /* --- UI state ------------------------------------------------- */
  const [sidebarLeftOpen, setSidebarLeftOpen] = useState(true);
  const [sidebarRightOpen, setSidebarRightOpen] = useState(true);

  const toggleSidebarLeft = useCallback(
    () => setSidebarLeftOpen((v) => !v),
    []
  );
  const toggleSidebarRight = useCallback(
    () => setSidebarRightOpen((v) => !v),
    []
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      <AppContext.Provider
        value={{
          sidebarLeftOpen,
          sidebarRightOpen,
          toggleSidebarLeft,
          toggleSidebarRight,
        }}
      >
        {children}
      </AppContext.Provider>
    </AuthContext.Provider>
  );
}
