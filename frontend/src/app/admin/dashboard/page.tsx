'use client';
// src/app/admin/dashboard/page.tsx
import { useState } from 'react';
import { Users, CreditCard, MessageSquare, Activity, Check, X, Eye, Trash2, FileText } from 'lucide-react';
import { useAdminStats, useAdminUsers, useAdminPayments, useAdminMessages,
  useApproveUser, useRejectUser, useApprovePayment, useRejectPayment,
  useDeleteUser, useToggleUserActive, useMarkMessageRead } from '@/hooks/useApi';
import { StatCard, CardSkeleton, Avatar, Spinner, Pagination } from '@/components/ui';
import { clsx } from 'clsx';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

type Tab = 'users' | 'payments' | 'messages';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('users');
  const [userPage, setUserPage] = useState(1);
  const [payPage, setPayPage] = useState(1);
  const [msgPage, setMsgPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: stats, isLoading: statsLoad } = useAdminStats();
  const { data: usersData, isLoading: usersLoad } = useAdminUsers({ page: userPage, status: statusFilter || undefined });
  const { data: paymentsData, isLoading: payLoad } = useAdminPayments({ page: payPage, status: statusFilter || undefined });
  const { data: messagesData, isLoading: msgLoad } = useAdminMessages({ page: msgPage });

  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const deleteUser = useDeleteUser();
  const toggleActive = useToggleUserActive();
  const markRead = useMarkMessageRead();

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'users', label: 'Utilisateurs', icon: Users, count: stats?.pendingUsers },
    { key: 'payments', label: 'Paiements', icon: CreditCard, count: stats?.pendingPayments },
    { key: 'messages', label: 'Messages', icon: MessageSquare, count: stats?.newMessages },
  ];

  // Fonction pour obtenir l'URL du registre de commerce
  const getRegisterUrl = (user: any) => {
    // Vérifier les différents champs possibles pour le registre
    return user.profile?.registerUrl || 
           user.profile?.avatarUrl || 
           user.documents?.find((d: any) => d.type === 'registre_commerce')?.url ||
           null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-gray-500 text-sm">Vue d&apos;ensemble et gestion de la plateforme</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statsLoad ? [...Array(6)].map((_,i)=><CardSkeleton key={i}/>) : <>
          <StatCard title="Pharmaciens" value={stats?.totalPharmacists ?? 0} icon={<Users size={22}/>} color="blue"/>
          <StatCard title="Fournisseurs" value={stats?.totalSuppliers ?? 0} icon={<Activity size={22}/>} color="green"/>
          <StatCard title="En attente" value={stats?.pendingUsers ?? 0} icon={<Users size={22}/>} color="yellow"/>
          <StatCard title="Paiements en attente" value={stats?.pendingPayments ?? 0} icon={<CreditCard size={22}/>} color="red"/>
          <StatCard title="Abonnements actifs" value={stats?.activeSubscriptions ?? 0} icon={<CreditCard size={22}/>} color="purple"/>
          <StatCard title="Nouveaux messages" value={stats?.newMessages ?? 0} icon={<MessageSquare size={22}/>} color="blue"/>
        </>}
      </div>

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => { setTab(key); setStatusFilter(''); }}
              className={clsx('flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative',
                tab === key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700')}>
              <Icon size={16}/>{label}
              {count && count > 0 ? <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{count}</span> : null}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Users tab */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {['', 'pending', 'approved', 'rejected'].map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setUserPage(1); }}
                    className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      statusFilter === s ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                    {s === '' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'approved' ? 'Approuvés' : 'Refusés'}
                  </button>
                ))}
              </div>
              {usersLoad ? <div className="flex justify-center py-8"><Spinner size="lg"/></div> : (
                <div className="space-y-2">
                  {usersData?.data?.map((user: any) => {
                    const registerUrl = getRegisterUrl(user);
                    
                    return (
                    <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Avatar src={user.profile?.avatarUrl} name={user.profile?.companyName ?? user.email} size={44}/>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.profile?.companyName ?? user.email}</p>
                        <p className="text-sm text-gray-500">{user.email} · {user.profile?.wilaya || user.wilaya}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full',
                            user.role === 'pharmacist' ? 'bg-blue-100 text-blue-700' : user.role === 'supplier' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700')}>
                            {user.role === 'pharmacist' ? 'Pharmacien' : user.role === 'supplier' ? 'Fournisseur' : user.role}
                          </span>
                          <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full',
                            user.status === 'approved' ? 'bg-green-100 text-green-700' : user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                            {user.status === 'approved' ? 'Approuvé' : user.status === 'pending' ? 'En attente' : 'Refusé'}
                          </span>
                          {!user.isActive && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-600">Inactif</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Bouton pour voir le registre de commerce */}
                        {registerUrl && (
                          <a 
                            href={`${API_BASE}${registerUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir le registre de commerce"
                          >
                            <FileText size={18}/>
                          </a>
                        )}
                        {user.status === 'pending' && <>
                          <button onClick={() => approveUser.mutate(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approuver">
                            <Check size={18}/>
                          </button>
                          <button onClick={() => rejectUser.mutate({ id: user.id })}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Refuser">
                            <X size={18}/>
                          </button>
                        </>}
                        <button onClick={() => toggleActive.mutate(user.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium px-3">
                          {user.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button onClick={() => confirm('Supprimer cet utilisateur ?') && deleteUser.mutate(user.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  )})}
                  {usersData?.data?.length === 0 && <p className="text-center py-10 text-gray-500">Aucun utilisateur trouvé</p>}
                </div>
              )}
              <Pagination page={userPage} totalPages={usersData?.totalPages ?? 1} onChange={setUserPage}/>
            </div>
          )}

          {/* Payments tab */}
          {tab === 'payments' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {['', 'pending', 'approved', 'rejected'].map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setPayPage(1); }}
                    className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      statusFilter === s ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                    {s === '' ? 'Tous' : s === 'pending' ? 'En attente' : s === 'approved' ? 'Approuvés' : 'Refusés'}
                  </button>
                ))}
              </div>
              {payLoad ? <div className="flex justify-center py-8"><Spinner size="lg"/></div> : (
                <div className="space-y-3">
                  {paymentsData?.data?.map((pay: any) => (
                    <div key={pay.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{pay.user?.profile?.companyName || pay.profile?.companyName}</p>
                            <span className={clsx('px-2 py-0.5 text-xs font-medium rounded-full',
                              pay.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : pay.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                              {pay.status === 'pending' ? 'En attente' : pay.status === 'approved' ? 'Approuvé' : 'Refusé'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Plan : <strong>{pay.subscriptionPlan?.name}</strong> — {pay.subscriptionPlan?.price?.toLocaleString()} DA/mois</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(pay.createdAt).toLocaleString('fr-DZ')}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a href={`${API_BASE}${pay.proofUrl}`} target="_blank" rel="noopener noreferrer"
                            className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1">
                            <Eye size={14}/> Reçu
                          </a>
                          {pay.status === 'pending' && <>
                            <button onClick={() => approvePayment.mutate(pay.id)} disabled={approvePayment.isPending}
                              className="btn-primary text-sm px-3 py-1.5 bg-green-600 hover:bg-green-700 flex items-center gap-1">
                              <Check size={14}/> Approuver
                            </button>
                            <button onClick={() => rejectPayment.mutate({ id: pay.id })} disabled={rejectPayment.isPending}
                              className="btn-danger text-sm px-3 py-1.5 flex items-center gap-1">
                              <X size={14}/> Refuser
                            </button>
                          </>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {paymentsData?.data?.length === 0 && <p className="text-center py-10 text-gray-500">Aucun paiement trouvé</p>}
                </div>
              )}
              <Pagination page={payPage} totalPages={paymentsData?.totalPages ?? 1} onChange={setPayPage}/>
            </div>
          )}

          {/* Messages tab */}
          {tab === 'messages' && (
            <div className="space-y-3">
              {msgLoad ? <div className="flex justify-center py-8"><Spinner size="lg"/></div> : (
                messagesData?.data?.map((msg: any) => (
                  <div key={msg.id} className={clsx('p-4 rounded-xl border-l-4', msg.status === 'new' ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 border-gray-200')}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{msg.name}</p>
                          <span className="text-gray-400 text-sm">&lt;{msg.email}&gt;</span>
                          {msg.status === 'new' && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Nouveau</span>}
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{msg.subject}</p>
                        <p className="text-sm text-gray-600">{msg.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(msg.createdAt).toLocaleString('fr-DZ')}</p>
                      </div>
                      {msg.status === 'new' && (
                        <button onClick={() => markRead.mutate(msg.id)}
                          className="btn-secondary text-sm px-3 py-1.5 shrink-0">
                          <Check size={14}/> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
              {messagesData?.data?.length === 0 && <p className="text-center py-10 text-gray-500">Aucun message</p>}
              <Pagination page={msgPage} totalPages={messagesData?.totalPages ?? 1} onChange={setMsgPage}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}