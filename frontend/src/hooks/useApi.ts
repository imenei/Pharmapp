// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PaginatedResponse, Supplier, Listing, Offer, Notification, SubscriptionPlan } from '@/types';

// ── Keys ───────────────────────────────────────────────────────────────────
export const KEYS = {
  me: ['auth', 'me'],
  suppliers: (p: any) => ['suppliers', p],
  supplier: (id: string) => ['supplier', id],
  supplierStats: ['supplier', 'stats'],
  supplierSubscription: ['supplier', 'subscription'],
  plans: ['plans'],
  listings: ['listings', 'my'],
  listingSearch: (products: string[]) => ['listings', 'search', products],
  offers: (p: any) => ['offers', p],
  myOffers: ['offers', 'my'],
  notifications: (p: any) => ['notifications', p],
  adminStats: ['admin', 'stats'],
  adminUsers: (p: any) => ['admin', 'users', p],
  adminPayments: (p: any) => ['admin', 'payments', p],
  adminMessages: (p: any) => ['admin', 'messages', p],
  wilayas: ['wilayas'],
  pharmacistDashboard: ['pharmacist', 'dashboard'],
};

// ── Auth ────────────────────────────────────────────────────────────────────
export const useMe = () =>
  useQuery({ queryKey: KEYS.me, queryFn: () => api.get('/auth/me').then(r => r.data), staleTime: 5 * 60 * 1000 });

// ── Wilayas ─────────────────────────────────────────────────────────────────
export const useWilayas = () =>
  useQuery({ queryKey: KEYS.wilayas, queryFn: () => api.get('/wilayas').then(r => r.data), staleTime: Infinity });

// ── Suppliers ───────────────────────────────────────────────────────────────
export const useSuppliers = (params: { wilaya?: string; search?: string; page?: number; limit?: number } = {}) =>
  useQuery<PaginatedResponse<Supplier>>({
    queryKey: KEYS.suppliers(params),
    queryFn: () => api.get('/suppliers', { params }).then(r => r.data),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const useSupplier = (id: string) =>
  useQuery({
    queryKey: KEYS.supplier(id),
    queryFn: () => api.get(`/suppliers/${id}`).then(r => r.data),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

export const useSupplierStats = () =>
  useQuery({
    queryKey: KEYS.supplierStats,
    queryFn: () => api.get('/suppliers/me/stats').then(r => r.data),
    staleTime: 60 * 1000,
  });

export const useSupplierSubscription = () =>
  useQuery({
    queryKey: KEYS.supplierSubscription,
    queryFn: () => api.get('/suppliers/me/subscription').then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });

export const useSubscriptionPlans = () =>
  useQuery<SubscriptionPlan[]>({ queryKey: KEYS.plans, queryFn: () => api.get('/suppliers/plans').then(r => r.data), staleTime: Infinity });

export const useUpdateSupplierProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.patch('/suppliers/me/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.me }); qc.invalidateQueries({ queryKey: KEYS.supplierStats }); },
  });
};

export const useSubmitSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.post('/suppliers/me/subscription', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.supplierSubscription }),
  });
};

export const useDeletePendingSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/suppliers/me/subscription/pending').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.supplierSubscription }),
  });
};

export const useCreateRating = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { supplierId: string; score: number; comment?: string }) =>
      api.post('/suppliers/ratings', data).then(r => r.data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: KEYS.supplier(vars.supplierId) }),
  });
};

// ── Listings ─────────────────────────────────────────────────────────────────
export const useMyListings = () =>
  useQuery({
    queryKey: KEYS.listings,
    queryFn: () => api.get('/listings/my').then(r => r.data),
    staleTime: 60 * 1000,
  });

export const useSearchListings = (products: string[], enabled: boolean) =>
  useQuery<{ data: Listing[]; total: number }>({
    queryKey: KEYS.listingSearch(products),
    queryFn: () => api.post('/listings/search', { products }).then(r => r.data),
    enabled,
    staleTime: 30 * 1000,
  });

export const useUploadListing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.listings }),
  });
};

export const useDeleteListing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.listings }),
  });
};

// ── Offers ───────────────────────────────────────────────────────────────────
export const useOffers = (params: { search?: string; page?: number } = {}) =>
  useQuery<{ data: Offer[]; total: number; totalPages: number }>({
    queryKey: KEYS.offers(params),
    queryFn: () => api.get('/offers', { params }).then(r => r.data),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const useMyOffers = () =>
  useQuery({
    queryKey: KEYS.myOffers,
    queryFn: () => api.get('/offers/my').then(r => r.data),
    staleTime: 60 * 1000,
  });

export const useCreateOffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => api.post('/offers', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.myOffers }),
  });
};

export const useDeleteOffer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/offers/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.myOffers }),
  });
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const useNotifications = (params: { limit?: number; unreadOnly?: boolean } = {}) =>
  useQuery({
    queryKey: KEYS.notifications(params),
    queryFn: () => api.get('/notifications', { params }).then(r => r.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/mark-all-read').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

// ── Admin ────────────────────────────────────────────────────────────────────
export const useAdminStats = () =>
  useQuery({
    queryKey: KEYS.adminStats,
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });

export const useAdminUsers = (params: any = {}) =>
  useQuery({
    queryKey: KEYS.adminUsers(params),
    queryFn: () => api.get('/admin/users', { params }).then(r => r.data),
    placeholderData: (p: any) => p,
    staleTime: 20 * 1000,
  });

export const useAdminPayments = (params: any = {}) =>
  useQuery({
    queryKey: KEYS.adminPayments(params),
    queryFn: () => api.get('/admin/payments', { params }).then(r => r.data),
    placeholderData: (p: any) => p,
    staleTime: 20 * 1000,
  });

export const useAdminMessages = (params: any = {}) =>
  useQuery({
    queryKey: KEYS.adminMessages(params),
    queryFn: () => api.get('/admin/messages', { params }).then(r => r.data),
    placeholderData: (p: any) => p,
    staleTime: 20 * 1000,
  });

export const useApproveUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/approve`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); qc.invalidateQueries({ queryKey: KEYS.adminStats }); },
  });
};

export const useRejectUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => api.patch(`/admin/users/${id}/reject`, { reason }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); qc.invalidateQueries({ queryKey: KEYS.adminStats }); },
  });
};

export const useApprovePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/payments/${id}/approve`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'payments'] }); qc.invalidateQueries({ queryKey: KEYS.adminStats }); },
  });
};

export const useRejectPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => api.patch(`/admin/payments/${id}/reject`, { reason }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payments'] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useToggleUserActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle-active`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

export const useMarkMessageRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/messages/${id}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'messages'] }),
  });
};

export const usePharmacistDashboard = () =>
  useQuery({
    queryKey: KEYS.pharmacistDashboard,
    queryFn: () => api.get('/pharmacists/dashboard').then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/users/change-password', data).then(r => r.data),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      api.post('/auth/forgot-password', data).then(r => r.data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      api.post('/auth/reset-password', data).then(r => r.data),
  });
};
