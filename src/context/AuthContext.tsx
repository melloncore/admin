"use client";

import { createContext, useCallback, useContext, useEffect, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminUser } from "@/types";
import { apiRequest, ApiError } from "@/lib/api/http";

interface BackendUser {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "STAFF";
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
  logout: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateProfile: (data: Partial<AdminUser>) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUser(user: BackendUser): AdminUser {
  return {
    id: user.id,
    name: user.name || user.email,
    email: user.email,
    role: user.role === "ADMIN" ? "owner" : "editor",
  };
}

async function getCurrentUser(): Promise<AdminUser> {
  const response = await apiRequest<{ user: BackendUser }>("/auth/me");
  return mapUser(response.user);
}

async function initializeSession(): Promise<AdminUser | null> {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }

  try {
    await apiRequest("/auth/refresh", { method: "POST" });
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const userQueryKey = ["auth", "current-user"];
  const userQuery = useQuery({
    queryKey: userQueryKey,
    queryFn: initializeSession,
    retry: false,
  });
  const user = userQuery.data ?? null;

  useEffect(() => {
    if (userQuery.error)
      console.error("Unable to restore admin session:", userQuery.error);
  }, [userQuery.error]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      return getCurrentUser();
    },
    onSuccess: (currentUser) => queryClient.setQueryData(userQueryKey, currentUser),
  });

  const signupMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      await apiRequest("/auth/bootstrap", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      return getCurrentUser();
    },
    onSuccess: (currentUser) => queryClient.setQueryData(userQueryKey, currentUser),
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/auth/logout", { method: "POST" }),
    onSettled: () => queryClient.setQueryData(userQueryKey, null),
  });

  const passwordMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) =>
      apiRequest("/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  });

  const profileMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest<{ user: BackendUser }>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });
      return mapUser(response.user);
    },
    onSuccess: (currentUser) => queryClient.setQueryData(userQueryKey, currentUser),
  });
  const loginAsync = loginMutation.mutateAsync;
  const signupAsync = signupMutation.mutateAsync;
  const logoutAsync = logoutMutation.mutateAsync;
  const changePasswordAsync = passwordMutation.mutateAsync;
  const updateProfileAsync = profileMutation.mutateAsync;

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await loginAsync({ email, password });
        return { ok: true };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    },
    [loginAsync],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        await signupAsync({ name, email, password });
        return { ok: true };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    },
    [signupAsync],
  );

  const logout = useCallback(async () => {
    try {
      await logoutAsync();
    } catch (error) {
      console.error("Unable to revoke the admin session:", error);
    }
  }, [logoutAsync]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        await changePasswordAsync({ currentPassword, newPassword });
        return { ok: true };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    },
    [changePasswordAsync],
  );

  const updateProfile = useCallback(
    async (data: Partial<AdminUser>) => {
      if (!data.name) return { ok: false, error: "A name is required." };
      try {
        await updateProfileAsync(data.name);
        return { ok: true };
      } catch (error) {
        return { ok: false, error: errorMessage(error) };
      }
    },
    [updateProfileAsync],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: userQuery.isLoading,
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
