// src/components/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiTrash2, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const navItems = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Trash', href: '/trash', icon: FiTrash2 },
];

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  const pathname = usePathname();

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
        <div className={`flex items-center h-16 ${isOpen ? 'p-6 justify-between' : 'p-4 justify-center'}`}>
          <span className={`font-bold text-2xl text-gray-8 ${!isOpen && 'hidden'}`}>Dashboard</span>
          {/* Toggle */}
          <button onClick={toggle} className="hidden md:block p-1 mr-[-8px] rounded-full hover:bg-gray-7/10" title={isOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}>
            {isOpen ? <FiChevronsLeft size={24} className="text-gray-4" /> : <FiChevronsRight size={24} className="text-gray-4" />}
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center mx-4 py-2.5 rounded-md transition-all duration-300
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
