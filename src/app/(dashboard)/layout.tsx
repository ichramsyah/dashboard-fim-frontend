'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClientLayout from '../components/DashboardClientLayout';
import SkeletonLoader from '../components/SkeletonLoader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/check-auth/`, {
        credentials: 'include',
      });
      if (!res.ok) {
        router.push('/login');
      } else {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isChecking) return <SkeletonLoader />;

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
