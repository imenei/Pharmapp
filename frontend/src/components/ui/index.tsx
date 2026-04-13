// src/components/ui/index.tsx
'use client';
import { ReactNode } from 'react';
import { clsx } from 'clsx';

// ── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size];
  return <div className={`${s} border-2 border-[#A5D6A7] border-t-[#2E7D32] rounded-full animate-spin`} />;
}

// ── Tier Badge ───────────────────────────────────────────────────────────────
export function TierBadge({ tier }: { tier?: string | null }) {
  if (!tier) return null;
  const cls = { gold: 'badge-gold', silver: 'badge-silver', bronze: 'badge-bronze' }[tier] ?? 'badge-bronze';
  const label = { gold: '🥇 Or', silver: '🥈 Argent', bronze: '🥉 Bronze' }[tier] ?? tier;
  return <span className={cls}>{label}</span>;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ src, name, size = 40 }: { src?: string | null; name?: string; size?: number }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
  if (src) return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full bg-[#E8F5E9] text-[#2E7D32] font-semibold flex items-center justify-center text-sm border border-[#A5D6A7]"
      style={{ width: size, height: size, minWidth: size }}>
      {initials}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse bg-[#C8E6C9] rounded-lg', className)} />;
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

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon, color = 'green', sub }: {
  title: string; value: ReactNode; icon: ReactNode; color?: string; sub?: string;
}) {
  // Original design: tous les stat cards ont le fond vert #E8F5E9
  return (
    <div className="card flex items-center gap-4">
      <div className="p-3 rounded-xl bg-[#E8F5E9] text-[#2E7D32]">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-[#1B5E20] truncate">{value}</p>
        {sub && <p className="text-xs text-[#388E3C] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────
export function Empty({ title, sub, icon }: { title: string; sub?: string; icon?: ReactNode }) {
  return (
    <div className="text-center py-16 text-gray-400">
      {icon && <div className="mx-auto mb-4 text-[#A5D6A7]">{icon}</div>}
      <p className="font-semibold text-gray-600">{title}</p>
      {sub && <p className="text-sm mt-1">{sub}</p>}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
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

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#C8E6C9]">
          <h2 className="text-lg font-semibold text-[#2E7D32] !mb-0">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────────
export function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  );
}
