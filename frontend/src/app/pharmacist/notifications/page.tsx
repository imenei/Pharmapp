'use client';
// src/app/pharmacist/notifications/page.tsx
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/useApi';
import { Empty, Spinner } from '@/components/ui';
import { clsx } from 'clsx';

const typeIcon: Record<string, string> = {
  success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
  payment: '💳', subscription: '🏆', listing: '📋', offer: '🎁',
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications({ limit: 50 });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">{unread} non lue(s)</p>
        </div>
        {unread > 0 && (
          <button onClick={() => markAll.mutate()} className="btn-secondary text-sm" disabled={markAll.isPending}>
            <CheckCheck size={15} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <Empty title="Aucune notification" icon={<Bell size={48} />} />
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div key={n.id}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
              className={clsx(
                'card cursor-pointer hover:shadow-md transition-all border-l-4',
                n.isRead ? 'border-gray-200 opacity-70' : 'border-blue-500 bg-blue-50/30',
              )}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{typeIcon[n.type] ?? 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <p className={clsx('font-semibold text-gray-900', !n.isRead && 'text-blue-900')}>{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('fr-DZ')}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
