'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CgSpinner } from 'react-icons/cg';
import { FaExclamationTriangle, FaBell, FaShieldAlt } from 'react-icons/fa';
import api from '../lib/api';
import LogTable from '../components/LogTable';
import { DatePicker } from '../components/DatePicker';
import { format } from 'date-fns';

interface TodayStats {
  tanggal_analisis: string;
  total_perubahan_hari_ini: number;
  detail: { bahaya: number; mencurigakan: number; normal: number };
}
interface HistoricalDataEntry {
  tanggal: string;
  total_perubahan: number;
  detail: { bahaya: number; mencurigakan: number; normal: number };
}
interface LogEntry {
  id: string;
  jam: string;
  metode: string;
  nama_file: string;
  path_lengkap: string;
  tag: string;
}
interface TodayLogs {
  normal: LogEntry[];
  mencurigakan: LogEntry[];
  bahaya: LogEntry[];
}
interface ReportData {
  stats: TodayStats | null;
  logs: TodayLogs;
}

export default function Home() {
  const [historicalData, setHistoricalData] = useState<HistoricalDataEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [todayData, setTodayData] = useState<ReportData | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [activeReportDate, setActiveReportDate] = useState<string>('Hari Ini');
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [todayStats, historicalResponse, todayLogs] = await Promise.all([api('logs/analytics/'), api(`logs/analytics/historical/?days=${days}`), api('logs/today/')]);

        const initialTodayData = { stats: todayStats, logs: todayLogs };
        setTodayData(initialTodayData);
        setReportData(initialTodayData);
        setHistoricalData(historicalResponse.slice().reverse());
        setActiveReportDate('Hari Ini');
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data analisis.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [days]);

  const handleDateSelect = async (date: string) => {
    if (activeReportDate === date) return;

    setIsFetchingDetails(true);
    setActiveReportDate(date);
    try {
      const [statsResponse, logsResponse] = await Promise.all([api(`logs/stats-by-date/?date=${date}`), api(`logs/by-date/?date=${date}`)]);
      setReportData({ stats: statsResponse, logs: logsResponse });
    } catch (err) {
      console.error(`Gagal mengambil laporan untuk tanggal ${date}:`, err);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const resetToToday = () => {
    if (todayData) {
      setReportData(todayData);
      setActiveReportDate('Hari Ini');
    }
  };

  const availableDatesSet = new Set(historicalData.map((d) => new Date(d.tanggal).setHours(0, 0, 0, 0)));
  if (todayData?.stats && todayData.stats.total_perubahan_hari_ini > 0) {
    availableDatesSet.add(new Date().setHours(0, 0, 0, 0));
  }

  const StatCard = ({ icon, title, value, color, bgColor }: any) => (
    <div className={`flex-1 pl-4 py-3.5 rounded-lg flex items-center ${bgColor}`}>
      <div className={`rounded-full mr-4 ${color} p-2 bg-white`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-700">{title}</p>
        <p className="text-xl font-bold text-gray-600">{value}</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl md:px-4 px-1">
        <h1 className="text-2xl font-bold mb-5">Analisis Aktivitas FIM</h1>
        {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <CgSpinner className="animate-spin text-gray-500" size={40} />
          </div>
        ) : (
          <div>
            <div className="bg-white px-7 pt-6 pb-7 rounded-lg">
              {/* Bagian Grafik */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1">
                <h2 className="text-gray-7 text-lg font-semibold mb-2 sm:mb-0">Grafik</h2>
                <div className="flex items-center gap-2">
                  {[7, 15, 30].map((d) => (
                    <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${days === d ? 'bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      {d} Hari
                    </button>
                  ))}
                </div>
              </div>
              {historicalData.length > 0 ? (
                <div style={{ width: '100%', height: 320, cursor: 'pointer' }}>
                  <ResponsiveContainer>
                    <LineChart data={historicalData} margin={{ top: 5, left: -30, bottom: 5, right: 10 }} onClick={(e: any) => e?.activePayload?.[0]?.payload?.tanggal && handleDateSelect(e.activePayload[0].payload.tanggal)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tanggal" fontSize={12} tickFormatter={(tick) => tick.substring(5)} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip /> <Legend />
                      <Line type="monotone" dataKey="detail.bahaya" name="Bahaya" stroke="#f48c8cff" strokeWidth={2} />
                      <Line type="monotone" dataKey="detail.mencurigakan" name="Mencurigakan" stroke="#f0ce95ff" strokeWidth={2} />
                      <Line type="monotone" dataKey="detail.normal" name="Normal" stroke="#a3c3f8ff" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-gray-500 p-8 bg-white rounded-lg border border-gray-200">Tidak ada data historis yang tersedia.</div>
              )}
            </div>

            <div className="bg-white px-7 py-6 rounded-lg mt-7">
              {/* Bagian Laporan */}
              <div className="px-1 w-full pb-6">
                <div className="mb-6">
                  <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h3 className="text-gray-700 text-lg font-semibold mb-3 sm:mb-0">Laporan {activeReportDate}</h3>
                    <DatePicker selectedDate={activeReportDate} onDateSelect={handleDateSelect} resetToToday={resetToToday} availableDates={availableDatesSet} />
                  </div>
                </div>

                {isFetchingDetails ? (
                  <div className="flex justify-center items-center h-64">
                    <CgSpinner className="animate-spin text-gray-500" size={40} />
                  </div>
                ) : (
                  <>
                    <div className="gap-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                      <StatCard icon={<FaShieldAlt size={22} />} title="Total Perubahan" value={reportData?.stats?.total_perubahan_hari_ini ?? 0} color="text-gray-700/80" bgColor="bg-gray-100" />
                      <StatCard icon={<FaBell size={22} />} title="Normal" value={reportData?.stats?.detail.normal ?? 0} color="text-blue-500/80" bgColor="bg-blue-100" />
                      <StatCard icon={<FaExclamationTriangle size={22} />} title="Mencurigakan" value={reportData?.stats?.detail.mencurigakan ?? 0} color="text-yellow-500/80" bgColor="bg-yellow-100" />
                      <StatCard icon={<FaExclamationTriangle size={22} />} title="Bahaya" value={reportData?.stats?.detail.bahaya ?? 0} color="text-red-500/80" bgColor="bg-red-100" />
                    </div>
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-1 gap-6">
                      <LogTable title="Normal" logs={reportData?.logs.normal ?? []} bgColor="bg-blue-100" />
                      <LogTable title="Mencurigakan" logs={reportData?.logs.mencurigakan ?? []} bgColor="bg-yellow-100" />
                      <LogTable title="Bahaya" logs={reportData?.logs.bahaya ?? []} bgColor="bg-red-100" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
