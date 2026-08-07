"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AdminUser } from "@/types";
import { readStorage, writeStorage, clearStorage } from "@/lib/utils/storage";
import { generateId } from "@/lib/utils/id";

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (data: Partial<AdminUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCOUNTS_KEY = "accounts";
const SESSION_KEY = "session";

function seedDefaultAccount(): StoredAccount[] {
  const existing = readStorage<StoredAccount[]>(ACCOUNTS_KEY, []);
  if (existing.length > 0) return existing;
  const seeded: StoredAccount[] = [
    {
      id: "user_1",
      name: "Maren Okafor",
      email: "admin@nexlayer.example",
      password: "nexlayer123",
    },
  ];
  writeStorage(ACCOUNTS_KEY, seeded);
  return seeded;
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = readStorage<AdminUser | null>(SESSION_KEY, null);
    setUser(session);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await delay();
    const accounts = seedDefaultAccount();
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!account || account.password !== password) {
      return { ok: false, error: "That email and password don't match our records." };
    }
    const sessionUser: AdminUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: "owner",
    };
    writeStorage(SESSION_KEY, sessionUser);
    setUser(sessionUser);
    return { ok: true };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await delay();
    const accounts = seedDefaultAccount();
    if (accounts.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, error: "An account with that email already exists." };
    }
    const account: StoredAccount = { id: generateId("user"), name, email, password };
    writeStorage(ACCOUNTS_KEY, [...accounts, account]);
    const sessionUser: AdminUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: "editor",
    };
    writeStorage(SESSION_KEY, sessionUser);
    setUser(sessionUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    clearStorage(SESSION_KEY);
    setUser(null);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await delay();
      if (!user) return { ok: false, error: "You need to be signed in." };
      const accounts = seedDefaultAccount();
      const index = accounts.findIndex((a) => a.id === user.id);
      if (index === -1 || accounts[index].password !== currentPassword) {
        return { ok: false, error: "Your current password is incorrect." };
      }
      accounts[index] = { ...accounts[index], password: newPassword };
      writeStorage(ACCOUNTS_KEY, accounts);
      return { ok: true };
    },
    [user],
  );

  const updateProfile = useCallback(
    (data: Partial<AdminUser>) => {
      if (!user) return;
      const next = { ...user, ...data };
      writeStorage(SESSION_KEY, next);
      setUser(next);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
