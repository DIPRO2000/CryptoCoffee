"use client";

import { AuthProvider } from '@/lib/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { AuthWrapper } from "./auth-wrapper";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* The wrapper intercepts rendering until auth is ready */}
      <AuthWrapper>
        {children}
      </AuthWrapper>
      <Toaster />
    </AuthProvider>
  );
}