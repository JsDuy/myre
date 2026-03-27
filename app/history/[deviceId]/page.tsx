// app/history/[deviceId]/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  format,
  subDays,
  differenceInMinutes,
  isWithinInterval,
} from "date-fns";
import {
  Download,
  FileSpreadsheet,
  TrendingUp,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  CalendarIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDevice } from "@/providers/DeviceProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";

interface HealthData {
  time: string;
  spo2: number;
  heartRate: number;
  temperature: number;
  gas: number;
  humidity: number;
}

export default function HealthHistoryPage() {
  const params = useParams<{ deviceId: string }>();
  const deviceId = params?.deviceId;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const { user, getIdToken } = useAuth();
  const { devices } = useDevice();

  const [displayData, setDisplayData] = useState<HealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const currentDevice = devices.find((d) => d.id === deviceId);

  // Chart colors based on theme
  const chartColors = {
    grid: isDark ? "#374151" : "#e5e7eb",
    text: isDark ? "#9ca3af" : "#6b7280",
    tooltipBg: isDark ? "#1f2937" : "#ffffff",
    tooltipBorder: isDark ? "#374151" : "#e5e7eb",
  };

  const fetchHistory = useCallback(async () => {
    if (!deviceId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/history?deviceId=${deviceId}&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi tải dữ liệu");
      }

      const result: HealthData[] = await res.json();
      const sorted = result.sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
      );
      setDisplayData(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [deviceId, user, getIdToken]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchHistory();
    setTimeout(() => setRefreshing(false), 500);
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const chartData = useMemo(() => {
    const filtered = displayData.filter((item) => {
      const itemDate = new Date(item.time);
      return isWithinInterval(itemDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    });

    return filtered
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map((item) => ({
        ...item,
        time: format(new Date(item.time), "dd/MM HH:mm"),
        fullTime: format(new Date(item.time), "dd/MM/yyyy HH:mm:ss"),
      }));
  }, [displayData, dateRange]);

  const filteredData = useMemo(() => {
    return displayData.filter((item) => {
      const itemDate = new Date(item.time);
      return isWithinInterval(itemDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    });
  }, [displayData, dateRange]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const avg = (values: number[]) =>
      values.reduce((a, b) => a + b, 0) / values.length;
    const max = (values: number[]) => Math.max(...values);
    const min = (values: number[]) => Math.min(...values);

    return {
      spo2: {
        avg: avg(filteredData.map((d) => d.spo2)),
        max: max(filteredData.map((d) => d.spo2)),
        min: min(filteredData.map((d) => d.spo2)),
      },
      heartRate: {
        avg: avg(filteredData.map((d) => d.heartRate)),
        max: max(filteredData.map((d) => d.heartRate)),
        min: min(filteredData.map((d) => d.heartRate)),
      },
      temperature: {
        avg: avg(filteredData.map((d) => d.temperature)),
        max: max(filteredData.map((d) => d.temperature)),
        min: min(filteredData.map((d) => d.temperature)),
      },
      gas: {
        avg: avg(filteredData.map((d) => d.gas)),
        max: max(filteredData.map((d) => d.gas)),
        min: min(filteredData.map((d) => d.gas)),
      },
      humidity: {
        avg: avg(filteredData.map((d) => d.humidity)),
        max: max(filteredData.map((d) => d.humidity)),
        min: min(filteredData.map((d) => d.humidity)),
      },
    };
  }, [filteredData]);

  const getAlertStatus = (item: HealthData) => {
    const alerts = [];
    if (item.spo2 < 95) alerts.push("SpO₂ thấp");
    if (item.spo2 > 100) alerts.push("SpO₂ cao");
    if (item.heartRate > 100) alerts.push("Nhịp tim cao");
    if (item.heartRate < 40) alerts.push("Nhịp tim thấp");
    if (item.temperature > 30) alerts.push("Nhiệt độ cao");
    if (item.temperature < 18) alerts.push("Nhiệt độ thấp");
    if (item.gas > 620) alerts.push("Khí gas cao");
    if (item.gas < 350) alerts.push("Khí gas thấp");
    if (item.humidity > 70) alerts.push("Độ ẩm cao");
    if (item.humidity < 40) alerts.push("Độ ẩm thấp");
    return alerts;
  };

  const exportData = async (type: "excel" | "csv") => {
    if (!deviceId || !user) return;

    setExporting(true);
    setExportProgress(0);

    try {
      const token = await getIdToken();
      const startDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);

      setExportProgress(20);

      const res = await fetch(
        `/api/history/export?deviceId=${deviceId}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setExportProgress(60);

      if (!res.ok) throw new Error("Lỗi tải dữ liệu xuất");

      const exportData: HealthData[] = await res.json();
      setExportProgress(80);

      if (exportData.length === 0) {
        alert("Không có dữ liệu trong khoảng thời gian này");
        setExporting(false);
        return;
      }

      const sortedData = [...exportData].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );

      if (type === "excel") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(
          sortedData.map((item) => ({
            "Thời gian": format(new Date(item.time), "dd/MM/yyyy HH:mm:ss"),
            "Tên thiết bị": currentDevice?.name || deviceId,
            "SpO₂ (%)": item.spo2,
            "Nhịp tim (BPM)": item.heartRate,
            "Nhiệt độ (°C)": item.temperature,
            "Khí gas (ppm)": item.gas,
            "Độ ẩm (%)": item.humidity,
          })),
        );

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lịch sử đo");
        XLSX.writeFile(
          wb,
          `Lich_su_do_${currentDevice?.name || deviceId}_${format(dateRange.from, "yyyyMMdd")}_${format(dateRange.to, "yyyyMMdd")}.xlsx`,
        );
      } else {
        const headers = [
          "Thời gian",
          "SpO₂ (%)",
          "Nhịp tim (BPM)",
          "Nhiệt độ (°C)",
          "Khí gas (ppm)",
          "Độ ẩm (%)",
        ];
        const rows = sortedData.map((item) => [
          format(new Date(item.time), "dd/MM/yyyy HH:mm:ss"),
          item.spo2,
          item.heartRate,
          item.temperature,
          item.gas,
          item.humidity,
          item.humidity,
        ]);

        const csvContent = [headers, ...rows]
          .map((row) => row.join(","))
          .join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `Lich_su_do_${currentDevice?.name || deviceId}_${format(dateRange.from, "yyyyMMdd")}_${format(dateRange.to, "yyyyMMdd")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }

      setExportProgress(100);
      setTimeout(() => setExporting(false), 1000);
    } catch (err) {
      console.error("Lỗi xuất file:", err);
      alert("Không thể xuất file. Vui lòng thử lại sau.");
      setExporting(false);
    }
  };

  const timeRangeText = () => {
    if (filteredData.length === 0) return "";
    const times = filteredData.map((d) => new Date(d.time));
    const minTime = new Date(Math.min(...times.map((t) => t.getTime())));
    const maxTime = new Date(Math.max(...times.map((t) => t.getTime())));
    const hoursDiff = Math.round(differenceInMinutes(maxTime, minTime) / 60);
    if (hoursDiff < 24) {
      return ` (${hoursDiff} giờ)`;
    }
    return ` (${Math.round(hoursDiff / 24)} ngày)`;
  };

  if (!deviceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 p-6">
        <Card className="p-12 text-center shadow-lg dark:bg-slate-800">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Đang tải thông tin thiết bị...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:mx-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Lịch sử đo lường
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Dữ liệu sức khỏe
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Thiết bị:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {currentDevice?.name || deviceId}
              </span>
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Hiển thị: {filteredData.length} bản ghi{timeRangeText()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="gap-2 dark:border-slate-700 dark:text-slate-300"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>

            <DateRangePicker
              initialDateFrom={dateRange.from}
              initialDateTo={dateRange.to}
              onUpdate={({ range }) => {
                if (range.from && range.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
              locale="vi-VN"
              showCompare={false}
            />

            <Button
              onClick={() => exportData("excel")}
              className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>

            <Button
              onClick={() => exportData("csv")}
              variant="outline"
              className="gap-2 dark:border-slate-700 dark:text-slate-300"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards - 3 cards per row on large screens */}
        {stats && filteredData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-blue-100 dark:from-blue-700 dark:to-blue-200 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs">SpO₂</p>
                    <p className="text-xl font-bold">
                      {stats.spo2.avg.toFixed(1)}%
                    </p>
                    <div className="flex gap-1 text-xs text-blue-100 mt-0.5">
                      <span>
                        {stats.spo2.min.toFixed(0)}-{stats.spo2.max.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <Activity className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-red-600 to-red-100 dark:from-red-700 dark:to-red-200 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs">Nhịp tim</p>
                    <p className="text-xl font-bold">
                      {stats.heartRate.avg.toFixed(0)}
                    </p>
                    <div className="flex gap-1 text-xs text-red-100 mt-0.5">
                      <span>
                        {stats.heartRate.min}-{stats.heartRate.max}
                      </span>
                    </div>
                  </div>
                  <Heart className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-orange-600 to-orange-100 dark:from-orange-700 dark:to-orange-200 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs">Nhiệt độ</p>
                    <p className="text-xl font-bold">
                      {stats.temperature.avg.toFixed(1)}°C
                    </p>
                    <div className="flex gap-1 text-xs text-orange-100 mt-0.5">
                      <span>
                        {stats.temperature.min.toFixed(1)}-
                        {stats.temperature.max.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <Thermometer className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-purple-600 to-purple-100 dark:from-purple-700 dark:to-purple-200 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs">Khí gas</p>
                    <p className="text-xl font-bold">
                      {stats.gas.avg.toFixed(0)}
                    </p>
                    <div className="flex gap-1 text-xs text-purple-100 mt-0.5">
                      <span>
                        {stats.gas.min}-{stats.gas.max}
                      </span>
                    </div>
                  </div>
                  <Wind className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-cyan-600 to-cyan-100 dark:from-cyan-700 dark:to-cyan-200 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-100 text-xs">Độ ẩm</p>
                    <p className="text-xl font-bold">
                      {stats.humidity.avg.toFixed(0)}%
                    </p>
                    <div className="flex gap-1 text-xs text-cyan-100 mt-0.5">
                      <span>
                        {stats.humidity.min}-{stats.humidity.max}
                      </span>
                    </div>
                  </div>
                  <Droplets className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Grid - 2 columns on large screens */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <Skeleton className="h-6 w-32 dark:bg-slate-700" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full dark:bg-slate-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <Card className="p-12 text-center shadow-lg dark:bg-slate-800">
            <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Không có dữ liệu trong khoảng thời gian này
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* SpO2 Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Activity className="h-5 w-5 text-blue-500" />
                    SpO₂ (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={chartColors.grid}
                      />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                        tick={{ fontSize: 11, fill: chartColors.text }}
                      />
                      <YAxis
                        domain={[70, 100]}
                        tick={{ fontSize: 12, fill: chartColors.text }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          backgroundColor: chartColors.tooltipBg,
                          color: isDark ? "#fff" : "#000",
                        }}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                      />
                      <Legend wrapperStyle={{ color: chartColors.text }} />
                      <Line
                        type="monotone"
                        dataKey="spo2"
                        stroke="#3b82f6"
                        name="SpO₂ (%)"
                        strokeWidth={2}
                        dot={chartData.length > 100 ? { r: 1 } : { r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Heart Rate Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Heart className="h-5 w-5 text-red-500" />
                    Nhịp tim (BPM)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={chartColors.grid}
                      />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                        tick={{ fontSize: 11, fill: chartColors.text }}
                      />
                      <YAxis
                        domain={[40, 200]}
                        tick={{ fontSize: 12, fill: chartColors.text }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          backgroundColor: chartColors.tooltipBg,
                          color: isDark ? "#fff" : "#000",
                        }}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                      />
                      <Legend wrapperStyle={{ color: chartColors.text }} />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        stroke="#ef4444"
                        name="Nhịp tim (BPM)"
                        strokeWidth={2}
                        dot={chartData.length > 100 ? { r: 1 } : { r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Temperature Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    Nhiệt độ (°C)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={chartColors.grid}
                      />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                        tick={{ fontSize: 11, fill: chartColors.text }}
                      />
                      <YAxis
                        domain={[35, 40]}
                        tick={{ fontSize: 12, fill: chartColors.text }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          backgroundColor: chartColors.tooltipBg,
                          color: isDark ? "#fff" : "#000",
                        }}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                      />
                      <Legend wrapperStyle={{ color: chartColors.text }} />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f97316"
                        name="Nhiệt độ (°C)"
                        strokeWidth={2}
                        dot={chartData.length > 100 ? { r: 1 } : { r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gas Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Wind className="h-5 w-5 text-purple-500" />
                    Khí gas (ppm)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={chartColors.grid}
                      />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                        tick={{ fontSize: 11, fill: chartColors.text }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: chartColors.text }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          backgroundColor: chartColors.tooltipBg,
                          color: isDark ? "#fff" : "#000",
                        }}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                      />
                      <Legend wrapperStyle={{ color: chartColors.text }} />
                      <Line
                        type="monotone"
                        dataKey="gas"
                        stroke="#8b5cf6"
                        name="Khí gas (ppm)"
                        strokeWidth={2}
                        dot={chartData.length > 100 ? { r: 1 } : { r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Humidity Chart */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-800 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Droplets className="h-5 w-5 text-cyan-500" />
                    Độ ẩm (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={chartColors.grid}
                      />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                        tick={{ fontSize: 11, fill: chartColors.text }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: chartColors.text }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          backgroundColor: chartColors.tooltipBg,
                          color: isDark ? "#fff" : "#000",
                        }}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                      />
                      <Legend wrapperStyle={{ color: chartColors.text }} />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#06b6d4"
                        name="Độ ẩm (%)"
                        strokeWidth={2}
                        dot={chartData.length > 100 ? { r: 1 } : { r: 3 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card className="shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-700 dark:text-slate-200">
                  Danh sách đo chi tiết ({filteredData.length} bản ghi)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-slate-900">
                      <tr className="border-b dark:border-slate-700">
                        <th className="p-4 text-left text-slate-600 dark:text-slate-400">
                          Thời gian
                        </th>
                        <th className="p-4 text-center text-slate-600 dark:text-slate-400">
                          SpO₂
                        </th>
                        <th className="p-4 text-center text-slate-600 dark:text-slate-400">
                          Nhịp tim
                        </th>
                        <th className="p-4 text-center text-slate-600 dark:text-slate-400">
                          Nhiệt độ
                        </th>
                        <th className="p-4 text-center text-slate-600 dark:text-slate-400">
                          Khí gas
                        </th>
                        <th className="p-4 text-center text-slate-600 dark:text-slate-400">
                          Độ ẩm
                        </th>
                        <th className="p-4 text-center text-slate-600 dark:text-slate-400">
                          Cảnh báo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 100).map((item, idx) => {
                        const alerts = getAlertStatus(item);
                        const hasAlert = alerts.length > 0;
                        return (
                          <tr
                            key={idx}
                            className={`border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors dark:border-slate-700 ${hasAlert ? "bg-red-50/30 dark:bg-red-950/20" : ""}`}
                          >
                            <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                              {format(
                                new Date(item.time),
                                "dd/MM/yyyy HH:mm:ss",
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <Badge
                                variant={
                                  item.spo2 > 95 && item.spo2 < 100
                                    ? "default"
                                    : item.spo2 >= 92
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {item.spo2}%
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Badge
                                variant={
                                  item.heartRate < 100 && item.heartRate > 60
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {item.heartRate}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Badge
                                variant={
                                  item.temperature < 30 && item.temperature > 18
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {item.temperature.toFixed(1)}°
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Badge
                                variant={
                                  item.gas > 350 && item.gas < 630
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {item.gas}
                              </Badge>
                            </td>
                            <td className="p-4 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                              <Badge
                                variant={
                                  item.humidity > 40 && item.humidity < 70
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {item.humidity}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              {hasAlert && (
                                <Badge variant="destructive" className="gap-1">
                                  <span>⚠️</span>
                                  {alerts[0]}
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ScrollArea>
                {filteredData.length > 100 && (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t dark:border-slate-700">
                    Hiển thị 100/ {filteredData.length} bản ghi. Để xem đầy đủ,
                    vui lòng xuất file Excel/CSV.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Export Progress */}
        {exporting && (
          <div className="fixed bottom-4 right-4 z-50 w-80 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-xl p-4 animate-in slide-in-from-right-5">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm font-medium dark:text-slate-200">
                Đang xuất dữ liệu...
              </span>
            </div>
            <Progress value={exportProgress} className="h-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {exportProgress < 30 && "Đang tải dữ liệu..."}
              {exportProgress >= 30 && exportProgress < 80 && "Đang xử lý..."}
              {exportProgress >= 80 && "Đang tạo file..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
