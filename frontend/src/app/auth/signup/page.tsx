'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Spinner } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [wilayas, setWilayas] = useState<{ code: number; nom: string }[]>([]);
  const [role, setRole] = useState<'pharmacist' | 'supplier'>('pharmacist');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registerFile, setRegisterFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    email: '', password: '', companyName: '', wilaya: '', phone: '', address: '',
  });

  useEffect(() => {
    api.get('/wilayas').then((r) => setWilayas(r.data)).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 2MB');
      return;
    }
    setError('');
    setRegisterFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (!registerFile) {
      setError('Le registre de commerce est obligatoire');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('companyName', form.companyName);
      formData.append('wilaya', form.wilaya);
      formData.append('phone', form.phone);
      formData.append('address', form.address);
      formData.append('role', role);
      formData.append('registerFile', registerFile);

      await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push('/auth/signup-success');
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#2E7D32] rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Créer un compte professionnel</h2>
          <p className="mt-2 text-sm text-gray-600">Rejoignez la plateforme PHARMA FLOW</p>
        </div>

        {/* Erreurs */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Erreur</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vous êtes *</label>
            <div className="flex gap-3">
              {(['pharmacist', 'supplier'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    role === r
                      ? 'border-[#2E7D32] bg-[#E8F5E9] text-[#2E7D32]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r === 'pharmacist' ? 'Pharmacien' : 'Fournisseur'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raison sociale */}
            <div className="md:col-span-2">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                {role === 'pharmacist' ? 'Nom de la pharmacie' : 'Nom de la société'} *
              </label>
              <input
                type="text" id="companyName" name="companyName" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-none transition-all"
                placeholder={role === 'pharmacist' ? 'Pharmacie Al Shifa' : 'SARL Distribution Pharma'}
                value={form.companyName} onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email" id="email" name="email" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-none transition-all"
                placeholder="votre@email.com"
                value={form.email} onChange={handleChange}
              />
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel" id="phone" name="phone"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-none transition-all"
                placeholder="0555 12 34 56"
                value={form.phone} onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password" name="password" required minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-none transition-all pr-10"
                  placeholder="Minimum 8 caractères"
                  value={form.password} onChange={handleChange}
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Wilaya */}
            <div>
              <label htmlFor="wilaya" className="block text-sm font-medium text-gray-700 mb-2">Wilaya *</label>
              <select
                id="wilaya" name="wilaya" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-none transition-all"
                value={form.wilaya} onChange={handleChange}
              >
                <option value="">Sélectionnez une wilaya</option>
                {wilayas.map((w) => (
                  <option key={w.code} value={w.nom}>{w.code}. {w.nom}</option>
                ))}
              </select>
            </div>

            {/* Adresse */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <input
                type="text" id="address" name="address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E7D32] focus:border-[#2E7D32] outline-none transition-all"
                placeholder="Adresse complète"
                value={form.address} onChange={handleChange}
              />
            </div>

            {/* Registre de commerce */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registre de commerce scanné *
              </label>
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <svg className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <p className="text-sm text-yellow-700">Le document doit être un scan clair et lisible de votre registre de commerce officiel.</p>
              </div>
              <input
                type="file" id="registerFile" accept=".jpg,.jpeg,.png,.pdf"
                className="sr-only" onChange={handleFileChange} required
              />
              <label
                htmlFor="registerFile"
                className="cursor-pointer flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-[#2E7D32] rounded-lg hover:bg-[#E8F5E9] transition-colors"
              >
                <svg className="h-8 w-8 text-[#2E7D32] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <span className="text-sm font-medium text-[#2E7D32]">Cliquez pour télécharger votre registre</span>
                <span className="text-xs text-gray-500 mt-1">JPG, PNG ou PDF — max 2MB</span>
              </label>
              {registerFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-700">{registerFile.name}</p>
                      <p className="text-xs text-gray-500">{(registerFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setRegisterFile(null)} className="text-red-500 hover:text-red-700 text-sm">
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#E8F5E9] p-4 rounded-lg text-sm text-gray-700 flex items-start gap-2">
            <svg className="h-5 w-5 text-[#2E7D32] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>Votre compte sera examiné par un administrateur après vérification de votre registre de commerce. Vous serez notifié par email une fois approuvé.</p>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading || !registerFile}
            className="w-full py-3 px-4 bg-[#2E7D32] text-white rounded-lg font-medium hover:bg-[#1B5E20] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Création en cours...
              </span>
            ) : (
              'Créer mon compte'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Déjà inscrit ?{' '}
              <Link href="/auth/signin" className="text-[#2E7D32] hover:text-[#1B5E20] font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}