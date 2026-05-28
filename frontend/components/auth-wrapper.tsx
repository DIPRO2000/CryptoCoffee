"use client";

import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError'; // Adjust path if needed

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // 1. Show loading spinner
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Handle errors / redirects
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Calls your SDK's redirect method
      navigateToLogin(); 
      return null; // Return null so nothing renders while redirecting
    }
  }

  // 3. If everything is good, render the page
  return <>{children}</>;
}