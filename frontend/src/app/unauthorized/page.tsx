'use client';
import Link from 'next/link';
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
        <p className="text-gray-600 mb-8">Vous n&apos;avez pas les permissions pour accéder à cette page.</p>
        <Link href="/" className="btn-primary w-full py-3 block">Retour à l&apos;accueil</Link>
      </div>
    </div>
  );
}
