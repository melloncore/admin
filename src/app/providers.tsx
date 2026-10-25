"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { appearanceApi } from "@/lib/api";
import { applyBrandColors } from "@/lib/theme-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function BrandColorInitializer() {
  useEffect(() => {
    appearanceApi
      .get()
      .then(applyBrandColors)
      .catch((error: unknown) => {
        console.error("Unable to load saved appearance settings:", error);
      });
  }, []);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrandColorInitializer />
          {children}
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
