// src/app/(dashboard)/layout.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// 1. Import komponen client yang baru saja kita buat
import DashboardClientLayout from '../components/DashboardClientLayout'; // Sesuaikan path jika perlu

// Fungsi untuk cek autentikasi di server
async function checkAuthentication() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return false;
  }

  try {
    const res = await fetch('http://localhost:5000/api/check-auth/', {
      // Ganti dengan URL backend Anda
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

// Ini adalah Server Component (Layout Shell)
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // 2. Lakukan pengecekan sebelum me-render apapun
  const isAuthenticated = await checkAuthentication();

  // Jika tidak terautentikasi, lempar ke halaman login
  if (!isAuthenticated) {
    redirect('/login');
  }

  // 3. Jika berhasil, render Client Layout dan teruskan children
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
