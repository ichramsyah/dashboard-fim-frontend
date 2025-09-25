'use client';

import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import { FaSlidersH, FaTrash } from 'react-icons/fa';
import Pagination from './components/Pagination';

interface LogEntry {
  id: string;
  tanggal: string;
  jam: string;
  metode: string;
  nama_file: string;
  path_lengkap: string;
  tag: string;
}

interface PaginationInfo {
  count: number;
  total_pages: number;
  current_page: number;
}

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);

  const fetchLogs = (page = 1, query = '') => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (query) {
      params.append('search', query);
    }

    const apiUrl = `http://localhost:5000/api/logs/?${params.toString()}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setLogs(data.results);
        setPaginationInfo({
          count: data.count,
          total_pages: data.total_pages,
          current_page: data.current_page,
        });
        setError(null);
      })
      .catch(() => {
        setError('Gagal mengambil data dari API. Pastikan backend berjalan.');
        setLogs([]);
        setPaginationInfo(null);
      })
      .finally(() => setIsLoading(false));
  };

  const handleMoveToTrash = (logId: string) => {
    const apiUrl = 'http://localhost:5000/api/logs/';

    if (!window.confirm('Anda yakin ingin memindahkan log ini ke tempat sampah?')) {
      return;
    }

    fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: logId }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Gagal memindahkan log');
        fetchLogs(currentPage, searchQuery);
        return response.json();
      })
      .then(() => {
        setLogs((currentLogs) => currentLogs.filter((log) => log.id !== logId));
      })
      .catch((error) => alert(`Error: ${error.message}`));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (paginationInfo?.total_pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLogs(currentPage, searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4">
        {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md">{error}</p>}
        <div className="mb-4 flex flex-col md:flex-row md:justify-between">
          <h1 className="text-[25px] font-semibold">Log Aktivitas</h1>
          <div className="flex relative items-center gap-3">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="w-full py-2 pl-12 pr-4 bg-white rounded-lg border-2 border-transparent 
             hover:border-gray-6 focus:border-gray-6 focus:outline-none transition-colors"
            />
            <button className="bg-white px-4 py-2 rounded-sm text-gray-8 flex items-center hover:bg-gray-100 transition-colors" title="Filter">
              <FaSlidersH size={16} className="mr-2 text-gray-5" /> <span> Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CgSpinner className="animate-spin text-blue-500" size={40} />
            </div>
          ) : error ? (
            <p className="text-center text-red-600 p-8">{error}</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-500 p-8">Tidak ada log yang ditemukan.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-white hidden md:table-header-group">
                <tr>
                  <th className="p-4 text-left text-gray-600 font-semibold">Tanggal</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Jam</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Metode</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Nama File</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Path Lengkap</th>
                  <th className="p-4 text-center text-gray-600 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 responsive-table">
                {logs.map((log) => (
                  <tr key={log.id} className="block md:table-row mb-4 md:mb-0 border md:border-none rounded-lg md:rounded-none">
                    {/* Tanggal */}
                    <td data-label="Tanggal:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-b md:border-none">
                      <div className="flex flex-col">
                        <span className="text-[12px] text-gray-8">{log.tanggal}</span>
                      </div>
                    </td>
                    {/* Jam */}
                    <td data-label="Jam:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-b md:border-none">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">{log.jam}</span>
                      </div>
                    </td>
                    {/* Metode */}
                    <td data-label="Metode:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-b md:border-none">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${log.tag.includes('BAHAYA') || log.tag.includes('MENCURIGAKAN') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{log.metode}</span>
                    </td>
                    {/* Nama File */}
                    <td data-label="File:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 border-b md:border-none">
                      {log.nama_file}
                    </td>
                    {/* Path Lengkap */}
                    <td data-label="Path:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 border-b md:border-none">
                      {log.path_lengkap}
                    </td>
                    {/* Aksi */}
                    <td data-label="Aksi:" className="p-4 flex justify-end md:table-cell text-right md:text-center">
                      <button onClick={() => handleMoveToTrash(log.id)} className="bg-red-500 p-2 rounded-sm text-gray-1 text-[12px] hover:bg-red-600 transition-colors" title="Pindah ke Tempat Sampah">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {paginationInfo && <Pagination currentPage={paginationInfo.current_page} totalPages={paginationInfo.total_pages} onPageChange={handlePageChange} totalCount={paginationInfo.count} itemsPerPage={logs.length} />}
      </div>
    </main>
  );
}
