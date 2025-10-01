// src/components/Navbar.tsx
'use client';

import { useEffect, useState } from 'react';
import { FiLogOut, FiMenu, FiRefreshCw } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean; // Prop baru
  isMobile: boolean; // Prop baru
}

export default function Navbar({ toggleSidebar, isSidebarOpen, isMobile }: NavbarProps) {
  const router = useRouter();
  const [incronStatus, setIncronStatus] = useState<boolean | null>(null);

  const checkIncronStatus = () => {
    api('incron/control/')
      .then((data) => setIncronStatus(data.is_running))
      .catch(() => setIncronStatus(false));
  };

  // 3. Diperbarui menjadi async/await dengan 'api'
  const handleRestartIncron = async () => {
    if (!window.confirm('Anda yakin ingin me-restart layanan incron?')) return;
    try {
      await api('incron/control/', { method: 'POST' });
      alert('Perintah restart terkirim. Mohon tunggu beberapa detik lalu cek status lagi.');
      setIncronStatus(null);
      setTimeout(checkIncronStatus, 3000);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    checkIncronStatus();
  }, []);

  // 4. Diperbarui & disederhanakan dengan 'api'
  const handleLogout = async () => {
    try {
      await api('logout/', { method: 'POST' });
      // Jika berhasil, langsung lanjutkan. Tidak perlu cek res.ok
      alert('Logout berhasil!');
      router.push('/login');
    } catch (error: any) {
      // Jika gagal, wrapper akan melempar error dan ditangkap di sini
      alert(`Gagal logout: ${error.message}`);
    }
  };

  return (
    <header
      className={`
        sticky top-0 z-20 
        transition-colors duration-300
        ${isSidebarOpen && isMobile ? 'opacity-80' : 'bg-whitee'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto px-4 md:px-1 py-4 flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-gray-700 md:hidden">
            <FiMenu size={28} />
          </button>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex">
                {incronStatus === null ? (
                  <p className="text-gray-500">Mengecek...</p>
                ) : incronStatus ? (
                  <div className="flex items-center">
                    <h2 className="font-bold text-gray-700 pr-1">Active</h2>
                    <span className="text-green-500 text-2xl">●</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <h2 className="font-bold text-gray-700 pr-1">Tidak Aktif</h2>
                    <span className="text-red-500 text-2xl">●</span>
                  </div>
                )}
              </div>
              <button onClick={handleRestartIncron} className="bg-gray-9 text-white px-4 py-2 rounded-[5px] hover:rounded-[100px] transition-all flex items-center space-x-2 duration-300">
                <FiRefreshCw /> <span>Restart</span>
              </button>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-[5px] hover:bg-red-700 flex items-center space-x-2">
                <FiLogOut /> <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
