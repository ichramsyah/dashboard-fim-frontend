'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CgSpinner } from 'react-icons/cg';
import { FaRegCalendarAlt, FaExclamationTriangle, FaBell, FaShieldAlt } from 'react-icons/fa';
import api from '../lib/api';

interface TodayStats {
  tanggal_analisis: string;
  total_perubahan_hari_ini: number;
  detail: {
    bahaya: number;
    mencurigakan: number;
    normal: number;
  };
}

interface HistoricalDataEntry {
  tanggal: string;
  total_perubahan: number;
  detail: {
    bahaya: number;
    mencurigakan: number;
    normal: number;
  };
}

export default function Home() {
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [todayResponse, historicalResponse] = await Promise.all([api('logs/analytics/'), api(`logs/analytics/historical/?days=${days}`)]);

        setTodayStats(todayResponse);
        setHistoricalData(historicalResponse.slice().reverse());
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data analisis.');
        setTodayStats(null);
        setHistoricalData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [days]);

  const StatCard = ({ icon, title, value, color, bgColor }: any) => (
    <div className={`flex-1 p-4 rounded-lg flex items-center ${bgColor}`}>
      <div className={`p-3 rounded-full mr-4 ${color} bg-white`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4">
        <h1 className="text-2xl font-bold mb-4">Analisis Aktivitas</h1>

        {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <CgSpinner className="animate-spin text-gray-500" size={40} />
          </div>
        ) : (
          <div className="bg-white px-7 py-6 rounded-lg">
            {/* Bagian Grafik Historis */}
            <div className=" rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1">
                <h2 className="text-gray-7 text-lg font-semibold mb-2 sm:mb-0">Grafik</h2>
                <div className="flex items-center gap-2">
                  {[7, 15, 30].map((d) => (
                    <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 text-sm rounded-md transition-colors ${days === d ? 'bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      {d} Hari
                    </button>
                  ))}
                </div>
              </div>

              {historicalData.length > 0 ? (
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <LineChart data={historicalData} margin={{ top: 5, left: -30, bottom: 5, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tanggal" fontSize={12} tickFormatter={(tick) => tick.substring(5)} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="detail.bahaya" name="Bahaya" stroke="#f06e6eff" strokeWidth={2} />
                      <Line type="monotone" dataKey="detail.mencurigakan" name="Mencurigakan" stroke="#f3be64ff" strokeWidth={2} />
                      <Line type="monotone" dataKey="detail.normal" name="Normal" stroke="#84aff5ff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 p-8">Tidak ada data historis untuk ditampilkan.</p>
              )}
            </div>

            {/* Bagian Statistik Hari Ini */}

            <div className="mt-8 px-1 w-full">
              <h2 className="text-gray-7 text-lg font-semibold mb-3 flex items-center gap-2">Hari Ini</h2>
              <div className="md:w-1/2 lg:w-1/2 sm:w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  <StatCard icon={<FaShieldAlt size={22} />} title="Total Perubahan" value={todayStats?.total_perubahan_hari_ini ?? 0} color="text-gray-700" bgColor="bg-gray-100" />
                  <StatCard icon={<FaBell size={22} />} title="Normal" value={todayStats?.detail.normal ?? 0} color="text-blue-500" bgColor="bg-blue-50" />
                  <StatCard icon={<FaExclamationTriangle size={22} />} title="Mencurigakan" value={todayStats?.detail.mencurigakan ?? 0} color="text-yellow-500" bgColor="bg-yellow-50" />
                  <StatCard icon={<FaExclamationTriangle size={22} />} title="Bahaya" value={todayStats?.detail.bahaya ?? 0} color="text-red-500" bgColor="bg-red-50" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
