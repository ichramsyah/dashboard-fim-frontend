// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil token dari cookies
  const token = request.cookies.get('token')?.value;

  // 2. Ambil path URL yang sedang diakses
  const { pathname } = request.nextUrl;

  // Halaman yang ingin diproteksi
  const protectedPaths = ['/', '/trash'];

  // 3. Logika pengalihan
  // Jika tidak ada token DAN user mencoba akses halaman terproteksi
  if (!token && protectedPaths.includes(pathname)) {
    // Arahkan ke halaman login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika ada token DAN user mencoba akses halaman login
  if (token && pathname === '/login') {
    // Arahkan ke halaman utama (dashboard)
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Lanjutkan request jika semua kondisi aman
  return NextResponse.next();
}

// Konfigurasi Matcher: Tentukan di path mana saja middleware ini akan berjalan.
// Ini lebih efisien daripada menjalankan di semua request.
export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali untuk:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
