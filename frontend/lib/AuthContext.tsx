"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { appParams } from '@/lib/app-params';

// --- 1. Define Types & Interfaces ---

export interface User {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any; 
}

export interface AuthError {
  type: string;
  message: string;
}

export interface AppPublicSettings {
  id?: string;
  public_settings?: any;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: AuthError | null;
  appPublicSettings: AppPublicSettings | null;
  logout: (shouldRedirect?: boolean) => void;
  navigateToLogin: () => void;
  checkAppState: () => Promise<void>;
}

// --- 2. Initialize Context ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- 3. Provider Component ---

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState<boolean>(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [appPublicSettings, setAppPublicSettings] = useState<AppPublicSettings | null>(null);

  const getToken = (): string | null => {
    return appParams?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  };

  useEffect(() => {
    checkAppState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAppState = async (): Promise<void> => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      const token = getToken();
      
      // FIX 1: Safely initialize headers without forcing appId immediately
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // FIX 2: Only add the X-App-Id header if appId actually exists
      if (appParams.appId) {
        headers['X-App-Id'] = appParams.appId;
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // FIX 3: Safe URL construction so we don't accidentally fetch `/by-id/null`
      const settingsUrl = appParams.appId 
        ? `/api/apps/public/prod/public-settings/by-id/${appParams.appId}`
        : `/api/apps/public/prod/public-settings`; // Fallback route if no ID is used

      const response = await fetch(settingsUrl, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 403 && errorData?.extra_data?.reason) {
          const reason = errorData.extra_data.reason;
          if (reason === 'auth_required' || reason === 'user_not_registered') {
            setAuthError({
              type: reason,
              message: reason === 'auth_required' ? 'Authentication required' : 'User not registered for this app'
            });
          } else {
            setAuthError({ type: reason, message: errorData.message || 'Access denied' });
          }
        } else {
          // If the custom settings route doesn't exist yet, we can safely ignore it for local dev
          console.warn('Public settings endpoint failed or missing. Continuing without settings.');
        }
        
        setIsLoadingPublicSettings(false);
        // We don't return here anymore! We let it fall through to check auth anyway.
      } else {
        const publicSettings: AppPublicSettings = await response.json();
        setAppPublicSettings(publicSettings);
        setIsLoadingPublicSettings(false);
      }

      // Now check user auth
      if (token && !authError) {
        await checkUserAuth(token);
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
      }

    } catch (error: any) {
      console.error('App state check failed:', error);
      setAuthError({
        type: 'unknown',
        message: error?.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async (token: string): Promise<void> => {
    try {
      setIsLoadingAuth(true);
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const currentUser: User = await response.json();
      setUser(currentUser);
      setIsAuthenticated(true);
      
    } catch (error: any) {
      console.error('User auth check failed:', error);
      setIsAuthenticated(false);
      
      setAuthError({
        type: 'auth_required',
        message: 'Authentication required'
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect: boolean = true): void => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }

    if (shouldRedirect) {
      window.location.href = '/login'; 
    }
  };

  const navigateToLogin = (): void => {
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';
    window.location.href = `/login?redirectTo=${encodeURIComponent(currentUrl)}`;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- 4. Custom Hook ---

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};