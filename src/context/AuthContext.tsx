import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  is_admin: boolean;
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://electra-production.up.railway.app/api';
const STORAGE_TOKEN_KEY = 'electra_access_token';
const STORAGE_REFRESH_KEY = 'electra_refresh_token';
const STORAGE_USER_KEY = 'electra_user';

function normalizeUser(raw: Omit<AuthUser, 'is_admin'> & Partial<Pick<AuthUser, 'is_admin'>>): AuthUser {
  return {
    ...raw,
    is_admin: Boolean(raw.is_admin),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const saveSession = (accessToken: string, refreshToken: string, authUser: AuthUser) => {
    const normalizedUser = normalizeUser(authUser);

    localStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
    localStorage.setItem(STORAGE_REFRESH_KEY, refreshToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(normalizedUser));
    setToken(accessToken);
    setUser(normalizedUser);
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_REFRESH_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const fetchCurrentUser = async (accessToken: string) => {
    const response = await fetch(`${API_BASE_URL}/me/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Unable to fetch profile information.');
    }

    return response.json().then(payload => normalizeUser(payload as AuthUser));
  };

  const refreshAccessToken = async (refreshToken: string) => {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json().catch(() => null)) as { access?: string } | null;
    return data?.access ?? null;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let mounted = true;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      const storedRefreshToken = localStorage.getItem(STORAGE_REFRESH_KEY);
      const storedUser = localStorage.getItem(STORAGE_USER_KEY);

      if (!storedToken || !storedRefreshToken || !storedUser) {
        clearSession();
        return;
      }

      let parsedUser: AuthUser;
      try {
        parsedUser = normalizeUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        clearSession();
        return;
      }

      if (!mounted) return;
      setToken(storedToken);
      setUser(parsedUser);

      try {
        const currentUser = await fetchCurrentUser(storedToken);
        if (!mounted) return;
        saveSession(storedToken, storedRefreshToken, currentUser);
      } catch {
        const refreshedToken = await refreshAccessToken(storedRefreshToken);
        if (!mounted) return;

        if (!refreshedToken) {
          clearSession();
          return;
        }

        try {
          const currentUser = await fetchCurrentUser(refreshedToken);
          if (!mounted) return;
          saveSession(refreshedToken, storedRefreshToken, currentUser);
        } catch {
          if (!mounted) return;
          clearSession();
        }
      }
    };

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<{ accessToken?: string }>;
      const nextToken = customEvent.detail?.accessToken ?? localStorage.getItem(STORAGE_TOKEN_KEY);

      if (nextToken) {
        setToken(nextToken);
      }
    };

    const handleAuthInvalidated = () => {
      clearSession();
    };

    window.addEventListener('electra-token-refreshed', handleTokenRefreshed as EventListener);
    window.addEventListener('electra-auth-invalidated', handleAuthInvalidated);

    return () => {
      window.removeEventListener('electra-token-refreshed', handleTokenRefreshed as EventListener);
      window.removeEventListener('electra-auth-invalidated', handleAuthInvalidated);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.detail || 'Invalid credentials. Please try again.';
      throw new Error(message);
    }

    const data = await response.json();
    if (!data?.access || !data?.refresh) {
      throw new Error('Authentication response is incomplete. Please try again.');
    }

    const currentUser = await fetchCurrentUser(data.access);
    saveSession(data.access, data.refresh, currentUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.email?.[0] || errorData?.detail || 'Registration failed. Please try again.';
      throw new Error(message);
    }

    const data = await response.json();
    if (!data?.access || !data?.refresh || !data?.user) {
      throw new Error('Registration response is incomplete. Please try again.');
    }

    saveSession(data.access, data.refresh, data.user);
  };

  const signOut = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        signIn,
        register,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
