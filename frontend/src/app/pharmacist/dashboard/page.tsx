'use client';
// src/app/pharmacist/dashboard/page.tsx

import { Building2, Gift, Bell, TrendingUp, Search } from 'lucide-react';
import Link from 'next/link';
import { usePharmacistDashboard } from '@/hooks/useApi';
import { StatCard, CardSkeleton, Avatar, Empty } from '@/components/ui';

export default function PharmacistDashboard() {
  const { data, isLoading } = usePharmacistDashboard();

  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de bord
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Bienvenue sur votre espace pharmacien
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Offres actives"
          value={data?.offersCount ?? 0}
          icon={<Gift size={22} />}
          color="blue"
        />
        <StatCard
          title="Fournisseurs"
          value={data?.suppliersCount ?? 0}
          icon={<Building2 size={22} />}
          color="green"
        />
        <StatCard
          title="Notifications"
          value={data?.unreadNotifications ?? 0}
          icon={<Bell size={22} />}
          color="yellow"
        />
        <StatCard
          title="Activité"
          value="↑ Active"
          icon={<TrendingUp size={22} />}
          color="purple"
        />
      </div>

      {/* RECENT OFFERS */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            Dernières offres
          </h2>
          <Link
            href="/pharmacist/offers"
            className="text-sm text-blue-600 hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        {data?.recentOffers?.length === 0 ? (
          <Empty
            title="Aucune offre disponible"
            sub="Les fournisseurs n'ont pas encore publié d'offres"
            icon={<Gift size={48} />}
          />
        ) : (
          <div className="space-y-3">
            {data?.recentOffers?.map((offer: any) => (
              <div
                key={offer.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <Avatar
                  src={offer.supplier?.avatarUrl}
                  name={offer.supplier?.companyName}
                  size={44}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {offer.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {offer.supplier?.companyName} ·{' '}
                    {offer.supplier?.wilaya}
                  </p>
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

      {/* QUICK ACTIONS (ICON STYLE STATCARD 🔥) */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            href: '/pharmacist/suppliers',
            label: 'Parcourir les fournisseurs',
            icon: Building2,
            color: 'blue',
          },
          {
            href: '/pharmacist/listings-search',
            label: 'Rechercher des produits',
            icon: Search,
            color: 'green',
          },
          {
            href: '/pharmacist/offers',
            label: 'Voir les offres',
            icon: Gift,
            color: 'purple',
          },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="card flex items-center gap-3 hover:shadow-md transition-all cursor-pointer"
          >
            {/* ICON STYLE LIKE STATCARD */}
            <div
              className={`p-2 rounded-lg flex items-center justify-center ${
                color === 'blue'
                  ? 'bg-blue-100 text-blue-600'
                  : color === 'green'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-purple-100 text-purple-600'
              }`}
            >
              <Icon size={20} />
            </div>

            <p className="text-sm font-medium text-gray-700">
              {label}
            </p>
          </Link>
        ))}
      </div>

    </div>
  );
}