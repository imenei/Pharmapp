'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, MessageSquare, LogOut, Menu } from 'lucide-react';
import { clsx } from 'clsx';
import { logout } from '@/lib/auth';

const links = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/payments', label: 'Paiements', icon: CreditCard },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/signin');
  };

  return (
    <div className="flex min-h-screen bg-[#E8F5E9]">
      <aside className={clsx('w-64 bg-white flex flex-col border-r border-[#A5D6A7]', 'fixed inset-y-0 left-0 z-40', 'transform transition-transform duration-300 ease-in-out', open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="p-6 border-b border-[#C8E6C9]">
          <div className="flex items-center space-x-3">
            <img src="/pharma-flow-logo.jpg" alt="PHARMA FLOW" className="h-11 w-11 rounded-xl object-cover border border-green-100" />
            <div>
              <h1 className="text-lg font-bold text-[#2E7D32]">PHARMA FLOW</h1>
              <p className="text-xs text-green-600">Administration</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-[#2E7D32] text-white shadow-md' : 'text-green-800 hover:bg-[#E8F5E9] hover:text-green-900',
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#C8E6C9]">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-800 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
            <LogOut size={18} />
            Deconnexion
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <header className="bg-white border-b border-[#C8E6C9] px-6 py-4 flex items-center gap-4">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-[#E8F5E9]">
            <Menu size={20} className="text-[#2E7D32]" />
          </button>
          <span className="font-semibold text-[#2E7D32]">Panneau d&apos;administration</span>
        </header>

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
