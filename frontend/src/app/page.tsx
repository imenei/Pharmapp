'use client';
// src/app/page.tsx — Landing page publique El Saidaliya
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/providers';
import { getDashboardPath } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface GoldSupplier { id: string; companyName: string; wilaya?: string; description?: string; avatarUrl?: string; }

// ── SVG Icons ──────────────────────────────────────────────────────────────
const Icons = {
  Pill: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="m10.5 20.5-7-7a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 1 1-7 7Z"/>
      <path d="m8.5 8.5 7 7"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  Check: ({ gold = false }: { gold?: boolean }) => (
    <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${gold ? 'text-amber-500' : 'text-[#2E7D32]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8m8 4H8m8 4H8"/>
    </svg>
  ),
  Gift: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.123 2.123 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.123 2.123 0 0 0 1.597-1.16z"/>
    </svg>
  ),
  BarChart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
  ),
  Crown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
    </svg>
  ),
  Monitor: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8m-4-4v4"/>
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 inline mr-1">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-1 inline">
      <path d="M5 12h14m-7-7 7 7-7 7"/>
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 inline mr-2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.92 3.38a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 inline mr-2">
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  HelpCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 inline mr-2">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01"/>
    </svg>
  ),
  Medal: ({ color = 'text-gray-400' }: { color?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`w-8 h-8 ${color}`}>
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-amber-400">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  Sparkles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 mr-1">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
    </svg>
  ),
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'pharmacist' | 'supplier'>('pharmacist');
  const [menuOpen, setMenuOpen] = useState(false);
  const [goldSuppliers, setGoldSuppliers] = useState<GoldSupplier[]>([]);
  const [suppLoading, setSuppLoading] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.status === 'approved' || user.role === 'admin') router.replace(getDashboardPath(user.role));
      else router.replace('/waiting-approval');
    }
  }, [user, loading, router]);

  useEffect(() => {
    api.get('/suppliers/gold').then(r => setGoldSuppliers(r.data)).catch(() => {}).finally(() => setSuppLoading(false));
  }, []);

  if (loading || user) return null;

  const pharmacistFeatures = [
    { icon: <Icons.Search />, t: 'Recherche avancée', d: 'Trouvez des produits par wilaya, nom et type de médicament.' },
    { icon: <Icons.FileText />, t: 'Listings PDF', d: 'Consultez et téléchargez les catalogues fournisseurs.' },
    { icon: <Icons.Gift />, t: 'Offres promotionnelles', d: 'Accédez aux promotions fournisseurs en temps réel.' },
    { icon: <Icons.Star />, t: 'Notation & Avis', d: 'Partagez votre expérience pour aider la communauté.' },
  ];

  const supplierFeatures = [
    { icon: <Icons.BarChart />, t: 'Statistiques détaillées', d: 'Suivez les performances de vos listings et visibilité.' },
    { icon: <Icons.Upload />, t: 'Gestion des listings', d: 'Upload, modification et suppression de vos PDF.' },
    { icon: <Icons.Gift />, t: 'Offres promotionnelles', d: 'Publiez des offres spéciales avec images produits.' },
    { icon: <Icons.Crown />, t: 'Abonnements premium', d: 'Maximisez votre visibilité avec nos plans avancés.' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 text-[#2E7D32]">
                <Icons.Pill />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">ELSAIDALIYA</span>
            </div>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#features" className="text-gray-600 hover:text-[#2E7D32] transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-gray-600 hover:text-[#2E7D32] transition-colors">Abonnements</a>
              <a href="#about" className="text-gray-600 hover:text-[#2E7D32] transition-colors">À propos</a>
              <Link href="/contact" className="text-gray-600 hover:text-[#2E7D32] transition-colors">Contact</Link>
              <Link href="/auth/signin" className="bg-[#2E7D32] text-white px-4 py-2 rounded-lg hover:bg-[#1B5E20] transition-colors text-sm font-medium">
                Se connecter
              </Link>
            </nav>
          </div>

          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-3">
                {[['#features', 'Fonctionnalités'], ['#pricing', 'Abonnements'], ['#about', 'À propos']].map(([href, label]) => (
                  <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-gray-600 hover:text-[#2E7D32] py-1.5 text-sm font-medium">{label}</a>
                ))}
                <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-gray-600 hover:text-[#2E7D32] py-1.5 text-sm font-medium">Contact</Link>
                <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                  <Link href="/auth/signin" onClick={() => setMenuOpen(false)} className="bg-[#2E7D32] text-white px-4 py-2.5 rounded-lg text-sm font-medium text-center">Se connecter</Link>
                  <Link href="/auth/signup" onClick={() => setMenuOpen(false)} className="border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium text-center">S&apos;inscrire</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* HERO - avec padding bottom réduit pour coller à la bande */}
      <section className="bg-[#F0F7F0] border-b border-gray-100 relative overflow-hidden">
        {/* Cercles décoratifs animés */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[8%] right-[3%] w-72 h-72 rounded-full bg-[#C8E6C9] opacity-50 animate-pulse" 
               style={{ animationDuration: '8s' }}/>
          
          <div className="absolute top-[40%] right-[22%] w-44 h-44 rounded-full bg-[#A5D6A7] opacity-35 animate-bounce"
               style={{ animationDuration: '12s', animationDelay: '1s' }}/>
          
          <div className="absolute bottom-[8%] right-[6%] w-56 h-56 rounded-full bg-[#C8E6C9] opacity-30 animate-pulse"
               style={{ animationDuration: '10s', animationDelay: '2s' }}/>
          
          <div className="absolute bottom-[25%] left-[3%] w-36 h-36 rounded-full bg-[#A5D6A7] opacity-25"
               style={{ animation: 'float 15s ease-in-out infinite' }}/>
          
          <div className="absolute top-[5%] left-[42%] w-24 h-24 rounded-full bg-[#C8E6C9] opacity-35"
               style={{ animation: 'slowSpin 20s linear infinite' }}/>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-0 md:pt-28 md:pb-0 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-16">
            <div className="md:w-1/2 pb-12 md:pb-16">
              <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-[#C8E6C9]">
                <div className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full animate-pulse" />
                Plateforme pharmaceutique algérienne
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-[1.15] tracking-tight">
                Approvisionnement <span className="text-[#2E7D32]">pharmaceutique</span> simplifié
              </h1>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                Le trait d&apos;union entre pharmacien et fournisseur en Algérie — trouvez, comparez et commandez en quelques clics.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth/signup" className="bg-[#2E7D32] text-white px-6 py-3 rounded-lg hover:bg-[#1B5E20] transition-colors text-sm font-semibold text-center shadow-sm">
                  Commencer en tant que Pharmacien
                </Link>
                <Link href="/auth/signup" className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-lg hover:border-[#2E7D32] hover:text-[#2E7D32] transition-colors text-sm font-semibold text-center">
                  Devenir Fournisseur
                </Link>
              </div>
            </div>

            {/* Image pharmacien - alignée en bas pour que les pieds touchent la bande verte */}
            <div className="md:w-1/2 flex justify-center md:justify-end mt-0">
              <img
                src="/pharma.png"
                alt="Pharmacien avec médicaments"
                className="w-full max-w-xs md:max-w-sm lg:max-w-md object-contain select-none mb-0"
                draggable={false}
                style={{ marginBottom: '-8px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#2E7D32] py-8 relative z-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 divide-x divide-green-600">
            {[
              { n: '2 400+', l: 'Pharmaciens inscrits' },
              { n: '350+', l: 'Fournisseurs actifs' },
              { n: '48', l: 'Wilayas couvertes' },
            ].map(({ n, l }) => (
              <div key={l} className="text-center px-4">
                <div className="text-2xl font-bold text-white">{n}</div>
                <div className="text-green-200 text-xs mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Fonctionnalités adaptées à vos besoins</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">Découvrez comment ELSAIDALIYA transforme l&apos;approvisionnement pharmaceutique en Algérie</p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              {(['pharmacist', 'supplier'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-white text-[#2E7D32] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t === 'pharmacist' ? 'Pharmaciens' : 'Fournisseurs'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {(tab === 'pharmacist' ? pharmacistFeatures : supplierFeatures).map(({ icon, t, d }) => (
              <div key={t} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 hover:border-[#A5D6A7] hover:bg-[#F9FDF9] transition-all group">
                <div className="w-10 h-10 bg-[#E8F5E9] text-[#2E7D32] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#2E7D32] group-hover:text-white transition-colors">
                  <div className="w-5 h-5">{icon}</div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm">{t}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GOLD SUPPLIERS */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-amber-100">
              <Icons.Crown />
              <span className="ml-1">Abonnement Or</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Nos Fournisseurs Premium</h2>
            <p className="text-gray-500 text-sm">Les fournisseurs les plus fiables de la plateforme</p>
          </div>

          {suppLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : goldSuppliers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goldSuppliers.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {s.avatarUrl
                        ? <img src={s.avatarUrl} alt={s.companyName} className="w-12 h-12 object-cover" />
                        : <span className="text-lg font-bold text-amber-600">{s.companyName.charAt(0)}</span>}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{s.companyName}</h3>
                      {s.wilaya && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center">
                          <Icons.MapPin />{s.wilaya}
                        </p>
                      )}
                    </div>
                    <span className="ml-auto flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                      <Icons.Sparkles />Or
                    </span>
                  </div>
                  {s.description && <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{s.description}</p>}
                  <Link href="/auth/signin" className="text-[#2E7D32] hover:text-[#1B5E20] text-xs font-semibold flex items-center">
                    Voir le profil <Icons.ArrowRight />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 text-amber-300 flex items-center justify-center">
                <Icons.Trophy />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Aucun fournisseur premium pour le moment</h3>
              <p className="text-xs text-gray-400">Les fournisseurs avec abonnement Or apparaîtront ici.</p>
            </div>
          )}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Abonnements adaptés à votre activité</h2>
            <p className="text-gray-500 text-sm">Choisissez le plan qui correspond à vos besoins</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Bronze */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-orange-400"><Icons.Medal color="text-orange-400" /></div>
                <span className="font-bold text-gray-800">Bronze</span>
              </div>
              <div className="mb-5">
                <span className="text-3xl font-bold text-gray-900">10 000</span>
                <span className="text-gray-400 text-sm ml-1">DZD / mois</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {["Visibilité dans les résultats", "Semaine d'essai gratuite", "Fonctionnalités de base", "Support standard"].map(f => (
                  <li key={f} className="flex items-center text-xs text-gray-600"><Icons.Check />{f}</li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full text-center bg-gray-50 text-gray-700 border border-gray-100 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold">
                Choisir Bronze
              </Link>
            </div>

            {/* Argent — highlighted */}
            <div className="bg-[#2E7D32] rounded-2xl p-6 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                PLUS POPULAIRE
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-gray-300"><Icons.Medal color="text-gray-300" /></div>
                <span className="font-bold text-white">Argent</span>
              </div>
              <div className="mb-5">
                <span className="text-3xl font-bold text-white">15 000</span>
                <span className="text-green-200 text-sm ml-1">DZD / mois</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {["Mise en avant dans les résultats", "Notifications aux pharmaciens", "Support prioritaire", "Statistiques avancées"].map(f => (
                  <li key={f} className="flex items-center text-xs text-green-100">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full text-center bg-white text-[#2E7D32] py-2.5 rounded-lg hover:bg-green-50 transition-colors text-sm font-bold">
                Choisir Argent
              </Link>
            </div>

            {/* Or */}
            <div className="bg-white border border-amber-100 rounded-2xl p-6 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-amber-500"><Icons.Medal color="text-amber-500" /></div>
                <span className="font-bold text-gray-800">Or</span>
              </div>
              <div className="mb-5">
                <span className="text-3xl font-bold text-gray-900">25 000</span>
                <span className="text-gray-400 text-sm ml-1">DZD / mois</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {["Priorité maximale dans les résultats", "Mise à jour quotidienne des listings", "Notifications immédiates", "Annonces sur la page d'accueil", "Support VIP 24/7"].map(f => (
                  <li key={f} className="flex items-center text-xs text-gray-600"><Icons.Check gold />{f}</li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full text-center bg-amber-50 text-amber-700 border border-amber-100 py-2.5 rounded-lg hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors text-sm font-semibold">
                Choisir Or
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Pourquoi choisir Elsaidaliya ?</h2>
            <p className="text-gray-500 text-sm">Une plateforme conçue pour le marché pharmaceutique algérien</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Icons.Shield />, t: 'Sécurisé', d: 'Authentification multi-niveaux et données cryptées pour protéger votre activité.' },
              { icon: <Icons.Zap />, t: 'Rapide', d: 'Interface optimisée pour une expérience fluide et réactive sur tous vos appareils.' },
              { icon: <Icons.Monitor />, t: 'Moderne', d: "Design responsive adapté à tous les appareils, du mobile au bureau." },
            ].map(({ icon, t, d }) => (
              <div key={t} className="bg-white p-6 rounded-xl border border-gray-100 text-center hover:shadow-sm transition-all">
                <div className="w-14 h-14 bg-[#E8F5E9] text-[#2E7D32] rounded-xl flex items-center justify-center mx-auto mb-4">
                  {icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">{t}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1B5E20]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Prêt à transformer votre activité ?</h2>
          <p className="text-green-200 text-sm mb-8">Rejoignez la plateforme qui modernise l&apos;approvisionnement pharmaceutique en Algérie</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/auth/signup" className="bg-white text-[#2E7D32] px-6 py-3 rounded-lg hover:bg-green-50 transition-colors text-sm font-semibold shadow-sm">
              Créer un compte gratuit
            </Link>
            <Link href="/auth/signin" className="border border-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 text-[#2E7D32]"><Icons.Pill /></div>
                <span className="font-bold text-gray-900 tracking-tight">ELSAIDALIYA</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">Le trait d&apos;union entre pharmacien et fournisseur en Algérie.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Plateforme</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#features" className="hover:text-[#2E7D32] transition-colors">Pharmaciens</a></li>
                <li><a href="#features" className="hover:text-[#2E7D32] transition-colors">Fournisseurs</a></li>
                <li><a href="#pricing" className="hover:text-[#2E7D32] transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="tel:+213553720952" className="hover:text-[#2E7D32] transition-colors flex items-center"><Icons.Phone />+213 553 720 952</a></li>
                <li><a href="mailto:contact@elsaidaliya.com" className="hover:text-[#2E7D32] transition-colors flex items-center"><Icons.Mail />contact@elsaidaliya.com</a></li>
                <li><Link href="/contact" className="hover:text-[#2E7D32] transition-colors flex items-center"><Icons.HelpCircle />Centre d&apos;aide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">Légal</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="/legal" className="hover:text-[#2E7D32] transition-colors">Conditions d&apos;utilisation</Link></li>
                <li><Link href="/legal" className="hover:text-[#2E7D32] transition-colors">Confidentialité</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-gray-300">© 2026 Elsaidaliya. Tous droits réservés.</p>
            <p className="text-xs text-gray-300">Fait avec soin pour le marché pharmaceutique algérien</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(5px); }
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}