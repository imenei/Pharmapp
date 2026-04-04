'use client';
// src/app/pharmacist/suppliers/page.tsx
import { useState } from 'react';
import { Search, MapPin, Star, Package, Gift } from 'lucide-react';
import Link from 'next/link';
import { useSuppliers, useWilayas } from '@/hooks/useApi';
import { Avatar, TierBadge, Stars, CardSkeleton, Empty, Pagination } from '@/components/ui';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState({ search: '', wilaya: '' });

  const { data, isLoading } = useSuppliers({ ...query, page, limit: 12 });
  const { data: wilayas = [] } = useWilayas();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery({ search, wilaya });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
        <p className="text-gray-500 text-sm mt-1">Découvrez les fournisseurs pharmaceutiques approuvés</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Rechercher un fournisseur…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input sm:w-48" value={wilaya} onChange={e => setWilaya(e.target.value)}>
            <option value="">Toutes les wilayas</option>
            {wilayas.map((w: any) => <option key={w.code} value={w.nom}>{w.code}. {w.nom}</option>)}
          </select>
          <button type="submit" className="btn-primary px-6">Filtrer</button>
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : data?.data?.length === 0 ? (
        <Empty title="Aucun fournisseur trouvé" sub="Modifiez vos critères de recherche" icon={<Search size={48} />} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data?.map((supplier) => (
              <Link key={supplier.id} href={`/pharmacist/suppliers/${supplier.id}`}
                className="card hover:shadow-md hover:border-blue-200 border-2 border-transparent transition-all cursor-pointer">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar src={supplier.avatarUrl} name={supplier.companyName} size={48} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{supplier.companyName}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                      <MapPin size={12} /><span className="truncate">{supplier.wilaya}</span>
                    </div>
                  </div>
                  <TierBadge tier={supplier.subscriptionTier} />
                </div>

                {supplier.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{supplier.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Stars rating={supplier.rating} />
                    <span className="font-medium text-gray-700">{supplier.rating.toFixed(1)}</span>
                    <span className="text-xs">({supplier.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Package size={13} /><span>{supplier.listingsCount} listings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gift size={13} /><span>{supplier.activeOffersCount} offres</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{data?.total} fournisseur(s) trouvé(s)</p>
            <Pagination page={page} totalPages={data?.totalPages ?? 1} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
