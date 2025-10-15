'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiCheckSquare, FiSearch, FiTrash2 } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import { FaSlidersH, FaTimes, FaTrash } from 'react-icons/fa';
import api from '../../lib/api';
import Pagination from '../../components/Pagination';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds([]);
  };

  const handleSelectLog = (logId: string) => {
    setSelectedIds((prev) => (prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === logs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(logs.map((log) => log.id));
    }
  };

  const handleMultipleMoveToTrash = async () => {
    const result = await Swal.fire({
      title: 'Pindahkan Beberapa Log?',
      text: `Anda yakin ingin memindahkan ${selectedIds.length} log ini ke tempat sampah?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'rgba(21, 21, 21, 1)',
      cancelButtonColor: '#a3a3a3ff',
      confirmButtonText: 'Ya, pindahkan!',
      cancelButtonText: 'Batal',
    });
    if (!result.isConfirmed) return;
    try {
      await api('logs/', {
        method: 'DELETE',
        body: JSON.stringify({ ids: selectedIds }),
      });
      toast.success(`${selectedIds.length} log berhasil dipindahkan.`);
      fetchLogs(currentPage, searchQuery, statusFilter);
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const fetchLogs = (page = 1, query = '', status = 'all') => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (query) params.append('search', query);
    if (status && status !== 'all') params.append('status', status);

    api(`logs/?${params.toString()}`)
      .then((data) => {
        setLogs(data.results);
        setPaginationInfo({
          count: data.count,
          total_pages: data.total_pages,
          current_page: data.current_page,
        });
        setError(null);
      })
      .catch((err: any) => {
        setError(err.message || 'Gagal mengambil data dari API.');
        setLogs([]);
        setPaginationInfo(null);
      })
      .finally(() => setIsLoading(false));
  };

  const handleMoveToTrash = async (logId: string) => {
    try {
      await api('logs/', {
        method: 'DELETE',
        body: JSON.stringify({ id: logId }),
      });
      toast.success('Berhasil dipindahkan ke tempat sampah.');
      fetchLogs(currentPage, searchQuery, statusFilter);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (paginationInfo?.total_pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchLogs(currentPage, searchQuery, statusFilter);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, currentPage, statusFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const filters = [
    { label: 'Semua', value: 'all' },
    { label: 'Normal', value: 'normal' },
    { label: 'Mencurigakan', value: 'mencurigakan' },
    { label: 'Bahaya', value: 'bahaya' },
  ];

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

  const activeFilterLabel = filters.find((f) => f.value === statusFilter)?.label;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-4 flex flex-col md:flex-row md:justify-between">
          <h1 className="text-[25px] mb-4 md:mb-0 font-semibold">Log Aktivitas</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full py-2 pl-12 pr-4 bg-white rounded-lg border-2 border-transparent 
             hover:border-gray-6 focus:border-gray-6 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              {isSelectMode && selectedIds.length > 0 && (
                <button onClick={handleMultipleMoveToTrash} className="bg-red-500 text-white px-3 py-2.5 rounded-lg hover:bg-red-600 text-sm flex items-center gap-2">
                  <FiTrash2 />
                  <span>Pindahkan ({selectedIds.length})</span>
                </button>
              )}

              <button onClick={toggleSelectMode} className={`px-3 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${isSelectMode ? 'bg-gray-9 text-white hover:bg-gray-800' : 'text-gray-7 bg-white hover:bg-white/40'}`}>
                {isSelectMode ? (
                  <div className="flex items-center gap-1.5">
                    <FaTimes />
                    <span>Batal</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <FiCheckSquare />
                    <span>Pilih</span>
                  </div>
                )}
              </button>
            </div>

            <div ref={filterRef} className="relative">
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="bg-white px-4 py-2.5 rounded-lg text-gray-700 flex items-center hover:bg-gray-100 transition-colors " title="Filter">
                <FaSlidersH size={14} className="mr-2 text-gray-500" />
                <span className="text-sm">{activeFilterLabel}</span>
              </button>

              {/* Menu Dropdown */}
              {isFilterOpen && (
                <div className="absolute md:right-0 sm:right-[-90px] mt-2 w-48 bg-white rounded-lg shadow-xl z-10">
                  <div className="py-1">
                    {filters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleFilterChange(filter.value)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${statusFilter === filter.value ? 'bg-gray-1 text-gray-9' : 'text-gray-6 hover:bg-gray-1'}`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto md:bg-white bg-transparent rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CgSpinner className="animate-spin text-gray-500" size={40} />
            </div>
          ) : error ? (
            <p className="text-center text-red-600 p-8">{error}</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-500 p-8">Tidak ada log yang ditemukan.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="hidden md:table-header-group">
                <tr>
                  {isSelectMode && (
                    <th className="p-4 w-12 text-center">
                      <input type="checkbox" className="rounded" checked={logs.length > 0 && selectedIds.length === logs.length} onChange={handleSelectAll} />
                    </th>
                  )}

                  <th className="p-4 text-left text-gray-600 font-semibold">Tanggal</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Jam</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Metode</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Nama File</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Path Lengkap</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Kondisi</th>
                  <th className="p-4 text-center text-gray-600 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className={`block md:table-row mb-6 md:mb-0 border-none rounded-lg md:rounded-none bg-white ${selectedIds.includes(log.id) ? 'bg-blue-50' : ''}`}>
                    {isSelectMode && (
                      <td data-label="Pilih:" className="p-4 flex justify-end md:justify-center md:table-cell text-right md:text-left ">
                        <input type="checkbox" className="rounded" checked={selectedIds.includes(log.id)} onChange={() => handleSelectLog(log.id)} />
                      </td>
                    )}

                    {/* Tanggal */}
                    <td data-label="Tanggal:" className="p-4 flex justify-end md:table-cell text-right md:text-left ">
                      <div className="flex flex-col">
                        <span className="text-[12px] text-gray-8">{log.tanggal}</span>
                      </div>
                    </td>
                    {/* Jam */}
                    <td data-label="Jam:" className="p-4 flex justify-end md:table-cell text-right md:text-left ">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">{log.jam}</span>
                      </div>
                    </td>
                    {/* Metode */}
                    <td data-label="Metode:" className="p-4 flex justify-end md:table-cell text-right md:text-left ">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${log.tag.includes('BAHAYA') || log.tag.includes('MENCURIGAKAN') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{log.metode}</span>
                    </td>
                    {/* Nama File */}
                    <td data-label="File:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 ">
                      {log.nama_file}
                    </td>
                    {/* Path Lengkap */}
                    <td data-label="Path:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700  break-all">
                      {log.path_lengkap}
                    </td>
                    {/* Kondisi */}
                    <td data-label="Kondisi:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 ">
                      {log.tag}
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
