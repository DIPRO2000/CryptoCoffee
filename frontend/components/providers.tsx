"use client";

// Notice we removed the AuthProvider import!
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster /> 
    </>
  );
}