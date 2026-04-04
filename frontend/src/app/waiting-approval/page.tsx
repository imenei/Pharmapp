'use client';
// src/app/waiting-approval/page.tsx
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function WaitingApprovalPage() {
  const router = useRouter();
  const handleLogout = async () => { await logout(); router.push('/auth/signin'); };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Compte en attente</h1>
        <p className="text-gray-600 mb-2">
          Votre compte est en cours de vérification par notre équipe.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Ce processus prend généralement 24 à 48 heures ouvrables.
          Vous serez notifié par email dès l&apos;approbation.
        </p>
        <button onClick={handleLogout} className="btn-secondary w-full py-3">Se déconnecter</button>
      </div>
    </div>
  );
}
