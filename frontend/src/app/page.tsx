'use client';
// src/app/page.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers';
import { getDashboardPath } from '@/lib/auth';
import { Spinner } from '@/components/ui';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/signin'); return; }
    if (user.status !== 'approved' && user.role !== 'admin') { router.replace('/waiting-approval'); return; }
    router.replace(getDashboardPath(user.role));
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <div className="text-5xl">💊</div>
        <Spinner size="lg" />
        <p className="text-gray-500 text-sm">Chargement…</p>
      </div>
    </div>
  );
}
