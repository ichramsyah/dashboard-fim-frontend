'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiRotateCcw, FiTrash2, FiCheckSquare } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import Pagination from '../components/Pagination';
import { FaSliders } from 'react-icons/fa6';
import { FaPen, FaTimes } from 'react-icons/fa';

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

export default function TrashPage() {
  const [trashLogs, setTrashLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectLog = (logId: string) => {
    setSelectedIds((prev) => (prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]));
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === trashLogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(trashLogs.map((log) => log.id));
    }
  };

  const handleMultiplePermanentDelete = () => {
    if (!window.confirm(`Anda yakin ingin menghapus permanen ${selectedIds.length} log ini? Aksi ini tidak bisa dibatalkan.`)) {
      return;
    }
    fetch(API_BASE, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Gagal menghapus log secara massal');
        fetchTrashLogs(currentPage, searchQuery, statusFilter);
        setSelectedIds([]);
      })
      .catch((error) => alert(`Error: ${error.message}`));
  };

  const API_BASE = 'http://localhost:5000/api/trash/';

  const fetchTrashLogs = (page = 1, query = '', status = 'all') => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (query) {
      params.append('search', query);
    }
    if (status && status !== 'all') {
      params.append('status', status);
    }

    fetch(`${API_BASE}?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setTrashLogs(data.results);
        setPaginationInfo({
          count: data.count,
          total_pages: data.total_pages,
          current_page: data.current_page,
        });
        setError(null);
      })
      .catch((err: any) => {
        setError(err.message || 'Gagal memuat data dari tempat sampah.');
        setTrashLogs([]);
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
      fetchTrashLogs(currentPage, searchQuery, statusFilter);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, currentPage, statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (paginationInfo?.total_pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleRestore = async (logId: string) => {
    try {
      const res = await fetch(`${API_BASE}${logId}/restore/`, { method: 'POST' });
      if (!res.ok) throw new Error('Gagal memulihkan file');
      fetchTrashLogs(currentPage, searchQuery);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePermanentDelete = async (logId: string) => {
    if (!window.confirm('Yakin ingin menghapus permanen file ini?')) return;
    try {
      const res = await fetch(`${API_BASE}${logId}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus permanen');
      fetchTrashLogs(currentPage, searchQuery);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('ANDA YAKIN ingin mengosongkan tempat sampah? Aksi ini tidak bisa dibatalkan.')) return;
    try {
      const res = await fetch(API_BASE, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal mengosongkan tempat sampah');
      fetchTrashLogs(1, '');
    } catch (err: any) {
      alert(err.message);
    }
  };
  const filters = [
    { label: 'Semua', value: 'all' },
    { label: 'Normal', value: 'normal' },
    { label: 'Mencurigakan', value: 'mencurigakan' },
    { label: 'Bahaya', value: 'bahaya' },
  ];
  const activeFilterLabel = filters.find((f) => f.value === statusFilter)?.label;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4">
        {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

        {/* Konten */}
        <div className="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Tempat Sampah</h1>
          </div>
          <div className="flex md:flex-row flex-col md:items-center items-start gap-3">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-66 md:w-64 py-1.5 pl-12 pr-4 bg-white rounded-lg border-2 border-transparent 
             hover:border-gray-6 focus:border-gray-6 focus:outline-none transition-colors"
              />
            </div>

            {/*  Multiple Actions */}
            <div className="flex items-center gap-2">
              {isSelectMode && selectedIds.length > 0 && (
                <>
                  <button onClick={handleMultiplePermanentDelete} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm flex items-center gap-2">
                    <FiTrash2 />
                    <span>Pindahkan ({selectedIds.length})</span>
                  </button>
                </>
              )}

              <button onClick={toggleSelectMode} className={`px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${isSelectMode ? 'bg-gray-8 text-gray-1 hover:bg-gray-8' : 'text-gray-7 bg-white hover:bg-white/40'}`}>
                <span>
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
                </span>
              </button>
            </div>

            {/* Filter & delete */}
            <div className="flex items-center gap-2">
              <div ref={filterRef} className="relative">
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="bg-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-100 transition-colors" title="Filter">
                  <FaSliders size={14} className="mr-2 text-gray-700" />
                  <span className="text-sm text-gray-700">{activeFilterLabel}</span>
                </button>
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10">
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
              <div className="relative">
                <button onClick={handleEmptyTrash} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm flex items-center gap-2">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel  */}
        <div className="overflow-x-auto bg-white rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <CgSpinner className="animate-spin text-gray-500" size={40} />
            </div>
          ) : trashLogs.length === 0 ? (
            <p className="text-center text-gray-500 p-8">Tempat sampah kosong atau tidak ada hasil yang cocok.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-white hidden md:table-header-group">
                <tr>
                  {isSelectMode && (
                    <th className="p-4 w-12 text-center">
                      <input type="checkbox" className="rounded" checked={trashLogs.length > 0 && selectedIds.length === trashLogs.length} onChange={handleSelectAll} disabled={trashLogs.length === 0} />
                    </th>
                  )}
                  <th className="p-4 text-left text-gray-600 font-semibold">Tanggal</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Jam</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Metode</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Nama File</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Path Lengkap</th>
                  <th className="p-4 text-left text-gray-600 font-semibold">Kondisi</th>
                  <th className="p-4 text-center text-gray-600 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 responsive-table">
                {trashLogs.map((log) => (
                  <tr key={log.id} className={`block md:table-row mb-4 md:mb-0 border md:border-none rounded-lg md:rounded-none ${selectedIds.includes(log.id) ? 'bg-blue-50' : ''}`}>
                    {/*  */}

                    {isSelectMode && (
                      <td data-label="Pilih:" className="p-4 flex justify-end md:justify-center md:table-cell text-right md:text-left border-b md:border-none">
                        <input type="checkbox" className="rounded" checked={selectedIds.includes(log.id)} onChange={() => handleSelectLog(log.id)} />
                      </td>
                    )}
                    <td data-label="Waktu:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-b md:border-none">
                      <span className="text-xs text-gray-800">{log.tanggal}</span>
                    </td>
                    <td data-label="Jam:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-b md:border-none">
                      <span className="text-gray-500 text-xs">{log.jam}</span>
                    </td>
                    <td data-label="Metode:" className="p-4 flex justify-end md:table-cell text-right md:text-left border-b md:border-none">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${log.tag.includes('BAHAYA') || log.tag.includes('MENCURIGAKAN') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{log.metode}</span>
                    </td>
                    <td data-label="File:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 border-b md:border-none">
                      {log.nama_file}
                    </td>
                    <td data-label="Path:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 border-b md:border-none break-all">
                      {log.path_lengkap}
                    </td>
                    <td data-label="Kondisi:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 border-b md:border-none">
                      {log.tag || '-'}
                    </td>
                    <td data-label="Aksi:" className="p-4 flex justify-end md:table-cell text-right md:text-center">
                      <div className="space-x-2 flex">
                        <button onClick={() => handleRestore(log.id)} className="bg-green-500 p-2 rounded-md text-white hover:bg-green-600 transition-colors" title="Pulihkan">
                          <FiRotateCcw size={14} />
                        </button>
                        <button onClick={() => handlePermanentDelete(log.id)} className="bg-red-500 p-2 rounded-md text-white hover:bg-red-600 transition-colors" title="Hapus Permanen">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {paginationInfo && paginationInfo.total_pages > 0 && (
          <Pagination currentPage={paginationInfo.current_page} totalPages={paginationInfo.total_pages} onPageChange={handlePageChange} totalCount={paginationInfo.count} itemsPerPage={trashLogs.length} />
        )}
      </div>
    </main>
  );
}
