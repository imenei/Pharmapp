'use client';
// src/components/supplier/Sidebar.tsx
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Gift, User, CreditCard, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { logout } from '@/lib/auth';

const links = [
  { href: '/supplier/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/supplier/listings', label: 'Mes listings', icon: FileText },
  { href: '/supplier/offers', label: 'Mes offres', icon: Gift },
  { href: '/supplier/subscription', label: 'Abonnement', icon: CreditCard },
  { href: '/supplier/profile', label: 'Profil', icon: User },
];

export default function SupplierSidebar() {
  const path = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/signin');
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-700">💊 El Saidalya</h1>
        <p className="text-xs text-gray-500 mt-0.5">Portail Fournisseur</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
          <LogOut size={18} /><span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
