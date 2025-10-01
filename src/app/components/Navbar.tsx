// src/components/Navbar.tsx
'use client';

import { useEffect, useState } from 'react';
import { FiLogOut, FiMenu, FiRefreshCw } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
}

export default function Navbar({ toggleSidebar, isSidebarOpen, isMobile }: NavbarProps) {
  const router = useRouter();
  const [incronStatus, setIncronStatus] = useState<boolean | null>(null);

  const checkIncronStatus = () => {
    api('incron/control/')
      .then((data) => setIncronStatus(data.is_running))
      .catch(() => setIncronStatus(false));
  };

  useEffect(() => {
    checkIncronStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await api('logout/', { method: 'POST' });
      alert('Logout berhasil!');
      router.push('/login');
    } catch (error: any) {
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
                    <h2 className="font-bold text-gray-700 pr-2">Incron Aktif</h2>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <h2 className="font-bold text-gray-700 pr-2">Incron Tidak Aktif</h2>
                    <span className="flex h-3 w-3">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </div>
                )}
              </div>

              <button onClick={handleLogout} className="bg-red-600 cursor-pointer text-white px-4 py-1.5 rounded-[5px] hover:rounded-[100px] transition-all flex items-center space-x-2 duration-300">
                <FiLogOut /> <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
