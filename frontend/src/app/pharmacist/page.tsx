'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function PharmacistRootPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/pharmacist/dashboard'); }, [router]);
  return null;
}
