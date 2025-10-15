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
    <div className={`flex-1 py-3 rounded-lg flex justify-start md:justify-center items-center ${bgColor}`}>
      <div className={` rounded-full mr-4 ${color} bg-white`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-700">{title}</p>
        <p className="text-2xl font-bold text-gray-600">{value}</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl md:px-4 px-1">
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
                      <Line type="monotone" dataKey="detail.bahaya" name="Bahaya" stroke="#f48c8cff" strokeWidth={2} />
                      <Line type="monotone" dataKey="detail.mencurigakan" name="Mencurigakan" stroke="#f0ce95ff" strokeWidth={2} />
                      <Line type="monotone" dataKey="detail.normal" name="Normal" stroke="#a3c3f8ff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 p-8">Tidak ada data historis untuk ditampilkan.</p>
              )}
            </div>

            {/* Bagian Statistik Hari Ini */}
            <div className="mt-8 px-1 w-full pb-6">
              <h2 className="text-gray-7 text-lg font-semibold mb-3 flex items-center gap-2">Hari Ini</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-3">
                <StatCard icon={<FaShieldAlt size={22} />} title="Total Perubahan" value={todayStats?.total_perubahan_hari_ini ?? 0} color="text-gray-700/80" bgColor="" />
                <StatCard icon={<FaBell size={22} />} title="Normal" value={todayStats?.detail.normal ?? 0} color="text-blue-500/80" bgColor="bg-whitee" />
                <StatCard icon={<FaExclamationTriangle size={22} />} title="Mencurigakan" value={todayStats?.detail.mencurigakan ?? 0} color="text-yellow-500/80" bgColor="bg-whitee" />
                <StatCard icon={<FaExclamationTriangle size={22} />} title="Bahaya" value={todayStats?.detail.bahaya ?? 0} color="text-red-500/80" bgColor="bg-whitee" />
              </div>
              {/* Disini */}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
