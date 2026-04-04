'use client';
// src/app/pharmacist/ratings/page.tsx
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Stars, Empty, Spinner, Avatar } from '@/components/ui';
import Link from 'next/link';

export default function RatingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['pharmacist', 'ratings'],
    queryFn: () => api.get('/suppliers?page=1&limit=100').then(r => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  const suppliers = data?.data?.filter((s: any) => s.reviewsCount > 0) ?? [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes avis donnés</h1>
        <p className="text-gray-500 text-sm mt-1">Fournisseurs que vous avez évalués</p>
      </div>

      {suppliers.length === 0 ? (
        <Empty title="Aucun avis donné" sub="Parcourez les fournisseurs et donnez vos premiers avis" icon={<Star size={48} />} />
      ) : (
        <div className="space-y-3">
          {suppliers.map((s: any) => (
            <Link key={s.id} href={`/pharmacist/suppliers/${s.id}`}
              className="card flex items-center gap-4 hover:shadow-md transition-shadow">
              <Avatar src={s.avatarUrl} name={s.companyName} size={48} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{s.companyName}</p>
                <p className="text-sm text-gray-500">{s.wilaya}</p>
              </div>
              <div className="text-right">
                <Stars rating={s.rating} />
                <p className="text-sm text-gray-600 mt-0.5">{s.rating.toFixed(1)} / 5</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
