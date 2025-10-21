'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CgSpinner } from 'react-icons/cg';
import { FaUserCheck, FaUserTimes, FaFileAlt, FaPlug } from 'react-icons/fa';
import api from '../../lib/api';

// Interface untuk mencocokkan struktur data dari API
interface AnalyticsData {
  summary_today: {
    login_success: number;
    login_fail: number;
    content_activity: number;
    plugin_activity: number;
  };
  top_5_users: [string, number][];
  top_5_ips: [string, number][];
  top_5_failed_ips: [string, number][];
  trend_analysis: {
    date: string;
    login_success: number;
    login_fail: number;
    content: number;
    plugin: number;
  }[];
}

// Komponen kecil untuk menampilkan kartu statistik
const StatCard = ({ icon, title, value, color, bgColor }: any) => (
  <div className={`flex-1 pl-4 py-3.5 rounded-lg flex items-center ${bgColor}`}>
    <div className={`rounded-full mr-4 ${color} p-2 bg-white`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-700">{title}</p>
      <p className="text-xl font-bold text-gray-600">{value}</p>
    </div>
  </div>
);

// Komponen kecil untuk menampilkan tabel Top 5
const TopListTable = ({ title, data, headers }: { title: string; data: [string, number][]; headers: [string, string] }) => (
  <div className="bg-gray-50 p-4 rounded-lg border">
    <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
    {data.length > 0 ? (
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-1">{headers[0]}</th>
            <th className="py-1 text-right">{headers[1]}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map(([item, count]) => (
            <tr key={item}>
              <td className="py-1.5 font-mono">{item}</td>
              <td className="py-1.5 font-mono text-right">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="text-sm text-gray-400 text-center py-4">Tidak ada data.</p>
    )}
  </div>
);

export default function WordPressAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api('wp-logs/analytics/');
        setAnalyticsData(data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data analytics WordPress.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl md:px-4 px-1">
        <h1 className="text-2xl font-bold mb-5">Laporan Aktivitas WordPress</h1>
        {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <CgSpinner className="animate-spin text-gray-500" size={40} />
          </div>
        ) : !analyticsData ? (
          <p className="text-center text-gray-500 p-8">Tidak ada data analytics untuk ditampilkan.</p>
        ) : (
          <div className="space-y-7">
            {/* Bagian Ringkasan Hari Ini */}
            <div className="bg-white px-7 py-6 rounded-lg">
              <h2 className="text-gray-7 text-lg font-semibold mb-4">Ringkasan Hari Ini</h2>
              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<FaUserCheck size={20} />} title="Login Berhasil" value={analyticsData.summary_today.login_success} color="text-green-500" bgColor="bg-green-50" />
                <StatCard icon={<FaUserTimes size={20} />} title="Login Gagal" value={analyticsData.summary_today.login_fail} color="text-red-500" bgColor="bg-red-50" />
                <StatCard icon={<FaFileAlt size={20} />} title="Aktivitas Konten" value={analyticsData.summary_today.content_activity} color="text-blue-500" bgColor="bg-blue-50" />
                <StatCard icon={<FaPlug size={20} />} title="Aktivitas Plugin" value={analyticsData.summary_today.plugin_activity} color="text-yellow-500" bgColor="bg-yellow-50" />
              </div>
            </div>

            {/* Bagian Grafik Tren */}
            <div className="bg-white px-7 pt-6 pb-7 rounded-lg">
              <h2 className="text-gray-7 text-lg font-semibold mb-4">Tren Aktivitas (30 Hari Terakhir)</h2>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={analyticsData.trend_analysis} margin={{ top: 5, left: -30, bottom: 5, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} tickFormatter={(tick) => tick.substring(5)} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="login_fail" name="Login Gagal" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="login_success" name="Login Sukses" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="content" name="Konten" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="plugin" name="Plugin" stroke="#f59e0b" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bagian Top 5 */}
            <div className="bg-white px-7 py-6 rounded-lg">
              <h2 className="text-gray-7 text-lg font-semibold mb-4">Peringkat Teratas (30 Hari Terakhir)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TopListTable title="Pengguna Paling Aktif" data={analyticsData.top_5_users} headers={['Username', 'Aktivitas']} />
                <TopListTable title="Alamat IP Paling Aktif" data={analyticsData.top_5_ips} headers={['Alamat IP', 'Aktivitas']} />
                <TopListTable title="Top IP Penyerang (Login Gagal)" data={analyticsData.top_5_failed_ips} headers={['Alamat IP', 'Percobaan']} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
