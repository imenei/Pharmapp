'use client';

import { useState } from 'react';
import {
  Users,
  CreditCard,
  MessageSquare,
  Activity,
  Check,
  X,
  Eye,
  Trash2,
  FileText,
} from 'lucide-react';

import {
  useAdminStats,
  useAdminUsers,
  useAdminPayments,
  useAdminMessages,
  useApproveUser,
  useRejectUser,
  useApprovePayment,
  useRejectPayment,
  useDeleteUser,
  useToggleUserActive,
  useMarkMessageRead,
} from '@/hooks/useApi';

import { StatCard, CardSkeleton, Avatar, Spinner, Pagination } from '@/components/ui';
import { toAssetUrl } from '@/lib/runtime-config';
import clsx from 'clsx';

type Tab = 'users' | 'payments' | 'messages';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('users');
  const [userPage, setUserPage] = useState(1);
  const [payPage, setPayPage] = useState(1);
  const [msgPage, setMsgPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: stats, isLoading: statsLoad } = useAdminStats();
  const { data: usersData, isLoading: usersLoad } = useAdminUsers({
    page: userPage,
    status: statusFilter || undefined,
  });
  const { data: paymentsData, isLoading: payLoad } = useAdminPayments({
    page: payPage,
    status: statusFilter || undefined,
  });
  const { data: messagesData, isLoading: msgLoad } = useAdminMessages({
    page: msgPage,
  });

  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();
  const deleteUser = useDeleteUser();
  const toggleActive = useToggleUserActive();
  const markRead = useMarkMessageRead();

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'users', label: 'Utilisateurs', icon: Users, count: stats?.pendingUsers },
    { key: 'payments', label: 'Paiements', icon: CreditCard, count: stats?.pendingPayments },
    { key: 'messages', label: 'Messages', icon: MessageSquare, count: stats?.newMessages },
  ];

  const getRegisterUrl = (user: any) => {
    return (
      user?.profile?.registerUrl ||
      user?.documents?.find((d: any) => d.type === 'registre_commerce')?.url ||
      null
    );
  };

  const handleApproveUser = async (id: string) => {
    setFeedback(null);
    try {
      const response = await approveUser.mutateAsync(id);
      setFeedback({
        type: 'success',
        text: String(response?.message ?? 'Utilisateur approuvé avec succès.'),
      });
    } catch (error: any) {
      setFeedback({
        type: 'error',
        text: String(error?.response?.data?.message ?? "Échec de l'approbation."),
      });
    }
  };

  const handleApprovePayment = async (id: string) => {
    setFeedback(null);
    try {
      const response = await approvePayment.mutateAsync(id);
      setFeedback({
        type: 'success',
        text: String(response?.message ?? 'Paiement approuvé avec succès.'),
      });
    } catch (error: any) {
      setFeedback({
        type: 'error',
        text: String(
          error?.response?.data?.message ?? "Échec de l'approbation du paiement."
        ),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-gray-500 text-sm">
          Vue d’ensemble et gestion de la plateforme
        </p>
      </div>

      {/* STATS */}
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

      {/* FEEDBACK */}
      {feedback && (
        <div
          className={clsx(
            'rounded-xl border px-4 py-3 text-sm font-medium',
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          )}
        >
          {feedback.text}
        </div>
      )}

      {/* TABS */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setStatusFilter('');
              }}
              className={clsx(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium',
                tab === key ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              )}
            >
              <Icon size={16} />
              {label}
              {!!count && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">

          {/* USERS */}
          {tab === 'users' && (
            <div className="space-y-3">
              {usersLoad ? (
                <Spinner size="lg" />
              ) : (
                usersData?.data?.map((user: any) => {
                  const registerUrl = getRegisterUrl(user);

                  return (
                    <div key={user.id} className="flex justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold">{user?.profile?.companyName ?? user.email}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>

                        <p className="text-xs text-gray-400">
                          {user?.profile?.wilaya ?? ''}
                        </p>

                        <p className="text-xs mt-1">
                          Status: {user?.status ?? 'unknown'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {registerUrl && (
                          <a href={toAssetUrl(registerUrl)} target="_blank" className="text-blue-600">
                            <FileText size={16} />
                          </a>
                        )}

                        {user.status === 'pending' && (
                          <>
                            <button onClick={() => handleApproveUser(user.id)}>
                              <Check size={16} />
                            </button>
                            <button onClick={() => rejectUser.mutate({ id: user.id })}>
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* PAYMENTS */}
          {tab === 'payments' && (
            <div className="space-y-3">
              {paymentsData?.data?.map((pay: any) => (
                <div key={pay.id} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold">
                    {pay?.user?.profile?.companyName ?? 'Unknown'}
                  </p>

                  <p className="text-sm text-gray-600">
                    {pay?.subscriptionPlan?.name ?? ''}
                  </p>

                  <p className="text-xs text-gray-400">
                    {new Date(pay?.createdAt ?? Date.now()).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div className="space-y-3">
              {messagesData?.data?.map((msg: any) => (
                <div key={msg.id} className="p-4 bg-gray-50 rounded-xl">
                  <p className="font-semibold">{msg?.name ?? 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{msg?.email ?? ''}</p>

                  <p className="text-sm mt-2">
                    {String(msg?.message ?? '')}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}