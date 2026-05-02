'use client';

import { useState } from 'react';
import {
  Activity,
  Ban,
  Check,
  CreditCard,
  Eye,
  FileText,
  MessageSquare,
  Power,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import clsx from 'clsx';

import {
  useAdminMessages,
  useAdminPayments,
  useAdminStats,
  useAdminUsers,
  useApprovePayment,
  useApproveUser,
  useDeleteMessage,
  useDeleteUser,
  useMarkMessageRead,
  useRejectPayment,
  useRejectUser,
  useToggleUserActive,
} from '@/hooks/useApi';
import { Avatar, CardSkeleton, Empty, Pagination, Spinner, StatCard, TierBadge } from '@/components/ui';
import { toAssetUrl } from '@/lib/runtime-config';

type Tab = 'users' | 'payments' | 'messages';

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuve' },
  { value: 'rejected', label: 'Refuse' },
];

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  pharmacist: 'Pharmacien',
  supplier: 'Fournisseur',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('users');
  const [userPage, setUserPage] = useState(1);
  const [payPage, setPayPage] = useState(1);
  const [msgPage, setMsgPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: stats, isLoading: statsLoad } = useAdminStats();
  const { data: usersData, isLoading: usersLoad } = useAdminUsers({
    page: userPage,
    status: statusFilter || undefined,
    role: roleFilter || undefined,
    search: query || undefined,
  });
  const { data: paymentsData, isLoading: payLoad } = useAdminPayments({
    page: payPage,
    status: statusFilter || undefined,
  });
  const { data: messagesData, isLoading: msgLoad } = useAdminMessages({ page: msgPage });

  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const deleteUser = useDeleteUser();
  const toggleActive = useToggleUserActive();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const markRead = useMarkMessageRead();
  const deleteMessage = useDeleteMessage();

  const showFeedback = (type: 'success' | 'error', text: string) => setFeedback({ type, text });

  const runAction = async (action: () => Promise<any>, success: string) => {
    setFeedback(null);
    try {
      const response = await action();
      showFeedback('success', String(response?.message ?? success));
    } catch (error: any) {
      showFeedback('error', String(error?.response?.data?.message ?? 'Action impossible.'));
    }
  };

  const handleRejectUser = (id: string) => {
    const reason = window.prompt('Motif du refus (optionnel)') ?? undefined;
    runAction(() => rejectUser.mutateAsync({ id, reason }), 'Utilisateur refuse.');
  };

  const handleRejectPayment = (id: string) => {
    const reason = window.prompt('Motif du refus (optionnel)') ?? undefined;
    runAction(() => rejectPayment.mutateAsync({ id, reason }), 'Paiement refuse.');
  };

  const handleDeleteUser = (id: string) => {
    if (!window.confirm('Supprimer definitivement cet utilisateur ?')) return;
    runAction(() => deleteUser.mutateAsync(id), 'Utilisateur supprime.');
  };

  const handleDeleteMessage = (id: string) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    runAction(() => deleteMessage.mutateAsync(id), 'Message supprime.');
  };

  const resetFiltersForTab = (nextTab: Tab) => {
    setTab(nextTab);
    setStatusFilter('');
    setRoleFilter('');
    setSearch('');
    setQuery('');
    setUserPage(1);
    setPayPage(1);
    setMsgPage(1);
  };

  const tabs = [
    { key: 'users' as const, label: 'Utilisateurs', icon: Users, count: stats?.pendingUsers },
    { key: 'payments' as const, label: 'Paiements', icon: CreditCard, count: stats?.pendingPayments },
    { key: 'messages' as const, label: 'Messages', icon: MessageSquare, count: stats?.newMessages },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-gray-500 text-sm">Gestion des utilisateurs, paiements et messages.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statsLoad ? (
          [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Pharmaciens" value={stats?.totalPharmacists ?? 0} icon={<Users size={22} />} color="blue" />
            <StatCard title="Fournisseurs" value={stats?.totalSuppliers ?? 0} icon={<Activity size={22} />} color="green" />
            <StatCard title="En attente" value={stats?.pendingUsers ?? 0} icon={<Users size={22} />} color="yellow" />
            <StatCard title="Paiements" value={stats?.pendingPayments ?? 0} icon={<CreditCard size={22} />} color="red" />
            <StatCard title="Abonnements actifs" value={stats?.activeSubscriptions ?? 0} icon={<CreditCard size={22} />} color="purple" />
            <StatCard title="Messages" value={stats?.newMessages ?? 0} icon={<MessageSquare size={22} />} color="blue" />
          </>
        )}
      </div>

      {feedback && (
        <div
          className={clsx(
            'rounded-xl border px-4 py-3 text-sm font-medium',
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700',
          )}
        >
          {feedback.text}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-100">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => resetFiltersForTab(key)}
              className={clsx(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2',
                tab === key ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-900',
              )}
            >
              <Icon size={16} />
              {label}
              {!!count && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{count}</span>}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-5">
          {tab === 'users' && (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setQuery(search);
                  setUserPage(1);
                }}
                className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]"
              >
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9" placeholder="Rechercher email ou nom..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="input" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setUserPage(1); }}>
                  <option value="">Tous les roles</option>
                  <option value="pharmacist">Pharmaciens</option>
                  <option value="supplier">Fournisseurs</option>
                  <option value="admin">Admins</option>
                </select>
                <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setUserPage(1); }}>
                  {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <button type="submit" className="btn-primary px-5">Filtrer</button>
              </form>

              {usersLoad ? (
                <div className="flex justify-center py-10"><Spinner size="lg" /></div>
              ) : usersData?.data?.length ? (
                <div className="space-y-3">
                  {usersData.data.map((user: any) => {
                    const registerUrl = user?.profile?.registerUrl;
                    const activeSub = user?.profile?.subscriptionPayments?.[0];
                    return (
                      <div key={user.id} className="flex flex-col gap-4 rounded-xl bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <Avatar src={toAssetUrl(user?.profile?.avatarUrl)} name={user?.profile?.companyName ?? user.email} size={44} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-gray-900">{user?.profile?.companyName ?? user.email}</p>
                              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600">{roleLabels[user.role] ?? user.role}</span>
                              <span className={clsx('rounded-full px-2 py-0.5 text-xs', user.status === 'approved' ? 'bg-green-100 text-green-700' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                                {user.status}
                              </span>
                              {!user.isActive && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Bloque</span>}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">{user?.profile?.wilaya ?? '-'} {user?.profile?.phone ? `- ${user.profile.phone}` : ''}</p>
                            {activeSub && (
                              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                <TierBadge tier={activeSub.subscriptionPlan?.tier} />
                                <span>{activeSub.subscriptionPlan?.name}</span>
                                <span>fin: {new Date(activeSub.subscriptionEnd).toLocaleDateString('fr-DZ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {registerUrl && (
                            <a href={toAssetUrl(registerUrl)} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-1.5 text-sm">
                              <FileText size={14} /> Dossier
                            </a>
                          )}
                          {user.status === 'pending' && (
                            <>
                              <button onClick={() => runAction(() => approveUser.mutateAsync(user.id), 'Utilisateur approuve.')} className="btn-primary px-3 py-1.5 text-sm">
                                <Check size={14} /> Approuver
                              </button>
                              <button onClick={() => handleRejectUser(user.id)} className="btn-secondary px-3 py-1.5 text-sm">
                                <X size={14} /> Refuser
                              </button>
                            </>
                          )}
                          <button onClick={() => runAction(() => toggleActive.mutateAsync(user.id), 'Statut utilisateur mis a jour.')} className="btn-secondary px-3 py-1.5 text-sm">
                            {user.isActive ? <Ban size={14} /> : <Power size={14} />}
                            {user.isActive ? 'Bloquer' : 'Activer'}
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100">
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <Pagination page={userPage} totalPages={usersData.totalPages ?? 1} onChange={setUserPage} />
                </div>
              ) : (
                <Empty title="Aucun utilisateur" icon={<Users size={44} />} />
              )}
            </>
          )}

          {tab === 'payments' && (
            <>
              <div className="flex max-w-xs">
                <select className="input" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPayPage(1); }}>
                  {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>

              {payLoad ? (
                <div className="flex justify-center py-10"><Spinner size="lg" /></div>
              ) : paymentsData?.data?.length ? (
                <div className="space-y-3">
                  {paymentsData.data.map((pay: any) => (
                    <div key={pay.id} className="flex flex-col gap-4 rounded-xl bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900">{pay?.profile?.companyName ?? 'Fournisseur'}</p>
                          <TierBadge tier={pay?.subscriptionPlan?.tier} />
                          <span className={clsx('rounded-full px-2 py-0.5 text-xs', pay.status === 'approved' ? 'bg-green-100 text-green-700' : pay.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                            {pay.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{pay?.profile?.user?.email ?? ''}</p>
                        <p className="text-sm text-gray-600">
                          {pay?.subscriptionPlan?.name} - {Number(pay?.subscriptionPlan?.price ?? 0).toLocaleString()} DA
                        </p>
                        <p className="text-xs text-gray-400">Depose le {new Date(pay.createdAt).toLocaleString('fr-DZ')}</p>
                        {pay.subscriptionEnd && <p className="text-xs text-gray-400">Fin: {new Date(pay.subscriptionEnd).toLocaleDateString('fr-DZ')}</p>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {pay.proofUrl && (
                          <a href={toAssetUrl(pay.proofUrl)} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-1.5 text-sm">
                            <Eye size={14} /> Recu
                          </a>
                        )}
                        {pay.status === 'pending' && (
                          <>
                            <button onClick={() => runAction(() => approvePayment.mutateAsync(pay.id), 'Paiement approuve.')} className="btn-primary px-3 py-1.5 text-sm">
                              <Check size={14} /> Approuver
                            </button>
                            <button onClick={() => handleRejectPayment(pay.id)} className="btn-secondary px-3 py-1.5 text-sm">
                              <X size={14} /> Refuser
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <Pagination page={payPage} totalPages={paymentsData.totalPages ?? 1} onChange={setPayPage} />
                </div>
              ) : (
                <Empty title="Aucun paiement" icon={<CreditCard size={44} />} />
              )}
            </>
          )}

          {tab === 'messages' && (
            <>
              {msgLoad ? (
                <div className="flex justify-center py-10"><Spinner size="lg" /></div>
              ) : messagesData?.data?.length ? (
                <div className="space-y-3">
                  {messagesData.data.map((msg: any) => (
                    <div key={msg.id} className={clsx('rounded-xl p-4', msg.status === 'new' ? 'bg-blue-50' : 'bg-gray-50')}>
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">{msg.name ?? 'Sans nom'}</p>
                            {msg.status === 'new' && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">Nouveau</span>}
                          </div>
                          <p className="text-sm text-gray-500">{msg.email}</p>
                          {msg.subject && <p className="mt-2 font-medium text-gray-800">{msg.subject}</p>}
                          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{msg.message}</p>
                          <p className="mt-2 text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString('fr-DZ')}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          {msg.status === 'new' && (
                            <button onClick={() => runAction(() => markRead.mutateAsync(msg.id), 'Message marque comme lu.')} className="btn-secondary px-3 py-1.5 text-sm">
                              <Check size={14} /> Lu
                            </button>
                          )}
                          <button onClick={() => handleDeleteMessage(msg.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100">
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Pagination page={msgPage} totalPages={messagesData.totalPages ?? 1} onChange={setMsgPage} />
                </div>
              ) : (
                <Empty title="Aucun message" icon={<MessageSquare size={44} />} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
