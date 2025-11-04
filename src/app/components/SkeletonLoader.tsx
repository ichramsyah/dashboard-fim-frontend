import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="bg-background-dark w-full min-h-screen flex items-center justify-center">
      {' '}
      <p className="">tes</p>{' '}
    </div>
    // <div className="animate-pulse flex min-h-screen bg-background-dark">
    //   {/* Sidebar placeholder */}
    //   <div className="hidden md:block w-64 bg-login"></div>

    //   <div className="flex-1 flex flex-col">
    //     {/* Navbar placeholder */}
    //     <div className="h-14 bg-login mb-4"></div>

    //     {/* Main content skeleton */}
    //     <div className="p-6 space-y-4 w-full max-w-7xl mx-auto">
    //       {/* Title bar */}
    //       <div className="h-8 w-1/3 bg-login rounded"></div>

    //       {/* Paragraph lines */}
    //       <div className="space-y-2">
    //         <div className="h-4 w-full bg-login rounded"></div>
    //         <div className="h-4 w-5/6 bg-login rounded"></div>
    //         <div className="h-4 w-2/3 bg-login rounded"></div>
    //       </div>

    //       {/* Card grid */}
    //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
    //         {Array.from({ length: 6 }).map((_, i) => (
    //           <div key={i} className="h-32 bg-login rounded-lg"></div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}
