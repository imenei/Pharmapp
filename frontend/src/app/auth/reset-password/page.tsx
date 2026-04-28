'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { useResetPassword } from '@/hooks/useApi';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPassword = useResetPassword();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const tokenMissing = useMemo(() => !token, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const result = await resetPassword.mutateAsync({ token, newPassword });
      setMessage(result.message || 'Mot de passe reinitialise avec succes.');
      setTimeout(() => router.push('/auth/signin'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Impossible de reinitialiser le mot de passe.');
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5E9]">
          <KeyRound className="text-[#2E7D32]" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[#2E7D32]">Nouveau mot de passe</h1>
        <p className="mt-2 text-sm text-gray-500">
          Choisissez un nouveau mot de passe pour votre compte Pharma Flow.
        </p>
      </div>

      {tokenMissing ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Le lien de reinitialisation est incomplet ou invalide.
          </div>
          <Link href="/auth/forgot-password" className="btn-primary block w-full py-3 text-center">
            Demander un nouveau lien
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">Confirmer le mot de passe</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
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

          <button type="submit" className="btn-primary w-full py-3" disabled={resetPassword.isPending}>
            {resetPassword.isPending ? 'Validation...' : 'Reinitialiser le mot de passe'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/auth/signin" className="text-sm font-medium text-[#2E7D32] hover:underline">
          Retour a la connexion
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center p-4">
      <Suspense fallback={<div className="w-full max-w-md rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">Chargement...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
