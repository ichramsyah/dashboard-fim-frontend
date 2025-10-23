// src/components/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiTrash2, FiChevronsLeft, FiChevronsRight, FiFileMinus, FiGrid, FiBarChart } from 'react-icons/fi';
import { SiWordpress } from 'react-icons/si';

const navItems = [
  { name: 'Analytics', href: '/', icon: FiBarChart },
  { name: 'Log', href: '/log', icon: FiFileMinus },
  { name: 'Trash', href: '/trash', icon: FiTrash2 },
  { name: 'WordPress Log', href: '/wp-log', icon: SiWordpress },
  { name: 'Analytics', href: '/wp-analytics', icon: SiWordpress },
];

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  isMobile: boolean;
}

export default function Sidebar({ isOpen, toggle, isMobile }: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile && isOpen) {
      toggle();
    }
  };

  return (
    <aside
      className={`
        bg-whitee text-gray-9
        fixed top-0 left-0 h-full z-30
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-20'}
        md:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`flex items-center h-20 ${isOpen ? 'p-5 justify-between pt-6' : 'p-4 justify-center'}`}>
          <div className={`flex items-center space-x-1.5 ${!isOpen && 'p-0'} ${isOpen && 'p-3'}`}>
            <img src="https://assets.nsd.co.id/images/kampus/logo/Logo-Paramadina-Universitas-Paramadina-Original-PNG.png" className={`w-7 h-7 ${!isOpen && 'hidden'}`} alt="" />
            <span className={`font-bold text-[22px] text-gray-7 ${!isOpen && 'hidden'}`}>Dashboard</span>
          </div>
          {/* Toggle */}
          <button onClick={toggle} className="hidden md:block p-1 mr-[-8px] rounded-full hover:bg-gray-7/10" title={isOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}>
            {isOpen ? <FiChevronsLeft size={24} className="text-gray-4" /> : <FiChevronsRight size={24} className="text-gray-4" />}
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 py-4 space-y-2 border-t border-gray-3 mx-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`
                flex items-center py-2.5 rounded-md transition-all duration-300
                ${isOpen ? 'px-4' : ' justify-center'}
                ${pathname === item.href ? 'bg-gray-9 text-white' : 'text-gray-6 hover:bg-gray-2/50 hover:text-gray-9 hover:scale-[103%]'}
              `}
            >
              <item.icon size={20} />
              <span className={`ml-3 transition-opacity duration-200 text-[16px] ${!isOpen && 'opacity-0 hidden'}`}>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
