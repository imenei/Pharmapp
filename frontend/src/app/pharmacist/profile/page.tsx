'use client';
// src/app/pharmacist/profile/page.tsx
import { useState } from 'react';
import { useMe } from '@/hooks/useApi';
import { Avatar, Spinner } from '@/components/ui';
import api from '@/lib/api';

export default function PharmacistProfilePage() {
  const { data: me, isLoading, refetch } = useMe();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState<any>(null);

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  const profile = form ?? me?.profile ?? {};

  const save = async () => {
    setSaving(true); setMsg('');
    try {
      await api.patch('/pharmacists/profile', profile);
      setMsg('✅ Profil mis à jour'); refetch(); setForm(null);
    } catch { setMsg('❌ Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const update = (k: string, v: string) => setForm((prev: any) => ({ ...(prev ?? profile), [k]: v }));

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
      <div className="card space-y-5">
        <div className="flex items-center gap-4">
          <Avatar src={me?.profile?.avatarUrl} name={me?.profile?.companyName} size={64} />
          <div>
            <p className="font-semibold text-gray-900">{me?.profile?.companyName ?? 'Non renseigné'}</p>
            <p className="text-sm text-gray-500">{me?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Pharmacien</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Nom de la pharmacie', key: 'companyName' },
            { label: 'Téléphone', key: 'phone' },
            { label: 'Wilaya', key: 'wilaya' },
            { label: 'Adresse', key: 'address' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input" value={(form ?? profile)[key] ?? ''}
                onChange={e => update(key, e.target.value)} />
            </div>
          ))}
          <div className="col-span-2">
            <label className="label">Description</label>
            <textarea className="input h-24 resize-none" value={(form ?? profile).description ?? ''}
              onChange={e => update('description', e.target.value)} />
          </div>
        </div>

        {msg && <div className={`text-sm px-3 py-2 rounded-lg ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

        <button onClick={save} className="btn-primary" disabled={saving || !form}>
          {saving ? <Spinner size="sm" /> : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}
