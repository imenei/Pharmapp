'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { logout } from '@/lib/auth';
import { Avatar, Spinner } from '@/components/ui';
import { useChangePassword, useMe } from '@/hooks/useApi';

export default function PharmacistProfilePage() {
  const router = useRouter();
  const { data: me, isLoading, refetch } = useMe();
  const changePassword = useChangePassword();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  const profile = form ?? me?.profile ?? {};

  const save = async () => {
    setSaving(true);
    setMsg('');

    try {
      await api.patch('/pharmacists/profile', profile);
      setMsg('Profil mis a jour');
      refetch();
      setForm(null);
    } catch {
      setMsg('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const update = (k: string, v: string) => setForm((prev: any) => ({ ...(prev ?? profile), [k]: v }));

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg('Mot de passe modifie. Veuillez vous reconnecter.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      await logout();
      router.push('/auth/signin');
      router.refresh();
    } catch (error: any) {
      setPasswordMsg(error.response?.data?.message || 'Impossible de modifier le mot de passe.');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

      <div className="card space-y-5">
        <div className="flex items-center gap-4">
          <Avatar src={me?.profile?.avatarUrl} name={me?.profile?.companyName} size={64} />
          <div>
            <p className="font-semibold text-gray-900">{me?.profile?.companyName ?? 'Non renseigne'}</p>
            <p className="text-sm text-gray-500">{me?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Pharmacien</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Nom de la pharmacie', key: 'companyName' },
            { label: 'Telephone', key: 'phone' },
            { label: 'Wilaya', key: 'wilaya' },
            { label: 'Adresse', key: 'address' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input" value={(form ?? profile)[key] ?? ''} onChange={(e) => update(key, e.target.value)} />
            </div>
          ))}
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea className="input h-24 resize-none" value={(form ?? profile).description ?? ''} onChange={(e) => update('description', e.target.value)} />
          </div>
        </div>

        {msg && <div className={`rounded-lg px-3 py-2 text-sm ${msg.includes('mis a jour') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

        <button onClick={save} className="btn-primary" disabled={saving || !form}>
          {saving ? <Spinner size="sm" /> : 'Sauvegarder'}
        </button>
      </div>

      <div className="card space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Securite</h2>
          <p className="mt-1 text-sm text-gray-500">Modifiez votre mot de passe puis reconnectez-vous avec le nouveau.</p>
        </div>

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="label">Mot de passe actuel</label>
            <input
              type="password"
              className="input"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Nouveau mot de passe</label>
            <input
              type="password"
              className="input"
              minLength={6}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              className="input"
              minLength={6}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
          </div>

          {passwordMsg && (
            <div className={`md:col-span-2 rounded-lg px-4 py-3 text-sm ${passwordMsg.includes('modifie') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {passwordMsg}
            </div>
          )}

          <div className="md:col-span-2">
            <button type="submit" className="btn-primary" disabled={changePassword.isPending}>
              {changePassword.isPending ? <Spinner size="sm" /> : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
