// src/components/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiTrash2, FiChevronsLeft, FiChevronsRight, FiFileMinus, FiGrid, FiBarChart, FiFileText } from 'react-icons/fi';
import { SiWordpress } from 'react-icons/si';

const navItems = [
  { name: 'Analytics', href: '/', icon: FiBarChart },
  { name: 'Log', href: '/log', icon: FiFileText },
  // { name: 'Trash', href: '/trash', icon: FiTrash2 },
  { name: 'Analytics', href: '/wp-analytics', icon: SiWordpress },
  { name: 'WordPress Log', href: '/wp-log', icon: SiWordpress },
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
        bg-background-dark text-gray-9
        fixed top-0 left-0 h-full z-30
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-20'}
        md:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`flex items-center h-27 ${isOpen ? 'p-5 justify-center pt-6' : 'p-4 justify-center'}`}>
          <div className={`flex items-center space-x-1.5 ${!isOpen && 'p-0'} ${isOpen && 'p-3'}`}>
            <img src="./img/logo_paramadina.png" className={`w-34 object-cover ${!isOpen && 'hidden'}`} alt="" />
          </div>
          {/* Toggle */}
          <button onClick={toggle} className={`absolute ${isOpen ? 'right-[-10px]' : 'right-3'} md:block p-2 bg-background-dark rounded-r-full`} title={isOpen ? 'Sembunyikan Sidebar' : 'Tampilkan Sidebar'}>
            {isOpen ? <FiChevronsLeft size={26} className="text-gray-2" /> : <FiChevronsRight size={26} className="text-gray-2" />}
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 py-4 space-y-2 border-t border-gray-6 ml-5 mr-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`
                flex items-center py-2.5 rounded-md transition-all duration-300
                ${isOpen ? 'px-4' : ' justify-center'}
                ${pathname === item.href ? 'bg-gray-4/10 text-gray-1' : 'text-gray-2/60 hover:bg-gray-5/20 hover:text-gray-1 hover:scale-[103%]'}
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
