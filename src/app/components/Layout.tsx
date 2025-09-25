// src/components/Layout.tsx

'use client';
import React, { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="bg-neutral-2/70 min-h-screen">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="
            fixed inset-0 bg-black/20 bg-opacity-50 z-20
            md:hidden
          "
        ></div>
      )}

      <div
        className={`
          relative h-screen flex flex-col
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
        `}
      >
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
