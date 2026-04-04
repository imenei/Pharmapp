'use client';
// src/components/pharmacist/Sidebar.tsx
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, FileSearch, Gift, Bell, Star, User, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { logout } from '@/lib/auth';
import { useNotifications } from '@/hooks/useApi';

const links = [
  { href: '/pharmacist/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/pharmacist/suppliers', label: 'Fournisseurs', icon: Building2 },
  { href: '/pharmacist/listings-search', label: 'Recherche produits', icon: FileSearch },
  { href: '/pharmacist/offers', label: 'Offres', icon: Gift },
  { href: '/pharmacist/notifications', label: 'Notifications', icon: Bell },
  { href: '/pharmacist/ratings', label: 'Mes avis', icon: Star },
  { href: '/pharmacist/profile', label: 'Profil', icon: User },
];

export default function PharmacistSidebar() {
  const path = usePathname();
  const router = useRouter();
  const { data: notifData } = useNotifications({ unreadOnly: true });
  const unread = notifData?.unreadCount ?? 0;

  const handleLogout = async () => {
    await logout();
    router.push('/auth/signin');
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-700">💊 El Saidalya</h1>
        <p className="text-xs text-gray-500 mt-0.5">Portail Pharmacien</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          const isNotif = href.includes('notifications');
          return (
            <Link key={href} href={href}
              className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {isNotif && unread > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
