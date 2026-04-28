// src/lib/auth.ts
import api from './api';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'pharmacist' | 'supplier';
  status: 'pending' | 'approved' | 'rejected';
  profile?: {
    companyName?: string;
    wilaya?: string;
    phone?: string;
    avatarUrl?: string;
    description?: string;
  };
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.user;
}

export async function register(payload: {
  email: string; password: string; role: string;
  companyName: string; wilaya: string; phone?: string; address?: string;
}) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function logout() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) await api.post('/auth/logout', { refreshToken });
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common.Authorization;
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax';
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'));
    }
  }
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
}

export function getDashboardPath(role: string): string {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'pharmacist') return '/pharmacist/dashboard';
  if (role === 'supplier') return '/supplier/dashboard';
  return '/';
}
