'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Pencil } from 'lucide-react';
import { Avatar, Spinner } from '@/components/ui';
import { useChangePassword, useMe, useSupplierSubscription, useUpdateSupplierProfile, useWilayas } from '@/hooks/useApi';
import { logout } from '@/lib/auth';

export default function SupplierProfilePage() {
  const router = useRouter();
  const { data: me, isLoading, refetch } = useMe();
  const { data: wilayas = [] } = useWilayas();
  const { data: sub } = useSupplierSubscription();
  const update = useUpdateSupplierProfile();
  const changePassword = useChangePassword();
  const avatarRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');

  const isSubActive =
    sub &&
    (sub.accessGranted || sub.isActive) &&
    sub.subscriptionEnd &&
    new Date(sub.subscriptionEnd) > new Date();

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  const profile = form ?? me?.profile ?? {};
  const set = (k: string, v: string) => setForm((p: any) => ({ ...(p ?? profile), [k]: v }));

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      return;
    }

    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
    if (!form) {
      setForm({ ...profile });
    }
  };

  const handleSave = async () => {
    const fd = new FormData();
    const data = form ?? {};

    Object.entries(data).forEach(([k, v]) => {
      if (v != null) {
        fd.append(k, v as string);
      }
    });

    if (avatarFile) {
      fd.append('avatar', avatarFile);
    }

    setMsg('');

    try {
      await update.mutateAsync(fd);
      setMsg('Profil mis a jour avec succes');
      setForm(null);
      setAvatarFile(null);
      refetch();
    } catch {
      setMsg('Erreur lors de la sauvegarde');
    }
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        {!isSubActive && (
          <span className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            <Lock size={14} /> Lecture seule
          </span>
        )}
      </div>

      {!isSubActive && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Le profil reste visible, mais les modifications sont bloquees jusqu&apos;a l&apos;approbation du paiement.
        </div>
      )}

      <div className="card space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar src={avatarPreview ?? me?.profile?.avatarUrl} name={me?.profile?.companyName} size={80} />
            {isSubActive && (
              <>
                <button onClick={() => avatarRef.current?.click()} className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs text-white hover:bg-blue-700">
                  <Pencil size={12} />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{me?.profile?.companyName ?? 'Votre societe'}</p>
            <p className="text-sm text-gray-500">{me?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Fournisseur</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nom de la societe</label>
            <input className="input" value={profile.companyName ?? ''} onChange={(e) => set('companyName', e.target.value)} readOnly={!isSubActive} />
          </div>
          <div>
            <label className="label">Telephone</label>
            <input className="input" value={profile.phone ?? ''} onChange={(e) => set('phone', e.target.value)} readOnly={!isSubActive} />
          </div>
          <div>
            <label className="label">Wilaya</label>
            {isSubActive ? (
              <select className="input" value={profile.wilaya ?? ''} onChange={(e) => set('wilaya', e.target.value)}>
                <option value="">Selectionner...</option>
                {wilayas.map((w: any) => <option key={w.code} value={w.nom}>{w.code}. {w.nom}</option>)}
              </select>
            ) : (
              <input className="input" value={profile.wilaya ?? ''} readOnly />
            )}
          </div>
          <div className="col-span-2">
            <label className="label">Adresse</label>
            <input className="input" value={profile.address ?? ''} onChange={(e) => set('address', e.target.value)} readOnly={!isSubActive} />
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea className="input h-28 resize-none" value={profile.description ?? ''} onChange={(e) => set('description', e.target.value)} readOnly={!isSubActive} />
          </div>
        </div>

        {msg && <div className={`rounded-lg px-4 py-3 text-sm ${msg.includes('succes') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

        {isSubActive && (
          <button onClick={handleSave} className="btn-primary" disabled={update.isPending || (!form && !avatarFile)}>
            {update.isPending ? <Spinner size="sm" /> : 'Sauvegarder les modifications'}
          </button>
        )}
      </div>

      <div className="card space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Securite</h2>
          <p className="mt-1 text-sm text-gray-500">
            Changez votre mot de passe a tout moment pour proteger votre compte.
          </p>
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
