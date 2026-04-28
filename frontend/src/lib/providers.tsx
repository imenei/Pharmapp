'use client';
// src/lib/providers.tsx
import { useState, createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User, getMe } from './auth';

// ── QueryClient singleton ──────────────────────────────────────────────────
const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,        // 1 min — don't refetch unless data is stale
        gcTime: 5 * 60 * 1000,       // 5 min cache
        retry: 1,
        refetchOnWindowFocus: false,  // Avoid unnecessary refetches
      },
    },
  });

let browserQueryClient: QueryClient | undefined;
const getQueryClient = () => {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
};

// ── Auth Context ───────────────────────────────────────────────────────────
interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  setUser: () => {}, refresh: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) refresh();
    else setLoading(false);

    const handleLogout = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, loading, setUser, refresh }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
