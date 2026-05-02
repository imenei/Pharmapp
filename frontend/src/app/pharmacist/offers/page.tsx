'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Eye, Gift, Mail, MapPin, Phone, Search, UserRound } from 'lucide-react';
import { useOffers, useWilayas } from '@/hooks/useApi';
import { Avatar, Empty, CardSkeleton, Pagination } from '@/components/ui';
import api from '@/lib/api';
import { toAssetUrl } from '@/lib/runtime-config';

export default function PharmacistOffersPage() {
  const [search, setSearch] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [query, setQuery] = useState('');
  const [queryWilaya, setQueryWilaya] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOffers({ search: query, wilaya: queryWilaya, page });
  const { data: wilayas = [] } = useWilayas();

  const handleView = async (id: string) => {
    await api.post(`/offers/${id}/view`).catch(() => {});
  };

  const handleDownload = (fileUrl?: string) => {
    if (!fileUrl) return;
    const a = document.createElement('a');
    a.href = toAssetUrl(fileUrl);
    a.download = '';
    a.target = '_blank';
    a.click();
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
            setQueryWilaya(wilaya);
            setPage(1);
          }}
          className="flex flex-col sm:flex-row gap-3"
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
          <select
            className="input sm:w-52"
            value={wilaya}
            onChange={(e) => setWilaya(e.target.value)}
          >
            <option value="">Toutes les wilayas</option>
            {wilayas.map((w: any) => (
              <option key={w.code} value={w.nom}>{w.code}. {w.nom}</option>
            ))}
          </select>
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
                  <a
                    href={toAssetUrl(offer.imageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="block mb-3"
                  >
                    <img
                      src={toAssetUrl(offer.imageUrl)}
                      alt={offer.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </a>
                )}

                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {offer.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-3">
                  {offer.description}
                </p>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={toAssetUrl(offer.supplier.avatarUrl)}
                      name={offer.supplier.name}
                      size={36}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {offer.supplier.name}
                      </p>
                      <div className="mt-1 space-y-1 text-xs text-gray-500">
                        {offer.supplier.wilaya && (
                          <p className="flex items-center gap-1"><MapPin size={11} />{offer.supplier.wilaya}</p>
                        )}
                        {offer.supplier.phone && (
                          <p className="flex items-center gap-1"><Phone size={11} />{offer.supplier.phone}</p>
                        )}
                        {offer.supplier.email && (
                          <p className="flex items-center gap-1 truncate"><Mail size={11} />{offer.supplier.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {offer.supplier.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2">{offer.supplier.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Link
                    href={`/pharmacist/suppliers/${offer.supplier.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    <UserRound size={13} /> Compte fournisseur
                  </Link>
                  {offer.imageUrl && (
                    <a
                      href={toAssetUrl(offer.imageUrl)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      <Eye size={13} /> Photo
                    </a>
                  )}
                  {offer.fileUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(offer.fileUrl);
                      }}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      <Download size={13} /> Telecharger
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
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
