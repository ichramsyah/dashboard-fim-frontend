// app/components/SkeletonLoader.tsx
import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background-dark" role="status">
      {/* Container Relatif untuk menumpuk spinner.
        Kita buat spinner luar lebih lambat dan berputar terbalik.
      */}
      <div className="relative h-16 w-16">
        {/* Spinner LUAR:
          - Warna: sky-500
          - Durasi: 2 detik
          - Arah: Putaran terbalik (reverse)
        */}
        <div
          className="
            absolute h-full w-full rounded-full
            border-4 border-transparent border-t-white
            animate-spin [animation-duration:2s] [animation-direction:reverse]
          "
        ></div>

        {/* Spinner DALAM:
          - Warna: gray-400 (lebih redup)
          - Durasi: 1.2 detik
          - Arah: Putaran normal
        */}
        <div
          className="
            absolute h-full w-full rounded-full
            border-4 border-transparent border-b-gray-400
            animate-spin [animation-duration:1.2s]
          "
        ></div>
      </div>
    </div>
  );
}
