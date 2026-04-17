'use client';

import { useState } from 'react';
import { Search, Eye, Gift } from 'lucide-react';
import { useOffers } from '@/hooks/useApi';
import { Avatar, Empty, CardSkeleton, Pagination } from '@/components/ui';
import api from '@/lib/api';

export default function PharmacistOffersPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOffers({ search: query, page });

  const handleView = async (id: string) => {
    await api.post(`/offers/${id}/view`).catch(() => {});
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Offres promotionnelles
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Toutes les offres actives des fournisseurs
        </p>
      </div>

      <div className="card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search);
            setPage(1);
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="input pl-9"
              placeholder="Rechercher une offre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary px-5">
            Chercher
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <Empty
          title="Aucune offre disponible"
          sub="Les fournisseurs n'ont pas encore publié d'offres"
          icon={<Gift size={48} />}
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data?.map((offer) => (
              <div
                key={offer.id}
                className="card flex flex-col hover:shadow-md transition-shadow"
                onClick={() => handleView(offer.id)}
              >
                {offer.imageUrl && (
                  <img
                    src={getImageUrl(offer.imageUrl)}
                    alt={offer.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {offer.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-3">
                  {offer.description}
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <Avatar
                    src={getImageUrl(offer.supplier.avatarUrl)}
                    name={offer.supplier.name}
                    size={32}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {offer.supplier.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {offer.supplier.wilaya}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Eye size={11} /> {offer.views}
                  </span>
                  <span>
                    Expire:{' '}
                    {new Date(offer.expiresAt).toLocaleDateString('fr-DZ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 1}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}