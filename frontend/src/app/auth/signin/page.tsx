'use client';
// src/app/auth/signin/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { login, getDashboardPath } from '@/lib/auth';
import { useAuth } from '@/lib/providers';

export default function SigninPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      document.cookie = `accessToken=${localStorage.getItem('accessToken')}; path=/; max-age=900`;
      setUser(user);
      if (user.status !== 'approved' && user.role !== 'admin') router.push('/waiting-approval');
      else router.push(getDashboardPath(user.role));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col">

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-2xl font-bold text-[#2E7D32]">ELSAIDALIYA</span>
          <nav className="hidden md:flex space-x-8 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#2E7D32] transition-colors">Accueil</Link>
            <Link href="/auth/signup" className="hover:text-[#2E7D32] transition-colors">Inscription</Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E8F5E9] rounded-2xl mb-4">
                <span className="text-3xl">💊</span>
              </div>
              <h2 className="text-2xl font-bold text-[#2E7D32]">Connexion</h2>
              <p className="text-gray-500 text-sm mt-1">Accédez à votre espace professionnel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Adresse email</label>
                <input
                  type="email" className="input" placeholder="vous@exemple.com"
                  value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                />
              </div>

              <div>
                <label className="label">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'} className="input pr-10"
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Connexion…
                  </span>
                ) : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link href="/auth/signup" className="text-[#2E7D32] font-semibold hover:text-[#1B5E20] hover:underline">
                  S&apos;inscrire gratuitement
                </Link>
              </p>
            </div>
          </div>

          {/* Demo */}
          <div className="mt-4 bg-white/60 backdrop-blur rounded-xl p-4 text-sm text-green-800 border border-green-200">
            <p className="font-semibold mb-1">🔐 Compte démo admin :</p>
            <p>Email : <span className="font-mono">admin@elsaidalya.dz</span></p>
            <p>Mot de passe : <span className="font-mono">Admin@123456</span></p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <p className="text-center text-sm text-gray-500">
          © 2026 El Saidaliya · Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
