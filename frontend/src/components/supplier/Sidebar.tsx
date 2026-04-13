'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Tag, FileText, CreditCard, LogOut, User } from 'lucide-react';
import { logout } from '@/lib/auth';
import { useMe } from '@/hooks/useApi';

const menuItems = [
  { href: '/supplier/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/supplier/offers', label: 'Offres', icon: Tag },
  { href: '/supplier/listings', label: 'Listings PDF', icon: FileText },
  { href: '/supplier/subscription', label: 'Abonnement', icon: CreditCard },
];

export default function SupplierSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useMe();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/signin');
  };

  return (
    <div className="w-64 bg-[#E8F5E9] text-gray-800 min-h-screen p-4 flex flex-col border-r border-[#A5D6A7]">
      <div className="mb-8 pt-2">
        <div className="flex items-center space-x-3">
          <img src="/pharma-flow-logo.jpg" alt="PHARMA FLOW" className="h-11 w-11 rounded-xl object-cover shadow-sm border border-green-100" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-[#2E7D32] leading-tight">PHARMA FLOW</h1>
            <span className="text-sm text-green-600 font-medium">Espace Fournisseur</span>
          </div>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link href={href} className={`flex items-center p-3 rounded-lg transition-colors ${active ? 'bg-[#2E7D32] text-white font-semibold shadow-md' : 'text-green-800 hover:bg-green-200 hover:text-green-900'}`}>
                  <Icon className="h-5 w-5 mr-3" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="pt-4 border-t border-[#A5D6A7] mt-auto">
        {me ? (
          <>
            <Link href="/supplier/profile" className="flex items-center p-3 text-green-800 hover:bg-green-200 rounded-lg transition-colors mb-2">
              <div className="flex items-center justify-center bg-green-200 rounded-full h-10 w-10 shrink-0 overflow-hidden">
                {me.profile?.avatarUrl ? <img src={me.profile.avatarUrl} alt="" className="h-10 w-10 object-cover" /> : <User className="h-5 w-5 text-green-700" />}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{me.profile?.companyName || 'Fournisseur'}</p>
                <p className="text-xs text-green-600 truncate">{me.email}</p>
                {me.profile?.wilaya && <p className="text-xs text-green-500 truncate">{me.profile.wilaya}</p>}
              </div>
            </Link>
            <button onClick={handleLogout} className="flex items-center w-full p-3 text-green-800 hover:bg-green-200 rounded-lg transition-colors">
              <LogOut className="h-5 w-5 mr-3 text-green-700" />
              Deconnexion
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
