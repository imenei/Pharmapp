'use client';
// src/app/supplier/profile/page.tsx
import { useState, useRef } from 'react';
import { useMe, useUpdateSupplierProfile, useWilayas } from '@/hooks/useApi';
import { Avatar, Spinner } from '@/components/ui';

export default function SupplierProfilePage() {
  const { data: me, isLoading, refetch } = useMe();
  const { data: wilayas = [] } = useWilayas();
  const update = useUpdateSupplierProfile();
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);
  const [msg, setMsg] = useState('');

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg"/></div>;

  const profile = form ?? me?.profile ?? {};
  const set = (k: string, v: string) => setForm((p: any) => ({ ...(p ?? profile), [k]: v }));

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
    if (!form) setForm({ ...profile });
  };

  const handleSave = async () => {
    const fd = new FormData();
    const data = form ?? {};
    Object.entries(data).forEach(([k, v]) => v != null && fd.append(k, v as string));
    if (avatarFile) fd.append('avatar', avatarFile);
    setMsg('');
    try {
      await update.mutateAsync(fd);
      setMsg('✅ Profil mis à jour avec succès');
      setForm(null); setAvatarFile(null); refetch();
    } catch { setMsg('❌ Erreur lors de la sauvegarde'); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>

      <div className="card space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar src={avatarPreview ?? me?.profile?.avatarUrl} name={me?.profile?.companyName} size={80}/>
            <button onClick={() => avatarRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center hover:bg-blue-700">✏️</button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar}/>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">{me?.profile?.companyName ?? 'Votre société'}</p>
            <p className="text-sm text-gray-500">{me?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Fournisseur</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nom de la société</label>
            <input className="input" value={profile.companyName ?? ''} onChange={e => set('companyName', e.target.value)}/>
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input" value={profile.phone ?? ''} onChange={e => set('phone', e.target.value)}/>
          </div>
          <div>
            <label className="label">Wilaya</label>
            <select className="input" value={profile.wilaya ?? ''} onChange={e => set('wilaya', e.target.value)}>
              <option value="">Sélectionner…</option>
              {wilayas.map((w: any) => <option key={w.code} value={w.nom}>{w.code}. {w.nom}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Adresse</label>
            <input className="input" value={profile.address ?? ''} onChange={e => set('address', e.target.value)}/>
          </div>
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea className="input h-28 resize-none" placeholder="Décrivez votre activité, vos spécialités…"
              value={profile.description ?? ''} onChange={e => set('description', e.target.value)}/>
          </div>
        </div>

        {msg && <div className={`text-sm px-4 py-3 rounded-lg ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

        <button onClick={handleSave} className="btn-primary" disabled={update.isPending || (!form && !avatarFile)}>
          {update.isPending ? <Spinner size="sm"/> : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
}
