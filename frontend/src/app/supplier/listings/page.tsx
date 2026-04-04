'use client';
// src/app/supplier/listings/page.tsx
import { useState, useRef } from 'react';
import { Upload, Trash2, FileText, Eye, Download } from 'lucide-react';
import { useMyListings, useUploadListing, useDeleteListing } from '@/hooks/useApi';
import { Empty, Spinner, Modal } from '@/components/ui';

export default function SupplierListingsPage() {
  const { data: listings = [], isLoading } = useMyListings();
  const upload = useUploadListing();
  const remove = useDeleteListing();
  const fileRef = useRef<HTMLInputElement>(null);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file || !title) { setError('Titre et fichier PDF requis'); return; }
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    fd.append('description', description);
    try {
      await upload.mutateAsync(fd);
      setModal(false); setTitle(''); setDescription(''); setFile(null);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de l\'upload');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes listings</h1>
          <p className="text-gray-500 text-sm">Catalogues PDF visibles par les pharmaciens</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Upload size={16} /> Nouveau listing
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : listings.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="font-semibold text-gray-600 mb-1">Aucun listing publié</p>
          <p className="text-sm text-gray-400 mb-6">Uploadez votre premier catalogue PDF pour le rendre visible aux pharmaciens</p>
          <button onClick={() => setModal(true)} className="btn-primary mx-auto">
            <Upload size={16} /> Uploader un catalogue
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l: any) => (
            <div key={l.id} className="card flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-xl text-red-600 shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{l.title}</p>
                <p className="text-sm text-gray-500">
                  {l._count?.products ?? 0} produits extraits ·{' '}
                  <span className="inline-flex items-center gap-1"><Eye size={12}/> {l.views}</span> ·{' '}
                  <span className="inline-flex items-center gap-1"><Download size={12}/> {l.downloads}</span>
                </p>
                <p className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString('fr-DZ')}</p>
              </div>
              <button
                onClick={() => confirm('Supprimer ce listing ?') && remove.mutate(l.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                disabled={remove.isPending}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      <Modal open={modal} onClose={() => { setModal(false); setError(''); }} title="Uploader un catalogue PDF">
        <div className="space-y-4">
          <div>
            <label className="label">Titre du catalogue *</label>
            <input className="input" placeholder="Ex: Catalogue Antibiotiques — Janvier 2025"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Description (optionnel)</label>
            <textarea className="input h-20 resize-none" placeholder="Description du catalogue…"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="label">Fichier PDF *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              {file ? (
                <div>
                  <FileText size={32} className="mx-auto text-blue-600 mb-2"/>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              ) : (
                <div>
                  <Upload size={32} className="mx-auto text-gray-400 mb-2"/>
                  <p className="text-gray-600 font-medium">Cliquez pour choisir un PDF</p>
                  <p className="text-xs text-gray-400 mt-1">Max 20 MB — Les produits seront extraits automatiquement</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3">
            <button onClick={handleUpload} className="btn-primary flex-1" disabled={upload.isPending}>
              {upload.isPending ? <><Spinner size="sm"/> Extraction en cours…</> : <><Upload size={16}/> Publier le catalogue</>}
            </button>
            <button onClick={() => setModal(false)} className="btn-secondary">Annuler</button>
          </div>

          {upload.isPending && (
            <p className="text-xs text-blue-600 text-center animate-pulse">
              📄 Extraction des produits du PDF en cours… cela peut prendre 10-30 secondes
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
