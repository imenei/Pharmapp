'use client';
// src/app/auth/signin/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, getDashboardPath } from '@/lib/auth';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/lib/providers';

export default function SigninPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // Store token in cookie for middleware
      document.cookie = `accessToken=${localStorage.getItem('accessToken')}; path=/; max-age=900`;
      setUser(user);
      if (user.status !== 'approved' && user.role !== 'admin') {
        router.push('/waiting-approval');
      } else {
        router.push(getDashboardPath(user.role));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-4">
            <span className="text-3xl">💊</span>
          </div>
          <h1 className="text-3xl font-bold text-white">El Saidalya</h1>
          <p className="text-blue-200 mt-1">Plateforme Pharma Algérie</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
          <p className="text-gray-500 text-sm mb-6">Accédez à votre espace professionnel</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="vous@exemple.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" className="input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link href="/auth/signup" className="text-blue-700 font-medium hover:underline">S&apos;inscrire</Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4 text-blue-100 text-xs">
          <p className="font-semibold mb-1">🔐 Compte démo admin :</p>
          <p>Email: admin@elsaidalya.dz</p>
          <p>Mot de passe: Admin@123456</p>
        </div>
      </div>
    </div>
  );
}
