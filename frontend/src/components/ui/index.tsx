// src/components/ui/index.tsx
'use client';
import { ReactNode } from 'react';
import { clsx } from 'clsx';

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size];
  return <div className={`${s} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`} />;
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function TierBadge({ tier }: { tier?: string | null }) {
  if (!tier) return null;
  const cls = {
    gold: 'badge-gold', silver: 'badge-silver', bronze: 'badge-bronze',
  }[tier] ?? 'badge-bronze';
  const label = { gold: '🥇 Or', silver: '🥈 Argent', bronze: '🥉 Bronze' }[tier] ?? tier;
  return <span className={cls}>{label}</span>;
}

// ── Avatar ─────────────────────────────────────────────────────────────────
export function Avatar({ src, name, size = 40 }: { src?: string | null; name?: string; size?: number }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  if (src) return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm" style={{ width: size, height: size, minWidth: size }}>
      {initials}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-gray-200 rounded-lg', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon, color = 'blue', sub }: {
  title: string; value: ReactNode; icon: ReactNode; color?: string; sub?: string;
}) {
  const bg = {
    blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600', red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }[color] ?? 'bg-blue-50 text-blue-600';
  return (
    <div className="card flex items-center gap-4">
      <div className={clsx('p-3 rounded-xl', bg)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
export function Empty({ title, sub, icon }: { title: string; sub?: string; icon?: ReactNode }) {
  return (
    <div className="text-center py-16 text-gray-400">
      {icon && <div className="mx-auto mb-4 text-gray-300">{icon}</div>}
      <p className="font-semibold text-gray-600">{title}</p>
      {sub && <p className="text-sm mt-1">{sub}</p>}
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="btn-secondary px-3 py-1.5 text-sm">‹ Préc.</button>
      <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="btn-secondary px-3 py-1.5 text-sm">Suiv. ›</button>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Stars ──────────────────────────────────────────────────────────────────
export function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  );
}
