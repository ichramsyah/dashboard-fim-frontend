// components/LogTable.tsx

import React from 'react';

interface LogEntry {
  id: string;
  jam: string;
  metode: string;
  nama_file: string;
  path_lengkap: string;
  tag: string;
  comm: string;
  exe: string;
  user: string;
}

interface LogTableProps {
  title: string;
  logs: LogEntry[];
  bgColor?: string;
}

const LogTable: React.FC<LogTableProps> = ({ title, logs, bgColor }) => {
  if (logs.length === 0) {
    return (
      <div className="mb-6">
        <h3 className={`text-sm text-gray-3 mb-2`}>{title} (0)</h3>
        <div className="text-center text-gray-500 p-8 rounded-lg border border-gray-5/70">Tidak ada data log yang tersedia.</div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className={`text-sm text-gray-5 font-semibold mb-2`}>
        {title} ({logs.length})
      </h3>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm">
          <thead className={`${bgColor} hidden md:table-header-group`}>
            <tr>
              <th className="p-4 text-left text-gray-600 font-semibold">Jam</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Nama File</th>
              <th className="p-4 text-left text-gray-600 font-semibold">User</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Command</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Eksekusi</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Metode</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Path File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 md:divide-y-0">
            {logs.map((log) => (
              <tr key={log.id} className="block md:table-row mb-4 md:mb-0 border md:border-none rounded-lg md:rounded-none">
                <td data-label="Jam:" className="p-4 flex justify-end md:table-cell text-right md:text-left ">
                  <span className="text-gray-500">{log.jam}</span>
                </td>
                <td data-label="File:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 ">
                  {log.nama_file}
                </td>
                <td data-label="User:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 ">
                  {log.user}
                </td>
                <td data-label="Command:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 ">
                  {log.comm}
                </td>
                <td data-label="Eksekusi:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 ">
                  {log.exe}
                </td>
                <td data-label="Metode:" className="p-4 flex justify-end md:table-cell text-right md:text-left ">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      log.tag.includes('[BAHAYA]') ? 'bg-red-100 text-red-800' : log.tag.includes('[KEGIATAN MENCURIGAKAN]') ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {log.metode}
                  </span>
                </td>

                <td data-label="Path:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-500  break-all">
                  {log.path_lengkap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;
