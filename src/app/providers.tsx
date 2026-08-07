"use client";

import { useEffect, type ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { appearanceApi } from "@/lib/api";
import { applyBrandColors } from "@/lib/theme-runtime";

function BrandColorInitializer() {
  useEffect(() => {
    appearanceApi.get().then(applyBrandColors);
  }, []);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrandColorInitializer />
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
