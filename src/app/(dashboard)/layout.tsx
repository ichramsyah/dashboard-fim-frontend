// src/app/(dashboard)/layout.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClientLayout from '../components/DashboardClientLayout';

// async function checkAuthentication() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get('token');

//   if (!token) return false;

//   try {
//     const apiBaseUrl = process.env.API_BASE_URL_SERVER || 'http://localhost:5000/api';
//     const res = await fetch(`${apiBaseUrl}/check-auth/`, {
//       headers: {
//         Authorization: `Bearer ${token.value}`,
//       },
//       cache: 'no-store',
//     });
//     return res.ok;
//   } catch (error) {
//     console.error('Authentication check failed:', error);
//     return false;
//   }
// }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/check-auth/`, {
        credentials: 'include',
      });
      if (!res.ok) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
