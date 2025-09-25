// src/app/trash/page.tsx (LENGKAP & DIPERBARUI)

'use client';

import React, { useState, useEffect } from 'react';
// Impor ikon
import { FiSearch } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';

// Interface untuk Log
interface LogEntry {
  id: string;
  tanggal: string;
  jam: string;
  metode: string;
  nama_file: string;
  path_lengkap: string;
  tag: string;
}

// Interface untuk informasi pagination
interface PaginationInfo {
  count: number;
  total_pages: number;
  current_page: number;
}

export default function TrashPage() {
  const [trashLogs, setTrashLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // === STATE BARU untuk Search & Pagination ===
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);

  const API_BASE = 'http://localhost:5000/api/trash/';

  // === FUNGSI FETCH LOGS YANG DIPERBARUI ===
  const fetchTrashLogs = (page = 1, query = '') => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (query) {
      params.append('search', query);
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

  // === useEffect DIPERBARUI untuk menangani debounce search ===
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTrashLogs(currentPage, searchQuery);
    }, 500); // Tunda 500ms

    return () => clearTimeout(handler);
  }, [searchQuery, currentPage]);

  // === FUNGSI-FUNGSI AKSI ===
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (paginationInfo?.total_pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset ke halaman 1 saat mencari
  };

  const handleRestore = async (logId: string) => {
    try {
      const res = await fetch(`${API_BASE}${logId}/restore/`, { method: 'POST' });
      if (!res.ok) throw new Error('Gagal memulihkan file');
      // Muat ulang data setelah berhasil
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
      // Muat ulang data setelah berhasil
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
      // Muat ulang data setelah berhasil
      fetchTrashLogs(1, ''); // Reset ke halaman 1
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
        <button onClick={handleEmptyTrash} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full md:w-auto">
          Kosongkan Sampah
        </button>
      </div>

      {/* === KOMPONEN SEARCH BAR === */}
      <div className="mb-6 relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Cari di tempat sampah..." className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* === KONTEN UTAMA (TABEL) === */}
      <div className="overflow-x-auto bg-white shadow rounded-md">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <CgSpinner className="animate-spin text-blue-500" size={40} />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 p-8">{error}</p>
        ) : trashLogs.length === 0 ? (
          <p className="text-center text-gray-500 p-8">Tempat sampah kosong.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Jam</th>
                <th className="p-3">Metode</th>
                <th className="p-3">Nama File</th>
                <th className="p-3">Path</th>
                <th className="p-3">Tag</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {trashLogs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-3">{log.tanggal}</td>
                  <td className="p-3">{log.jam}</td>
                  <td className="p-3">{log.metode}</td>
                  <td className="p-3">{log.nama_file}</td>
                  <td className="p-3">{log.path_lengkap}</td>
                  <td className="p-3">{log.tag}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleRestore(log.id)} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">
                      Pulihkan
                    </button>
                    <button onClick={() => handlePermanentDelete(log.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
                      Hapus Permanen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* === KOMPONEN PAGINATION === */}
      {!isLoading && paginationInfo && paginationInfo.total_pages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{trashLogs.length}</span> dari <span className="font-semibold">{paginationInfo.count}</span> hasil
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors">
              Sebelumnya
            </button>
            <span className="text-gray-700 font-medium">
              {paginationInfo.current_page} / {paginationInfo.total_pages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationInfo.total_pages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
