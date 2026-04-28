'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useForgotPassword } from '@/hooks/useApi';

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const result = await forgotPassword.mutateAsync({ email });
      setMessage(result.message || 'Si un compte existe, un email de reinitialisation a ete envoye.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible d envoyer le lien pour le moment.');
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5E9]">
            <Mail className="text-[#2E7D32]" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-[#2E7D32]">Mot de passe oublie</h1>
          <p className="mt-2 text-sm text-gray-500">
            Entrez votre email pour recevoir un lien de reinitialisation.
          </p>
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
            />
          </div>

          {message && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-3" disabled={forgotPassword.isPending}>
            {forgotPassword.isPending ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/auth/signin" className="inline-flex items-center gap-2 text-sm font-medium text-[#2E7D32] hover:underline">
            <ArrowLeft size={16} />
            Retour a la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
