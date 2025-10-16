'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiRotateCcw } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import Pagination from '../../components/Pagination';
import { FaSliders } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import api from '../../lib/api';

// Interface baru untuk data log WordPress
interface WpLogEntry {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  user: string;
  ip: string;
  details: string;
}

interface PaginationInfo {
  count: number;
  total_pages: number;
  current_page: number;
}

export default function WpActivityPage() {
  const [wpLogs, setWpLogs] = useState<WpLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);

  // State baru untuk filter spesifik WordPress
  const [categoryFilter, setCategoryFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchWpLogs = (page = 1, search = '', category = '', user = '', ip = '') => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (user) params.append('user', user);
    if (ip) params.append('ip', ip);

    api(`wp-logs/?${params.toString()}`)
      .then((data) => {
        setWpLogs(data.results);
        setPaginationInfo({
          count: data.count,
          total_pages: data.total_pages,
          current_page: data.current_page,
        });
        setError(null);
      })
      .catch((err: any) => {
        setError(err.message || 'Gagal memuat data aktivitas WordPress.');
        setWpLogs([]);
        setPaginationInfo(null);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchWpLogs(currentPage, searchQuery, categoryFilter, userFilter, ipFilter);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, currentPage, categoryFilter, userFilter, ipFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (paginationInfo?.total_pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchWpLogs(1, searchQuery, categoryFilter, userFilter, ipFilter);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setUserFilter('');
    setIpFilter('');
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  // Helper untuk memisahkan timestamp
  const formatTimestamp = (ts: string) => {
    const [tanggal, jam] = ts.split(' ');
    return { tanggal, jam };
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4">
        {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

        {/* Konten */}
        <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Aktivitas WordPress</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full md:w-64 py-1.5 pl-12 pr-4 bg-white rounded-lg border-2 border-transparent 
              hover:border-gray-6 focus:border-gray-6 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter */}
            <div ref={filterRef} className="relative">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="bg-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-100 transition-colors w-full justify-center" title="Filter">
                <FaSliders size={14} className="mr-2 text-gray-700" />
                <span className="text-sm text-gray-700">Filter</span>
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-10 p-4">
                  <h3 className="font-semibold mb-3">Filter Aktivitas</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Kategori (e.g., Plugin, Content)" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full border p-2 rounded text-sm" />
                    <input type="text" placeholder="User (e.g., webadm1)" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="w-full border p-2 rounded text-sm" />
                    <input type="text" placeholder="Alamat IP" value={ipFilter} onChange={(e) => setIpFilter(e.target.value)} className="w-full border p-2 rounded text-sm" />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={resetFilters} className="text-sm px-3 py-1 rounded hover:bg-gray-100">
                      Reset
                    </button>
                    <button onClick={applyFilters} className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900">
                      Terapkan
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto md:bg-white bg-transparent rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CgSpinner className="animate-spin text-gray-500" size={40} />
            </div>
          ) : wpLogs.length === 0 ? (
            <p className="text-center text-gray-500 p-8">Tidak ada aktivitas yang tercatat atau cocok dengan filter.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-white hidden md:table-header-group">
                <tr>
                  <th className="p-4 text-left text-gray-600 font-semibold">Tanggal</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Jam</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Kategori</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Aksi</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Pengguna</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Alamat IP</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 md:divide-y-0">
                {wpLogs.map((log) => (
                  <tr key={log.id} className="block md:table-row mb-4 md:mb-0 border border-none rounded-lg md:rounded-none bg-white">
                    <td data-label="Waktu:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-none">
                      <span className="text-xs text-gray-800">{formatTimestamp(log.timestamp).tanggal}</span>
                    </td>
                    <td data-label="Waktu:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-none">
                      <span className="text-gray-500 text-xs">{formatTimestamp(log.timestamp).jam}</span>
                    </td>
                    <td data-label="Kategori:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-none">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.category === 'Login' ? 'bg-green-100 text-green-800' : log.category === 'Plugin' ? 'bg-blue-100 text-blue-800' : log.category === 'Content' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td data-label="Aksi:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-none text-gray-700 font-mono">
                      {log.action}
                    </td>
                    <td data-label="Pengguna:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono border-none text-gray-700">
                      {log.user}
                    </td>
                    <td data-label="Alamat IP:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono border-none text-gray-700">
                      {log.ip}
                    </td>
                    <td data-label="Detail:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-none break-all text-gray-700">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {paginationInfo && paginationInfo.total_pages > 0 && (
          <Pagination currentPage={paginationInfo.current_page} totalPages={paginationInfo.total_pages} onPageChange={handlePageChange} totalCount={paginationInfo.count} itemsPerPage={wpLogs.length} />
        )}
      </div>
    </main>
  );
}
