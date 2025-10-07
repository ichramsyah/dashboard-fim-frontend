// src/app/(dashboard)/layout.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClientLayout from '../components/DashboardClientLayout';

async function checkAuthentication() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return false;
  }

  try {
    const apiUrl = process.env.API_BASE_URL_SERVER;
    const res = await fetch(`${apiUrl}/check-auth/`, {
      headers: {
        Cookie: `token=${token.value}`,
      },
      cache: 'no-store',
    });
    return res.ok;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) {
    redirect('/login');
  }
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
