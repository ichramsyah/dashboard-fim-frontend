import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  itemsPerPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, totalCount, itemsPerPage }) => {
  // --- LOGIKA BARU YANG LEBIH ROBUST ---
  const getPageNumbers = () => {
    // Jika total halaman sedikit, tampilkan semua
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number | string>();
    pages.add(1); // Selalu tampilkan halaman pertama

    // Tentukan "jendela" halaman di sekitar halaman saat ini
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Sesuaikan jendela jika terlalu dekat ke awal atau akhir
    if (currentPage <= 3) {
      start = 2;
      end = 4;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages - 1;
    }

    // Tambahkan halaman dalam jendela
    for (let i = start; i <= end; i++) {
      pages.add(i);
    }

    pages.add(totalPages); // Selalu tampilkan halaman terakhir

    // Konversi Set ke Array dan tambahkan elipsis jika ada celah
    const pageArray = Array.from(pages).sort((a, b) => (a as number) - (b as number));
    const finalPages: (number | string)[] = [];

    let lastPage: number | null = null;
    for (const page of pageArray) {
      if (lastPage !== null && (page as number) - lastPage > 1) {
        finalPages.push('...');
      }
      finalPages.push(page);
      lastPage = page as number;
    }

    return finalPages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null; // Sembunyikan pagination jika hanya ada 1 halaman

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
      <p className="text-sm text-gray-600">
        Menampilkan <span className="font-semibold">{itemsPerPage}</span> dari <span className="font-semibold">{totalCount}</span> hasil
      </p>

      <nav aria-label="Pagination">
        <ul className="flex items-center -space-x-px h-10 text-base">
          {/* Tombol Sebelumnya (diganti dari "Pertama") */}
          <li>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <FaChevronLeft />
            </button>
          </li>

          {pageNumbers.map((page, index) => (
            <li key={`page-${page}-${index}`}>
              {' '}
              {/* Key yang lebih stabil */}
              {typeof page === 'number' ? (
                <button
                  onClick={() => onPageChange(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`flex items-center justify-center px-4 h-10 leading-tight border ${
                    currentPage === page ? 'z-10 text-gray-600 border-gray-300 bg-gray-2' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">{page}</span>
              )}
            </li>
          ))}

          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-s-0 border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <FaChevronRight />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
