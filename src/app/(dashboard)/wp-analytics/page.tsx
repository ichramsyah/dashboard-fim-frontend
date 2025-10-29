'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CgSpinner } from 'react-icons/cg';
import { FaUserCheck, FaUserTimes, FaFileAlt, FaPlug } from 'react-icons/fa';
import api from '../../lib/api';
import { DatePicker } from '../../components/DatePicker';
import { format } from 'date-fns';

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

const StatCard = ({ icon, title, value, color, bgColor }: any) => (
  <div className={`flex-1 pl-4 py-3.5 rounded-lg flex items-center ${bgColor}`}>
    <div className={`rounded-full mr-4 ${color} p-2 bg-white`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-700">{title}</p>
      <p className="text-xl font-bold text-gray-600">{value}</p>
    </div>
  </div>
);

const TopListTable = ({ title, data, headers }: { title: string; data: [string, number][]; headers: [string, string] }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-600 mb-3">{title}</h3>
    {data.length > 0 ? (
      <div className="overflow-x-auto rounded-md">
        <table className="min-w-full text-sm bg-white">
          <thead className="bg-purple-100/80">
            <tr className="border-none">
              <th className="p-3 text-left text-gray-600 font-semibold border-none ">{headers[0]}</th>
              <th className="p-3 text-right text-gray-600 font-semibold border-none ">{headers[1]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map(([item, count]) => (
              <tr key={item}>
                <td className="p-3 font-mono text-gray-700 border-none ">{item}</td>
                <td className="p-3 font-mono text-right text-gray-500 border-none ">{count}</td>
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
      return 'bg-red-100 text-red-700';
    case 'success':
    case 'activated':
    case 'installed':
      return 'bg-green-100 text-green-700';
    case 'updated':
    case 'status changed':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const WpLogTable = ({ title, logs, headerColor }: { title: string; logs: WpLogEntry[]; headerColor: string }) => {
  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-md font-semibold mb-2 text-gray-800">
        {title} ({logs.length})
      </h3>
      <div className="overflow-x-auto md:bg-white bg-transparent rounded-lg">
        <table className="min-w-full text-sm">
          <thead className={`${headerColor} hidden md:table-header-group`}>
            <tr>
              <th className="p-4 text-left text-gray-700 font-semibold">Waktu</th>
              <th className="p-4 text-left text-gray-700 font-semibold">User</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Alamat IP</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Aksi</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 md:divide-y-0">
            {logs.map((log) => (
              <tr key={log.id} className="block md:table-row mb-4 md:mb-0 rounded-lg md:rounded-none bg-white">
                <td data-label="Waktu:" className="p-4 flex justify-end md:table-cell text-right md:text-left border border-gray-100 md:border-none">
                  <span className="text-gray-500">{log.timestamp.split(' ')[1]}</span>
                </td>
                <td data-label="User:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-700 border border-gray-100 md:border-none">
                  {log.user}
                </td>
                <td data-label="Alamat IP:" className="p-4 flex justify-end md:table-cell text-right md:text-left font-mono text-gray-500 border border-gray-100 md:border-none">
                  {log.ip}
                </td>
                <td data-label="Aksi:" className="p-4 flex justify-end md:table-cell text-right md:text-left border border-gray-100 md:border-none">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActionBadgeColor(log.action)}`}>{log.action}</span>
                </td>
                <td data-label="Detail:" className="p-4 flex justify-end md:table-cell text-right md:text-left text-gray-600 border border-gray-100 md:border-none break-all">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      if (!analyticsData || isFetchingDetails) {
        setIsLoading(true);
      }
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
            <div className="bg-white px-7 pt-6 pb-7 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-1">
                <h2 className="text-gray-7 text-lg font-semibold mb-2 sm:mb-0">Grafik Aktivitas</h2>
                <div className="flex items-center gap-2">
                  {[7, 15, 30].map((d) => (
                    <button key={d} onClick={() => setDaysTrend(d)} className={`px-3 py-1 text-sm rounded-md transition-colors ${daysTrend === d ? 'bg-gray-800 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      {d} Hari
                    </button>
                  ))}
                </div>
              </div>
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

            <div className="bg-white px-7 py-6 rounded-lg">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-gray-700 text-lg font-semibold mb-3 sm:mb-0">Laporan {activeReportDate}</h2>
                <DatePicker selectedDate={activeReportDate} onDateSelect={handleDateSelect} resetToToday={resetToToday} availableDates={availableDatesSet} />
              </div>

              {isFetchingDetails ? (
                <div className="flex justify-center items-center h-64">
                  <CgSpinner className="animate-spin text-gray-500" size={40} />
                </div>
              ) : (
                <>
                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4">
                    <StatCard icon={<FaUserCheck size={20} />} title="Login Berhasil" value={reportData?.stats?.login_success ?? 0} color="text-green-500" bgColor="bg-green-50" />
                    <StatCard icon={<FaUserTimes size={20} />} title="Login Gagal" value={reportData?.stats?.login_fail ?? 0} color="text-red-500" bgColor="bg-red-50" />
                    <StatCard icon={<FaFileAlt size={20} />} title="Aktivitas Konten" value={reportData?.stats?.content_activity ?? 0} color="text-blue-500" bgColor="bg-blue-50" />
                    <StatCard icon={<FaPlug size={20} />} title="Aktivitas Plugin" value={reportData?.stats?.plugin_activity ?? 0} color="text-yellow-500" bgColor="bg-yellow-50" />
                  </div>

                  {reportData?.logs && (
                    <div className="space-y-6 mt-10">
                      <WpLogTable title="Aktivitas Login" logs={reportData.logs.login} headerColor="bg-blue-100" />
                      <WpLogTable title="Aktivitas Plugin" logs={reportData.logs.plugin} headerColor="bg-yellow-100" />
                      <WpLogTable title="Aktivitas Konten" logs={reportData.logs.content} headerColor="bg-green-100" />
                      <WpLogTable title="Manajemen Pengguna" logs={reportData.logs.user_management} headerColor="bg-purple-100" />
                      <WpLogTable title="Lainnya" logs={reportData.logs.lainnya} headerColor="bg-gray-100" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bagian Top 5 */}
            <div className="bg-white px-7 py-6 rounded-lg">
              <h2 className="text-gray-7 text-lg font-semibold mb-4">
                Peringkat Teratas <span className="text-gray-500 font-medium text-sm pl-2">(30 Hari Terakhir)</span>
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
