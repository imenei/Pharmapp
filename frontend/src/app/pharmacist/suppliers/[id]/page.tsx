'use client';
// src/app/pharmacist/suppliers/[id]/page.tsx
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Phone, Mail, Package, Gift, Star } from 'lucide-react';
import { useSupplier, useCreateRating } from '@/hooks/useApi';
import { Avatar, TierBadge, Stars, Spinner, Modal, Empty } from '@/components/ui';
import api from '@/lib/api';

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: supplier, isLoading } = useSupplier(id);
  const createRating = useCreateRating();
  const [ratingModal, setRatingModal] = useState(false);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  );
  if (!supplier) return <div className="text-center py-20 text-gray-500">Fournisseur introuvable</div>;

  const scores = supplier.ratingsReceived?.map((r: any) => r.score) ?? [];
  const avg = scores.length ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

  const resolveFileUrl = (fileUrl?: string) => {
    if (!fileUrl) return null;
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const assetBase = apiBase.replace(/\/api$/, '');
    return fileUrl.startsWith('/') ? `${assetBase}${fileUrl}` : `${assetBase}/${fileUrl}`;
  };

  const handleDownload = async (listingId: string, fileUrl?: string) => {
    const { data } = await api.post(`/listings/${listingId}/download`);
    const resolvedFileUrl = resolveFileUrl(data?.fileUrl ?? fileUrl);
    if (!resolvedFileUrl) {
      alert("Le fichier de ce catalogue est introuvable.");
      return;
    }

    const a = document.createElement('a');
    a.href = resolvedFileUrl;
    a.download = '';
    a.click();
  };

  const submitRating = async () => {
    await createRating.mutateAsync({ supplierId: id, score, comment });
    setRatingModal(false);
    setComment('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="card">
        <div className="flex items-start gap-5">
          <Avatar src={supplier.avatarUrl} name={supplier.companyName} size={80} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{supplier.companyName}</h1>
              <TierBadge tier={supplier.activeSubscription?.subscriptionPlan?.tier} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
              {supplier.wilaya && <span className="flex items-center gap-1"><MapPin size={13} />{supplier.wilaya}</span>}
              {supplier.phone && <span className="flex items-center gap-1"><Phone size={13} />{supplier.phone}</span>}
              {supplier.user?.email && <span className="flex items-center gap-1"><Mail size={13} />{supplier.user.email}</span>}
            </div>
            {supplier.description && <p className="text-gray-600 text-sm">{supplier.description}</p>}
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Stars rating={avg} />
              <span className="font-bold text-gray-900">{avg.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-500">{supplier._count?.ratingsReceived} avis</p>
            <button onClick={() => setRatingModal(true)} className="btn-primary mt-3 text-sm px-3 py-1.5">
              <Star size={14} /> Donner un avis
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: 'Listings', value: supplier._count?.listings ?? 0, icon: '📋' },
            { label: 'Offres actives', value: supplier._count?.offers ?? 0, icon: '🎁' },
            { label: 'Avis', value: supplier._count?.ratingsReceived ?? 0, icon: '⭐' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{icon} {value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package size={18} /> Catalogues disponibles</h2>
        {supplier.listings?.length === 0
          ? <Empty title="Aucun catalogue disponible" icon={<Package size={40} />} />
          : (
            <div className="space-y-3">
              {supplier.listings?.map((l: any) => (
                <div key={l.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{l.title}</p>
                    <p className="text-xs text-gray-500">{l.views} vues · {l.downloads} téléchargements · {new Date(l.createdAt).toLocaleDateString('fr-DZ')}</p>
                  </div>
                  <button onClick={() => handleDownload(l.id, l.fileUrl)} className="btn-secondary text-sm px-3 py-1.5">
                    📥 Télécharger
                  </button>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Recent ratings */}
      {supplier.ratingsReceived?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Avis récents</h2>
          <div className="space-y-3">
            {supplier.ratingsReceived.map((r: any) => (
              <div key={r.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <Avatar src={r.pharmacist?.avatarUrl} name={r.pharmacist?.companyName} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-gray-900">{r.pharmacist?.companyName}</span>
                    <Stars rating={r.score} />
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
                <span className="text-xs text-gray-400 shrink-0">{new Date(r.createdAt).toLocaleDateString('fr-DZ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating modal */}
      <Modal open={ratingModal} onClose={() => setRatingModal(false)} title="Donner un avis">
        <div className="space-y-4">
          <div>
            <label className="label">Note</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setScore(s)}
                  className={`text-3xl transition-transform hover:scale-110 ${s <= score ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Commentaire (optionnel)</label>
            <textarea className="input h-24 resize-none" placeholder="Votre expérience avec ce fournisseur…"
              value={comment} onChange={e => setComment(e.target.value)} />
          </div>
          <button onClick={submitRating} className="btn-primary w-full" disabled={createRating.isPending}>
            {createRating.isPending ? <Spinner size="sm" /> : 'Publier mon avis'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
