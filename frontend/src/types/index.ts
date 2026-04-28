// src/types/index.ts
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'pharmacist' | 'supplier';
  status: 'pending' | 'approved' | 'rejected';
  isActive?: boolean;
  profile?: Profile;
}

export interface Profile {
  companyName?: string;
  address?: string;
  wilaya?: string;
  phone?: string;
  description?: string;
  avatarUrl?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  address?: string;
  wilaya?: string;
  avatarUrl?: string;
  description?: string;
  email?: string;
  memberSince?: string;
  listingsCount: number;
  activeOffersCount: number;
  rating: number;
  reviewsCount: number;
  subscriptionTier?: 'gold' | 'silver' | 'bronze' | null;
  subscriptionName?: string | null;
  hasActiveSubscription: boolean;
}

export interface Listing {
  id: string;
  title: string;
  fileUrl: string;
  views: number;
  downloads: number;
  createdAt: string;
  supplier?: {
    id: string;
    name: string;
    wilaya?: string;
    avatarUrl?: string;
    tier?: string | null;
  };
  matchingProducts?: { productName: string; price?: number; quantity?: number }[];
  matchingCount?: number;
  totalProducts?: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  fileUrl?: string;
  views: number;
  createdAt: string;
  expiresAt: string;
  supplier: {
    id: string;
    name: string;
    wilaya?: string;
    avatarUrl?: string;
    email?: string;
    tier?: string;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'gold' | 'silver' | 'bronze';
  price: number;
  yearlyPrice: number;
  durationDays: number;
  features: string[];
}

export interface SubscriptionPayment {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  proofUrl: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  isActive: boolean;
  createdAt: string;
  trialActive?: boolean;
  accessGranted?: boolean;
  subscriptionPlan: SubscriptionPlan;
}

export interface AdminStats {
  totalPharmacists: number;
  totalSuppliers: number;
  pendingUsers: number;
  pendingPayments: number;
  newMessages: number;
  activeSubscriptions: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Wilaya {
  code: number;
  nom: string;
}
