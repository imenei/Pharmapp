'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function SupplierRootPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/supplier/dashboard'); }, [router]);
  return null;
}
