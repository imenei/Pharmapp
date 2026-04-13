'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers';
import { getDashboardPath } from '@/lib/auth';
import api from '@/lib/api';

type Tab = 'pharmacist' | 'supplier';

interface Supplier {
  id: string;
  companyName: string;
  wilaya?: string;
  description?: string;
  avatarUrl?: string;
}

const pharmacistFeatures = [
  {
    title: 'Tableau de bord intelligent',
    desc: 'Visualisez les dernières offres et fournisseurs actifs avec des recommandations personnalisées.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  {
    title: 'Recherche avancée',
    desc: 'Trouvez des produits et fournisseurs par wilaya, nom et type de produits.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  },
  {
    title: 'Listings PDF',
    desc: 'Consultez et téléchargez les catalogues produits des fournisseurs.',
    icon: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 3v6h6" />
      </>
    ),
  },
  {
    title: 'Notation & Avis',
    desc: 'Partagez votre expérience avec les fournisseurs pour aider la communauté.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 10.1c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.616-4.673z" />,
  },
];

const supplierFeatures = [
  {
    title: 'Statistiques détaillées',
    desc: 'Suivez les performances de vos listings avec des analytics avancés.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  },
  {
    title: 'Gestion des listings',
    desc: 'Upload, modification et suppression de vos catalogues PDF.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
  },
  {
    title: 'Offres promotionnelles',
    desc: 'Publiez des offres spéciales avec images et descriptions détaillées.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
  },
  {
    title: 'Abonnements premium',
    desc: 'Maximisez votre visibilité avec nos plans d’abonnement.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
];

function LogoMark() {
  return (
    <img src="/pharma-flow-logo.jpg" alt="PHARMA FLOW" className="h-10 w-10 rounded-2xl object-cover shadow-sm" />
  );
}

function CardIcon({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#E8F5E9] text-[#2E7D32]">
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{children}</svg>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">
      <CardIcon>{icon}</CardIcon>
      <h3 className="mb-3 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('pharmacist');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [goldSuppliers, setGoldSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.status === 'approved' || user.role === 'admin') router.replace(getDashboardPath(user.role));
      else router.replace('/waiting-approval');
    }
  }, [loading, router, user]);

  useEffect(() => {
    async function fetchGoldSuppliers() {
      try {
        const response = await api.get('/suppliers/gold');
        setGoldSuppliers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des fournisseurs premium:', error);
        setGoldSuppliers([]);
      } finally {
        setSuppliersLoading(false);
      }
    }

    fetchGoldSuppliers();
  }, []);

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 text-gray-800">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="text-xl font-bold text-[#2E7D32]">PHARMA FLOW</span>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen((open) => !open)} className="p-2 text-gray-700 transition hover:text-[#2E7D32]">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          <nav className="hidden space-x-8 md:flex">
            <a href="#features" className="text-sm font-medium text-gray-700 transition hover:text-[#2E7D32]">Fonctionnalités</a>
            <a href="#pricing" className="text-sm font-medium text-gray-700 transition hover:text-[#2E7D32]">Abonnements</a>
            <a href="#about" className="text-sm font-medium text-gray-700 transition hover:text-[#2E7D32]">À propos</a>
            <a href="#footer" className="text-sm font-medium text-gray-700 transition hover:text-[#2E7D32]">Contact</a>
          </nav>

          <div className="hidden md:flex">
            <Link href="/auth/signin" className="rounded-lg bg-[#2E7D32] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1B5E20]">
              Se connecter
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mx-4 mt-2 rounded-lg bg-white py-4 shadow-lg md:hidden">
            <div className="flex flex-col space-y-3 px-4">
              {[
                ['#features', 'Fonctionnalités'],
                ['#pricing', 'Abonnements'],
                ['#about', 'À propos'],
                ['#footer', 'Contact'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="py-2 text-sm font-medium text-gray-700 transition hover:text-[#2E7D32]" onClick={() => setIsMenuOpen(false)}>
                  {label}
                </a>
              ))}
              <div className="flex flex-col space-y-3 border-t border-gray-200 pt-3">
                <Link href="/auth/signin" className="text-center text-sm font-medium text-gray-700 transition hover:text-[#2E7D32]" onClick={() => setIsMenuOpen(false)}>
                  Connexion
                </Link>
                <Link href="/auth/signup" className="rounded-lg bg-[#2E7D32] px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition hover:bg-[#1B5E20]" onClick={() => setIsMenuOpen(false)}>
                  Inscription
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="relative min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1024" className="h-full w-full" preserveAspectRatio="none">
            <path d="M0,0 Q400,200 0,600 Q600,800 0,1024 L0,0 Z" fill="white" />
            <path d="M0,0 L1440,0 L1440,1024 L0,1024 Z" fill="#E8F5E9" />
          </svg>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-float1 absolute right-1/4 top-1/4 h-32 w-32 rounded-full bg-[#2E7D32] opacity-5" />
          <div className="animate-float2 absolute bottom-1/3 left-1/3 h-24 w-24 rounded-full bg-[#2E7D32] opacity-10" />
          <div className="animate-float3 absolute right-1/5 top-1/2 h-20 w-20 rounded-full bg-[#2E7D32] opacity-10" />
          <div className="animate-float4 absolute bottom-1/4 left-1/5 h-28 w-28 rounded-full bg-[#2E7D32] opacity-10" />
          <div className="animate-float5 absolute right-2/3 top-1/3 h-16 w-16 rounded-full bg-[#2E7D32] opacity-10" />
          <div className="animate-float6 absolute left-1/4 top-10 h-40 w-40 rounded-full bg-[#4CAF50] opacity-5" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex w-full flex-col items-center md:mt-[-40px] md:flex-row">
            <div className="mb-10 md:mb-0 md:w-1/2 md:pr-8">
              <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-800 md:text-5xl">
                Approvisionnement<span className="text-[#2E7D32]"> pharmaceutique</span> en un clic !
              </h1>
              <p className="mb-10 text-lg leading-relaxed text-gray-700">
                Le trait d&apos;union entre pharmacien et fournisseur.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link href="/auth/signup?role=pharmacist" className="rounded-lg bg-[#2E7D32] px-8 py-3.5 text-center text-sm font-medium text-white shadow-sm transition hover:bg-[#1B5E20]">
                  Commencer en tant que Pharmacien
                </Link>
                <Link href="/auth/signup?role=supplier" className="rounded-lg border border-[#2E7D32] bg-white px-8 py-3.5 text-center text-sm font-medium text-[#2E7D32] transition hover:bg-[#2E7D32] hover:text-white">
                  Devenir Fournisseur
                </Link>
              </div>
            </div>

            <div className="flex justify-center md:w-1/2">
              <img src="/page-destination-pharmacie.png" alt="Plateforme pharmaceutique" className="relative z-10 h-auto max-w-full" style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))' }} />
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float1 { 0%,100%{transform:translateY(0) translateX(0) scale(1)} 50%{transform:translateY(-20px) translateX(10px) scale(1.05)} }
          @keyframes float2 { 0%,100%{transform:translateY(0) translateX(0) scale(1)} 50%{transform:translateY(15px) translateX(-15px) scale(1.03)} }
          @keyframes float3 { 0%,100%{transform:translateY(0) translateX(0) scale(1)} 50%{transform:translateY(-10px) translateX(5px) scale(1.02)} }
          @keyframes float4 { 0%,100%{transform:translateY(0) translateX(0) scale(1)} 50%{transform:translateY(25px) translateX(-10px) scale(1.04)} }
          @keyframes float5 { 0%,100%{transform:translateY(0) translateX(0) scale(1)} 50%{transform:translateY(-15px) translateX(8px) scale(1.06)} }
          @keyframes float6 { 0%,100%{transform:translateY(0) translateX(0) scale(1)} 50%{transform:translateY(-25px) translateX(12px) scale(1.07)} }
          .animate-float1 { animation: float1 6s ease-in-out infinite; }
          .animate-float2 { animation: float2 8s ease-in-out infinite; }
          .animate-float3 { animation: float3 7s ease-in-out infinite; }
          .animate-float4 { animation: float4 9s ease-in-out infinite; }
          .animate-float5 { animation: float5 5s ease-in-out infinite; }
          .animate-float6 { animation: float6 10s ease-in-out infinite; }
        `}</style>
      </section>

      <section id="features" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Des fonctionnalités adaptées à vos besoins</h2>
            <p className="mx-auto max-w-2xl text-gray-600">Découvrez comment PHARMA FLOW peut transformer votre activité pharmaceutique.</p>
          </div>

          <div className="mb-12 flex justify-center">
            <div className="rounded-lg bg-gray-100 p-1">
              <button onClick={() => setActiveTab('pharmacist')} className={`rounded-lg px-8 py-3 text-sm font-medium transition ${activeTab === 'pharmacist' ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-gray-600 hover:text-[#2E7D32]'}`}>
                Pharmaciens
              </button>
              <button onClick={() => setActiveTab('supplier')} className={`rounded-lg px-8 py-3 text-sm font-medium transition ${activeTab === 'supplier' ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-gray-600 hover:text-[#2E7D32]'}`}>
                Fournisseurs
              </button>
            </div>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {(activeTab === 'pharmacist' ? pharmacistFeatures : supplierFeatures).map((feature) => (
              <FeatureCard key={feature.title} title={feature.title} desc={feature.desc} icon={feature.icon} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-white to-green-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Nos Fournisseurs Premium</h2>
            <p className="mx-auto max-w-2xl text-gray-600">Découvrez nos fournisseurs les plus fiables avec l’abonnement Or.</p>
          </div>

          {suppliersLoading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#2E7D32]" />
              <p className="mt-4 text-gray-600">Chargement des fournisseurs...</p>
            </div>
          ) : goldSuppliers.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {goldSuppliers.map((supplier) => (
                <div key={supplier.id} className="transform rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {supplier.avatarUrl ? (
                        <img src={supplier.avatarUrl} alt={supplier.companyName} className="h-16 w-16 rounded-full border-2 border-amber-500 object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-100">
                          <span className="text-2xl font-bold text-amber-600">{supplier.companyName.charAt(0)}</span>
                        </div>
                      )}
                      <div className="mt-2 flex justify-center">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">Premium</span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-gray-800">{supplier.companyName}</h3>
                      <div className="mb-3 flex items-center">
                        <svg className="mr-1 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">{supplier.wilaya || 'Algérie'}</span>
                      </div>
                      {supplier.description && <p className="mb-4 text-sm text-gray-600" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{supplier.description}</p>}
                      <Link href="/auth/signin" className="inline-flex items-center text-sm font-medium text-[#2E7D32] hover:text-[#1B5E20]">
                        Voir le profil
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">Aucun fournisseur premium pour le moment</h3>
              <p className="text-gray-600">Les fournisseurs avec abonnement Or apparaîtront ici.</p>
            </div>
          )}
        </div>
      </section>

      <section id="pricing" className="bg-gradient-to-br from-white to-green-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Des abonnements adaptés à votre activité</h2>
            <p className="mx-auto max-w-2xl text-gray-600">Choisissez le plan qui correspond à vos besoins et développez votre activité.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Bronze',
                price: '10,000 DZD',
                yearly: '100,000 DZD / an',
                cta: 'Choisir Bronze',
                role: '/auth/signup?role=supplier',
                accent: 'text-[#2E7D32] bg-green-50 hover:bg-[#2E7D32] hover:text-white',
                items: ['Visibilité dans les résultats de recherche', "Une semaine d'essai gratuite", 'Accès à toutes les fonctionnalités de base', 'Support standard'],
              },
              {
                name: 'Argent',
                price: '15,000 DZD',
                yearly: '150,000 DZD / an',
                cta: 'Choisir Argent',
                role: '/auth/signup?role=supplier',
                accent: 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]',
                featured: true,
                items: ['Mise en avant dans les résultats de recherche', 'Notifications aux pharmaciens', 'Support prioritaire', 'Statistiques avancées'],
              },
              {
                name: 'Or',
                price: '25,000 DZD',
                yearly: '250,000 DZD / an',
                cta: 'Choisir Or',
                role: '/auth/signup?role=supplier',
                accent: 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white',
                items: ['Priorité maximale dans les résultats', 'Mise à jour quotidienne des listings', 'Notifications immédiates aux pharmaciens', "Annonces sur la page d'accueil", 'Support VIP 24/7'],
              },
            ].map((plan) => (
              <div key={plan.name} className={`relative transform rounded-xl bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${plan.featured ? 'border-2 border-[#2E7D32] shadow-lg' : ''}`}>
                {plan.featured && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2E7D32] px-4 py-1 text-xs font-bold text-white">
                    PLUS POPULAIRE
                  </div>
                )}
                <h3 className={`mb-2 text-xl font-semibold ${plan.featured ? 'text-[#2E7D32]' : 'text-gray-800'}`}>{plan.name}</h3>
                <div className="mb-2 text-3xl font-bold text-gray-900">{plan.price}</div>
                <p className="mb-4 text-sm text-gray-500">par mois</p>
                <div className="mb-4 text-lg font-semibold text-gray-700">{plan.yearly}</div>
                <p className="mb-6 text-sm font-medium text-green-600">(2 mois gratuits)</p>
                <ul className={`mb-8 space-y-3 text-sm text-gray-600 ${plan.featured ? 'text-left' : ''}`}>
                  {plan.items.map((item) => (
                    <li key={item} className={`flex items-center ${plan.featured ? '' : 'justify-center'}`}>
                      <svg className={`mr-2 h-4 w-4 ${plan.name === 'Or' ? 'text-amber-500' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={plan.role} className={`block w-full rounded-lg px-4 py-3 text-sm font-medium transition ${plan.accent}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Pourquoi choisir PHARMA FLOW ?</h2>
            <p className="mx-auto max-w-2xl text-gray-600">Une plateforme conçue spécifiquement pour le marché pharmaceutique algérien.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              ['Sécurisé', 'Plateforme sécurisée avec authentification multi-niveaux et données protégées.'],
              ['Rapide', 'Interface optimisée pour une expérience utilisateur fluide et réactive.'],
              ['Moderne', 'Design responsive qui s’adapte à tous les appareils et navigateurs.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl bg-gradient-to-b from-white to-green-50 p-6 text-center shadow-sm transition duration-300 hover:shadow-md">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[#E8F5E9]" />
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#18391a] to-[#1B5E20] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">Prêt à transformer votre activité ?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-green-100">Rejoignez la plateforme qui modernise l’approvisionnement pharmaceutique en Algérie.</p>
          <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/auth/signup?role=pharmacist" className="rounded-lg bg-white px-8 py-3.5 text-sm font-medium text-[#2E7D32] shadow-sm transition hover:bg-green-50">
              Créer un compte gratuit
            </Link>
            <Link href="/auth/signin" className="rounded-lg border border-white bg-transparent px-8 py-3.5 text-sm font-medium text-white transition hover:bg-white hover:text-[#2E7D32]">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <footer id="footer" className="border-t border-gray-200 bg-white py-12 text-gray-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center">
                <LogoMark />
                <h3 className="ml-3 text-lg font-semibold text-gray-900">PHARMA FLOW</h3>
              </div>
              <p className="text-sm text-gray-600">Le trait d’union entre pharmacien et fournisseur.</p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">Plateforme</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="transition hover:text-green-600">Pharmaciens</a></li>
                <li><a href="#features" className="transition hover:text-green-600">Fournisseurs</a></li>
                <li><a href="#pricing" className="transition hover:text-green-600">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="tel:+213553720952" className="transition hover:text-green-600">+213 553 720 952</a></li>
                <li><a href="mailto:contact@pharmaflow.dz" className="transition hover:text-green-600">contact@pharmaflow.dz</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-gray-900">Accès</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/auth/signin" className="transition hover:text-green-600">Connexion</Link></li>
                <li><Link href="/auth/signup" className="transition hover:text-green-600">Inscription</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-300 pt-8">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <p className="text-sm text-gray-600">© 2026 PHARMA FLOW. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
