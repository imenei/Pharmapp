'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, Gift, Eye, Lock } from 'lucide-react';
import { useMyOffers, useCreateOffer, useDeleteOffer, useSupplierSubscription } from '@/hooks/useApi';
import { Spinner, Modal } from '@/components/ui';
import { toAssetUrl } from '@/lib/runtime-config';

export default function SupplierOffersPage() {
  const { data: offers = [], isLoading } = useMyOffers();
  const { data: sub } = useSupplierSubscription();
  const create = useCreateOffer();
  const remove = useDeleteOffer();
  const [modal, setModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', expiresAt: '' });
  const [image, setImage] = useState<File | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const isSubActive =
    sub &&
    sub.isActive &&
    sub.subscriptionEnd &&
    new Date(sub.subscriptionEnd) > new Date();

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.expiresAt) {
      setError('Tous les champs sont requis');
      return;
    }
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    try {
      await create.mutateAsync(fd);
      setModal(false);
      setForm({ title: '', description: '', expiresAt: '' });
      setImage(null);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur');
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes offres</h1>
          <p className="text-gray-500 text-sm">Offres promotionnelles visibles par les pharmaciens</p>
        </div>
        {isSubActive ? (
          <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Creer une offre</button>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 border border-amber-200">
            <Lock size={14} /> Lecture seule
          </span>
        )}
      </div>

      {!isSubActive && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Tant que votre paiement n&apos;est pas approuve, vous pouvez consulter vos offres mais pas en creer ou en supprimer.
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : offers.length === 0 ? (
        <div className="card text-center py-16">
          <Gift size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-semibold text-gray-600 mb-1">Aucune offre creee</p>
          <p className="text-sm text-gray-400 mb-6">
            {isSubActive ? 'Creez votre premiere offre promotionnelle' : 'Une fois le paiement approuve, vous pourrez publier vos offres ici'}
          </p>
          {isSubActive && (
            <button onClick={() => setModal(true)} className="btn-primary mx-auto"><Plus size={16} /> Creer une offre</button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((o: any) => {
            const expired = new Date(o.expiresAt) < new Date();
            return (
              <div key={o.id} className={`card flex flex-col ${expired ? 'opacity-60' : ''}`}>
                {o.imageUrl && (
                  <img src={toAssetUrl(o.imageUrl)} alt={o.title} className="w-full h-36 object-cover rounded-lg mb-3" />
                )}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{o.title}</h3>
                  {isSubActive && (
                    <button onClick={() => confirm('Supprimer cette offre ?') && remove.mutate(o.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 shrink-0">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-3">{o.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1"><Eye size={11} /> {o.views} vues</span>
                  <span className={expired ? 'text-red-500 font-medium' : 'text-green-600'}>
                    {expired ? 'Expirée' : `Expire le ${new Date(o.expiresAt).toLocaleDateString('fr-DZ')}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal && isSubActive} onClose={() => { setModal(false); setError(''); }} title="Creer une offre promotionnelle">
        <div className="space-y-4">
          <div>
            <label className="label">Titre *</label>
            <input className="input" placeholder="Ex: Promotion antibiotiques -20%" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input h-28 resize-none" placeholder="Decrivez votre offre en detail..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date d&apos;expiration *</label>
              <input type="date" className="input" min={minDateStr} value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
            </div>
            <div>
              <label className="label">Image (optionnel)</label>
              <div onClick={() => imgRef.current?.click()} className="input flex items-center gap-2 cursor-pointer hover:bg-gray-50 text-gray-500">
                {image ? <span className="truncate text-gray-900">{image.name}</span> : <span>Choisir une image...</span>}
              </div>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => setImage(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="flex gap-3">
            <button onClick={handleCreate} className="btn-primary flex-1" disabled={create.isPending}>
              {create.isPending ? <Spinner size="sm" /> : <><Plus size={16} /> Publier l&apos;offre</>}
            </button>
            <button onClick={() => setModal(false)} className="btn-secondary">Annuler</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
