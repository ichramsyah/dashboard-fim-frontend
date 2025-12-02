'use client';

import React from 'react';
import { FiServer } from 'react-icons/fi';

export default function DashboardHome() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-4/10 border border-gray-6/40 p-5 rounded-lg flex items-center gap-4">
            <div className="p-3 bg-blue-900/30 rounded-full text-blue-400">
              <FiServer size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Server Dipantau</p>
              <p className="text-2xl font-bold text-gray-100">4</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
