'use client';

import React, { useState, useEffect } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { FaUserCheck, FaUserTimes, FaFileAlt, FaPlug } from 'react-icons/fa';
import api from '../../lib/api';
import { DatePicker } from '../../components/DatePicker';
import { format } from 'date-fns';
import { ParentSize } from '@visx/responsive';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import CustomWpAreaChart from '../../components/CustomWpAreaChart';

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
interface WpLogEntry {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  user: string;
  ip: string;
  details: string;
}
interface WpTodayLogs {
  login: WpLogEntry[];
  plugin: WpLogEntry[];
  content: WpLogEntry[];
  user_management: WpLogEntry[];
  lainnya: WpLogEntry[];
}

const StatCard = ({ icon, title, value, color }: any) => (
  <div className={`flex-1 pl-4 py-5 rounded-lg flex items-center bg-gray-6/10 border border-gray-6/40`}>
    <div className={`rounded-full mr-4 ${color} p-4 bg-gray-7/30`}>{icon}</div>
    <div>
      <p className="text-[15px] text-gray-400">{title}</p>
      <p className="text-[25px] font-bold text-gray-100">{value}</p>
    </div>
  </div>
);

const TopListTable = ({ title, data, headers }: { title: string; data: [string, number][]; headers: [string, string] }) => (
  <div>
    <h3 className="text-sm text-gray-200 mb-5">{title}</h3>
    {data.length > 0 ? (
      <div className="overflow-x-auto rounded-md">
        <table className="min-w-full text-sm bg-background-dark">
          <thead className="bg-gray-6/20">
            <tr className="border-none">
              <th className="p-3 text-left text-gray-300 border-none">{headers[0]}</th>
              <th className="p-3 text-right text-gray-300 border-none">{headers[1]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-5/30">
            {data.map(([item, count]) => (
              <tr key={item}>
                <td className="p-3 font-mono text-gray-300 border-none ">{item}</td>
                <td className="p-3 font-mono text-right text-gray-300 border-none ">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-sm text-gray-400 text-center py-8 border rounded-md">Tidak ada data.</div>
    )}
  </div>
);

const getActionBadgeColor = (action: string) => {
  const lowerAction = action.toLowerCase();
  switch (lowerAction) {
    case 'failed':
    case 'deactivated':
    case 'deleted':
      return 'bg-red-700 text-gray-100';
    case 'success':
    case 'activated':
    case 'installed':
      return 'bg-green-700 text-gray-100';
    case 'updated':
    case 'status changed':
      return 'bg-blue-700 text-gray-100';
    default:
      return 'bg-gray-700 text-gray-100';
  }
};

const WpLogTable = ({ title, logs }: { title: string; logs: WpLogEntry[] }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex justify-between items-center">
        <h3 className="text-md text-gray-200">
          {title} ({logs.length})
        </h3>

        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-300 px-2 py-2 bg-gray-5/30 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-6/40 transition-colors"
          title={isVisible ? 'Sembunyikan Tabel' : 'Tampilkan Tabel'}
        >
          {isVisible ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
        </button>
      </div>

      {isVisible && (
        <div className="overflow-x-auto bg-transparent rounded-lg transition-all duration-300 ease-in-out">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-6/20 hidden md:table-header-group">
              <tr>
                <th className="p-4 text-left text-gray-300 font-semibold">Waktu</th>
                <th className="p-4 text-left text-gray-300 font-semibold">User</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Alamat IP</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Aksi</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 md:divide-y-0">
              {logs
                .slice()
                .reverse()
                .map((log) => (
                  <tr key={log.id} className="block md:table-row mb-4 md:mb-0 rounded-lg md:rounded-none">
                    <td data-label="Waktu:" className="p-4 flex justify-end md:table-cell text-right md:text-left border border-gray-800 md:border-none">
                      <span className="text-gray-400">{log.timestamp.split(' ')[1]}</span>
                    </td>
                    <td data-label="User:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-300 border border-gray-800 md:border-none">
                      {log.user}
                    </td>
                    <td data-label="Alamat IP:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-300 border border-gray-800 md:border-none">
                      {log.ip}
                    </td>
                    <td data-label="Aksi:" className="p-4 flex justify-end md:table-cell text-right md:text-left border border-gray-800 md:border-none">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActionBadgeColor(log.action)}`}>{log.action}</span>
                    </td>
                    <td data-label="Detail:" className="p-4 flex justify-end md:table-cell text-right md:text-left text-gray-400 border border-gray-800 md:border-none break-all">
                      {log.details}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function WpAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [todayData, setTodayData] = useState<{ stats: AnalyticsData['summary_today'] | null; logs: WpTodayLogs | null } | null>(null);
  const [reportData, setReportData] = useState<{ stats: AnalyticsData['summary_today'] | null; logs: WpTodayLogs | null } | null>(null);
  const [activeReportDate, setActiveReportDate] = useState<string>('Hari Ini');
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [daysTrend, setDaysTrend] = useState(7);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [analyticsResponse, todayLogsResponse] = await Promise.all([api(`wp-logs/analytics/?days=${daysTrend}`), api('wp-logs/today/')]);

        setAnalyticsData(analyticsResponse);

        const initialTodayData = { stats: analyticsResponse.summary_today, logs: todayLogsResponse };
        setTodayData(initialTodayData);

        if (activeReportDate === 'Hari Ini' || !reportData) {
          setReportData(initialTodayData);
          setActiveReportDate('Hari Ini');
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data analytics WordPress.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [daysTrend]);

  const handleDateSelect = async (date: string) => {
    if (date === format(new Date(), 'yyyy-MM-dd')) {
      resetToToday();
      return;
    }
    if (activeReportDate === date) return;

    setIsFetchingDetails(true);
    setActiveReportDate(date);
    try {
      const [statsResponse, logsResponse] = await Promise.all([api(`wp-logs/stats-by-date/?date=${date}`), api(`wp-logs/by-date/?date=${date}`)]);
      setReportData({ stats: statsResponse.detail, logs: logsResponse });
    } catch (err) {
      console.error(`Gagal mengambil laporan WP untuk tanggal ${date}:`, err);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const resetToToday = async () => {
    if (activeReportDate === 'Hari Ini') return;

    setIsFetchingDetails(true);
    setActiveReportDate('Hari Ini');
    try {
      const [analyticsResponse, todayLogsResponse] = await Promise.all([api(`wp-logs/analytics/?days=${daysTrend}`), api('wp-logs/today/')]);
      const freshTodayData = {
        stats: analyticsResponse.summary_today,
        logs: todayLogsResponse,
      };
      setReportData(freshTodayData);
      setTodayData(freshTodayData);
    } catch (err) {
      console.error('Gagal mengambil ulang data hari ini:', err);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const availableDatesSet = new Set(analyticsData?.trend_analysis.map((d) => new Date(d.date).setHours(0, 0, 0, 0)) ?? []);
  if (todayData?.stats) {
    availableDatesSet.add(new Date().setHours(0, 0, 0, 0));
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-7xl md:px-4 px-1">
        <h1 className="text-2xl text-gray-2 mb-5">Analisis Aktivitas WordPress</h1>
        {error && <p className="text-center text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>}

        {isLoading && !analyticsData ? (
          <div className="flex justify-center items-center h-96">
            <CgSpinner className="animate-spin text-gray-500" size={40} />
          </div>
        ) : !analyticsData ? (
          <p className="text-center text-gray-200 p-8">Tidak ada data analytics untuk ditampilkan.</p>
        ) : (
          <div className="space-y-7">
            <div className=" pt-6 pb-7 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1">
                <h2 className="text-gray-2 text-lg mb-2 sm:mb-0">Grafik</h2>
                <div className="flex items-center gap-2">
                  {[7, 15, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDaysTrend(d)}
                      className={`px-3 py-1 text-sm rounded-md cursor-pointer transition-colors ${daysTrend === d ? 'bg-gray-5/40 text-gray-2' : 'text-gray-4 bg-gray-8/30 hover:bg-gray-5/30 hover:text-gray-2'}`}
                    >
                      {d} Hari
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ width: '100%', height: 350 }}>
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <CgSpinner className="animate-spin text-gray-500" size={40} />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 350, cursor: 'pointer' }}>
                    <ParentSize>{({ width, height }) => <CustomWpAreaChart data={analyticsData.trend_analysis} width={width} height={height} onDateSelect={handleDateSelect} />}</ParentSize>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-gray-200 text-lg mb-3 sm:mb-0">Laporan {activeReportDate}</h2>
                <DatePicker selectedDate={activeReportDate} onDateSelect={handleDateSelect} resetToToday={resetToToday} availableDates={availableDatesSet} />
              </div>

              {isFetchingDetails ? (
                <div className="flex justify-center items-center h-64">
                  <CgSpinner className="animate-spin text-gray-500" size={40} />
                </div>
              ) : (
                <>
                  <div className="gap-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                    <StatCard icon={<FaUserCheck size={20} />} title="Login Berhasil" value={reportData?.stats?.login_success ?? 0} color="text-green-500" />
                    <StatCard icon={<FaUserTimes size={20} />} title="Login Gagal" value={reportData?.stats?.login_fail ?? 0} color="text-red-500" />
                    <StatCard icon={<FaFileAlt size={20} />} title="Aktivitas Konten" value={reportData?.stats?.content_activity ?? 0} color="text-blue-500" />
                    <StatCard icon={<FaPlug size={20} />} title="Aktivitas Plugin" value={reportData?.stats?.plugin_activity ?? 0} color="text-yellow-500" />
                  </div>

                  {reportData?.logs && (
                    <div className="space-y-6 mt-10">
                      <WpLogTable title="Aktivitas Login" logs={reportData.logs.login} />
                      <WpLogTable title="Aktivitas Plugin" logs={reportData.logs.plugin} />
                      <WpLogTable title="Aktivitas Konten" logs={reportData.logs.content} />
                      <WpLogTable title="Manajemen Pengguna" logs={reportData.logs.user_management} />
                      <WpLogTable title="Lainnya" logs={reportData.logs.lainnya} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bagian Top 5 */}
            <div className="bg-background-dark py-8 rounded-lg">
              <h2 className="text-gray-2 text-lg mb-7">
                Peringkat Teratas <span className="text-gray-400 font-medium text-sm pl-2">(30 Hari Terakhir)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TopListTable title="Pengguna Paling Aktif" data={analyticsData.top_5_users} headers={['Username', 'Aktivitas']} />
                <TopListTable title="Alamat IP Paling Aktif" data={analyticsData.top_5_ips} headers={['Alamat IP', 'Aktivitas']} />
                <TopListTable title="IP Gagal Login" data={analyticsData.top_5_failed_ips} headers={['Alamat IP', 'Percobaan']} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
