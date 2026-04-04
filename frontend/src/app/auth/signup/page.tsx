'use client';
// src/app/auth/signup/page.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/auth';
import api from '@/lib/api';
import { Spinner } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<{ code: number; nom: string }[]>([]);
  const [role, setRole] = useState<'pharmacist' | 'supplier'>('pharmacist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', companyName: '', wilaya: '', phone: '', address: '',
  });

  useEffect(() => {
    api.get('/wilayas').then(r => setWilayas(r.data)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Mot de passe: minimum 8 caractères'); return; }
    setError(''); setLoading(true);
    try {
      await register({ ...form, role });
      router.push('/auth/signup-success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <span className="text-4xl">💊</span>
          <h1 className="text-2xl font-bold text-white mt-2">Créer un compte</h1>
          <p className="text-blue-200 text-sm">El Saidalya — Plateforme Pharma Algérie</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Role selector */}
          <div className="flex gap-3 mb-6">
            {(['pharmacist', 'supplier'] as const).map(r => (
              <button key={r} type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  role === r ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {r === 'pharmacist' ? '🏥 Pharmacien' : '🏭 Fournisseur'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">
                  {role === 'pharmacist' ? 'Nom de la pharmacie' : 'Nom de la société'} *
                </label>
                <input name="companyName" className="input" required
                  placeholder={role === 'pharmacist' ? 'Pharmacie Al Shifa' : 'Sarl Distribution Pharma'}
                  value={form.companyName} onChange={handleChange} />
              </div>
              <div className="col-span-2">
                <label className="label">Email *</label>
                <input name="email" type="email" className="input" required
                  placeholder="vous@exemple.com" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Mot de passe *</label>
                <input name="password" type="password" className="input" required
                  placeholder="Min. 8 caractères" value={form.password} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input name="phone" className="input" placeholder="0555 123 456"
                  value={form.phone} onChange={handleChange} />
              </div>
              <div className="col-span-2">
                <label className="label">Wilaya *</label>
                <select name="wilaya" className="input" required value={form.wilaya} onChange={handleChange}>
                  <option value="">Sélectionnez une wilaya</option>
                  {wilayas.map(w => <option key={w.code} value={w.nom}>{w.code}. {w.nom}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Adresse</label>
                <input name="address" className="input" placeholder="Adresse complète"
                  value={form.address} onChange={handleChange} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Déjà inscrit ?{' '}
            <Link href="/auth/signin" className="text-blue-700 font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
