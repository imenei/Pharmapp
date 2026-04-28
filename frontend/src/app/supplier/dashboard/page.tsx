'use client';

import { Eye, Download, Star, FileText, Crown, List, Gift } from 'lucide-react';
import Link from 'next/link';
import { useSupplierStats, useSupplierSubscription } from '@/hooks/useApi';
import { StatCard, CardSkeleton, TierBadge } from '@/components/ui';

export default function SupplierDashboard() {
  const { data: stats, isLoading } = useSupplierStats();
  const { data: sub } = useSupplierSubscription();

  const isSubActive =
    sub &&
    (sub.accessGranted || sub.isActive) &&
    sub.subscriptionEnd &&
    new Date(sub.subscriptionEnd) > new Date();
  const isPendingReview = sub && !sub.trialActive && !sub.isActive && sub.status === 'pending';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm">Vue d&apos;ensemble de votre activité</p>
        </div>
        {isSubActive && <TierBadge tier={sub.subscriptionPlan?.tier} />}
      </div>

      {!isSubActive && !isPendingReview && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Crown size={20} className="text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">Abonnement inactif</p>
            <p className="text-sm text-amber-700">
              Vous pouvez consulter votre espace, mais les actions de publication resteront bloquées jusqu&apos;à l&apos;approbation du paiement.
            </p>
          </div>
          <Link href="/supplier/subscription" className="btn-primary text-sm px-4 py-2">
            S&apos;abonner
          </Link>
        </div>
      )}

      {isPendingReview && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <Crown size={20} className="text-blue-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-blue-800">Paiement en cours de vérification</p>
            <p className="text-sm text-blue-700">
              Votre reçu a été envoyé. Tant que le paiement n&apos;est pas approuvé, vous pouvez consulter votre espace mais pas publier de contenu.
            </p>
          </div>
          <Link href="/supplier/subscription" className="btn-secondary text-sm px-4 py-2">
            Voir l&apos;abonnement
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total vues" value={(stats?.totalViews ?? 0).toLocaleString()} icon={<Eye size={22} />} color="blue" />
        <StatCard title="Téléchargements" value={(stats?.totalDownloads ?? 0).toLocaleString()} icon={<Download size={22} />} color="green" />
        <StatCard title="Note moyenne" value={`${(stats?.averageRating ?? 0).toFixed(1)}/5`} icon={<Star size={22} />} color="yellow" sub={`${stats?.totalRatings ?? 0} avis`} />
        <StatCard title="Listings actifs" value={stats?.totalListings ?? 0} icon={<FileText size={22} />} color="purple" sub={`${stats?.activeOffers ?? 0} offres`} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            href: '/supplier/listings',
            label: 'Gérer mes listings',
            icon: <List size={28} className="text-blue-600" />,
            desc: isSubActive ? 'Upload & gérer vos catalogues PDF' : 'Consultation seulement avant validation',
          },
          {
            href: '/supplier/offers',
            label: 'Gérer mes offres',
            icon: <Gift size={28} className="text-green-600" />,
            desc: isSubActive ? 'Créer des offres promotionnelles' : 'Publication bloquée avant validation',
          },
          {
            href: '/supplier/subscription',
            label: 'Mon abonnement',
            icon: <Crown size={28} className="text-amber-500" />,
            desc: 'Gérer votre plan & visibilité',
          },
        ].map(({ href, label, icon, desc }) => (
          <Link key={href} href={href} className="card text-center hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex justify-center mb-3">{icon}</div>
            <p className="font-semibold text-gray-900 mb-1">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </Link>
        ))}
      </div>

      {isSubActive && (
        <div className="card border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
          <div className="flex items-center gap-4">
            <Crown size={32} className="text-amber-500" />
            <div>
              <p className="font-semibold text-gray-900">Plan {sub.subscriptionPlan?.name} actif</p>
              <p className="text-sm text-gray-600">
                Valide jusqu&apos;au {new Date(sub.subscriptionEnd).toLocaleDateString('fr-DZ')}
              </p>
              {sub.trialActive && <p className="text-sm text-emerald-700">Periode d&apos;essai gratuite active.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
