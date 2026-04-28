'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { login, getDashboardPath } from '@/lib/auth';
import { useAuth } from '@/lib/providers';

export default function SigninPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      document.cookie = `accessToken=${localStorage.getItem('accessToken')}; path=/; max-age=900`;
      setUser(user);
      if (user.status !== 'approved' && user.role !== 'admin') router.push('/waiting-approval');
      else router.push(getDashboardPath(user.role));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo3.png" alt="PHARMA FLOW" className="h-9 w-9 rounded-xl object-cover" />
            <img 
  src="/1 (2).png" 
  alt="PHARMA FLOW" 
  className="h-8 w-auto object-contain"
/>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#2E7D32] transition-colors">Accueil</Link>
            <Link href="/auth/signup" className="hover:text-[#2E7D32] transition-colors">Inscription</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E8F5E9] rounded-2xl mb-4">
                <img src="/logo3.png" alt="PHARMA FLOW" className="h-12 w-12 rounded-xl object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-[#2E7D32]">Connexion</h2>
              <p className="text-gray-500 text-sm mt-1">Accedez a votre espace professionnel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Adresse email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-[#2E7D32] hover:text-[#1B5E20] hover:underline">
                    Mot de passe oublie ?
                  </Link>
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
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
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

         
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 py-6">
        <p className="text-center text-sm text-gray-500">© 2026 PHARMA FLOW · Tous droits reserves</p>
      </footer>
    </div>
  );
}
