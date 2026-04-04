'use client';
// src/app/pharmacist/dashboard/page.tsx
import { Building2, Gift, Bell, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePharmacistDashboard } from '@/hooks/useApi';
import { StatCard, CardSkeleton, Avatar, Empty } from '@/components/ui';

export default function PharmacistDashboard() {
  const { data, isLoading } = usePharmacistDashboard();

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-1/3" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenue sur votre espace pharmacien</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Offres actives" value={data?.offersCount ?? 0} icon={<Gift size={22} />} color="blue" />
        <StatCard title="Fournisseurs" value={data?.suppliersCount ?? 0} icon={<Building2 size={22} />} color="green" />
        <StatCard title="Notifications" value={data?.unreadNotifications ?? 0} icon={<Bell size={22} />} color="yellow" />
        <StatCard title="Activité" value="↑ Active" icon={<TrendingUp size={22} />} color="purple" />
      </div>

      {/* Recent Offers */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Dernières offres</h2>
          <Link href="/pharmacist/offers" className="text-sm text-blue-600 hover:underline">Voir tout →</Link>
        </div>
        {data?.recentOffers?.length === 0 ? (
          <Empty title="Aucune offre disponible" sub="Les fournisseurs n'ont pas encore publié d'offres" icon={<Gift size={48} />} />
        ) : (
          <div className="space-y-3">
            {data?.recentOffers?.map((offer: any) => (
              <div key={offer.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                <Avatar src={offer.supplier?.avatarUrl} name={offer.supplier?.companyName} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{offer.title}</p>
                  <p className="text-sm text-gray-500">{offer.supplier?.companyName} · {offer.supplier?.wilaya}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">Expire</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(offer.expiresAt).toLocaleDateString('fr-DZ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: '/pharmacist/suppliers', label: 'Parcourir les fournisseurs', icon: '🏭', color: 'blue' },
          { href: '/pharmacist/listings-search', label: 'Rechercher des produits', icon: '🔍', color: 'green' },
          { href: '/pharmacist/offers', label: 'Voir les offres', icon: '🎁', color: 'purple' },
        ].map(({ href, label, icon, color }) => (
          <Link key={href} href={href}
            className={`card text-center hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-${color}-200`}>
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
