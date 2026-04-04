'use client';
// src/app/pharmacist/listings-search/page.tsx
import { useState } from 'react';
import { Search, X, Download, Building2, FileText } from 'lucide-react';
import { useSearchListings } from '@/hooks/useApi';
import { TierBadge, Empty, Spinner, Avatar } from '@/components/ui';
import api from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

export default function ListingsSearchPage() {
  const [inputs, setInputs] = useState(['', '', '', '', '']);
  const [enabled, setEnabled] = useState(false);
  const [activeProducts, setActiveProducts] = useState<string[]>([]);

  const { data, isLoading } = useSearchListings(activeProducts, enabled && activeProducts.length > 0);

  const updateInput = (i: number, val: string) => {
    const next = [...inputs];
    next[i] = val;
    setInputs(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = inputs.map(s => s.trim()).filter(Boolean);
    if (!valid.length) return;
    setActiveProducts(valid);
    setEnabled(true);
  };

  const clearInput = (i: number) => {
    const next = [...inputs];
    next[i] = '';
    setInputs(next);
  };

  const handleDownload = async (id: string, fileUrl: string) => {
    await api.post(`/listings/${id}/download`);
    const a = document.createElement('a');
    a.href = fileUrl.startsWith('/') ? `${API_BASE}${fileUrl}` : fileUrl;
    a.download = '';
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recherche de produits</h1>
        <p className="text-gray-500 text-sm mt-1">Trouvez des médicaments disponibles chez les fournisseurs</p>
      </div>

      {/* Search form */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">🔍 Entrez jusqu&apos;à 5 noms de produits</h2>
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inputs.map((val, i) => (
              <div key={i} className="relative">
                <input
                  className="input pr-8"
                  placeholder={`Produit ${i + 1} (ex: Amoxicilline 500mg)`}
                  value={val}
                  onChange={e => updateInput(i, e.target.value)}
                />
                {val && (
                  <button type="button" onClick={() => clearInput(i)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="submit" className="btn-primary px-8" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : <><Search size={16} /> Rechercher</>}
          </button>
        </form>
      </div>

      {/* Results */}
      {enabled && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : data?.data?.length === 0 ? (
            <Empty
              title="Aucun résultat"
              sub="Aucun fournisseur ne propose ces produits actuellement"
              icon={<FileText size={48} />}
            />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-medium">
                {data?.total} catalogue(s) trouvé(s) pour : {activeProducts.filter(Boolean).join(', ')}
              </p>
              {data?.data?.map((listing) => (
                <div key={listing.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <Avatar src={listing.supplier?.avatarUrl} name={listing.supplier?.name} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <TierBadge tier={listing.supplier?.tier} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Building2 size={13} />
                        <span>{listing.supplier?.name}</span>
                        {listing.supplier?.wilaya && <span>· {listing.supplier.wilaya}</span>}
                      </div>

                      {/* Matching products */}
                      {listing.matchingProducts && listing.matchingProducts.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {listing.matchingProducts.slice(0, 8).map((p, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                              ✓ {p.productName}
                              {p.price && <span className="text-green-600">· {p.price.toLocaleString()} DA</span>}
                            </span>
                          ))}
                          {listing.matchingCount && listing.matchingCount > 8 && (
                            <span className="text-xs text-gray-400">+{listing.matchingCount - 8} produits</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{listing.views} vues</span>
                        <span>{listing.downloads} téléchargements</span>
                        <span>{listing.matchingCount}/{listing.totalProducts} produits correspondants</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(listing.id, listing.fileUrl)}
                      className="btn-primary text-sm px-4 py-2 shrink-0">
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
