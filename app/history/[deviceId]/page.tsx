// app/history/[deviceId]/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { format, subDays, differenceInMinutes } from "date-fns";
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
  ChevronLeft,
  ChevronRight,
  Loader2,
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
import { useDevice } from "@/providers/DeviceProvider";
import { useAuth } from "@/providers/AuthProvider";

interface HealthData {
  time: string;
  spo2: number;
  heartRate: number;
  temperature: number;
  gas: number;
  humidity: number;
  bloodPressure: string;
}

export default function HealthHistoryPage() {
  const params = useParams<{ deviceId: string }>();
  const deviceId = params?.deviceId;

  const { user, getIdToken } = useAuth();
  const { devices } = useDevice();

  // Chỉ lưu 100 dữ liệu mới nhất
  const [displayData, setDisplayData] = useState<HealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const currentDevice = devices.find((d) => d.id === deviceId);

  // Fetch dữ liệu - chỉ lấy 100 bản ghi mới nhất
  // app/history/[deviceId]/page.tsx
  // Trong fetchHistory, chỉ lấy 100 bản ghi
  const fetchHistory = useCallback(async () => {
    if (!deviceId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await getIdToken();

      // Chỉ lấy 100 bản ghi mới nhất
      const res = await fetch(`/api/history?deviceId=${deviceId}&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

      console.log("Data loaded:", {
        total: sorted.length,
      });
    } catch (err) {
      console.error(err);
      alert("Không thể tải lịch sử đo. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [deviceId, user, getIdToken]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Dữ liệu biểu đồ (sắp xếp tăng dần theo thời gian)
  const chartData = useMemo(() => {
    const sortedAsc = [...displayData]
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .map((item) => ({
        ...item,
        time: format(new Date(item.time), "dd/MM HH:mm"),
      }));
    return sortedAsc;
  }, [displayData]);

  // Xuất file với khoảng thời gian được chọn
  const exportData = async (type: "excel" | "csv") => {
    if (!deviceId || !user) return;

    setExporting(true);
    setExportProgress(0);

    try {
      const token = await getIdToken();

      // Gọi API với filter thời gian để lấy dữ liệu xuất
      const startDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);

      setExportProgress(20);

      const res = await fetch(
        `/api/history/export?deviceId=${deviceId}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setExportProgress(60);

      if (!res.ok) {
        throw new Error("Lỗi tải dữ liệu xuất");
      }

      const exportData: HealthData[] = await res.json();

      setExportProgress(80);

      if (exportData.length === 0) {
        alert("Không có dữ liệu trong khoảng thời gian này");
        setExporting(false);
        return;
      }

      // Sắp xếp theo thời gian tăng dần
      const sortedData = [...exportData].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );

      if (type === "excel") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(
          sortedData.map((item) => ({
            "Thời gian": format(new Date(item.time), "dd/MM/yyyy HH:mm:ss"),
            "Tên thiết bị": currentDevice?.id || deviceId,
            "SpO2 (%)": item.spo2,
            "Nhịp tim (BPM)": item.heartRate,
            "Nhiệt độ (°C)": item.temperature,
            "Khí gas (ppm)": item.gas,
            "Độ ẩm (%)": item.humidity,
            "Huyết áp": item.bloodPressure,
          })),
        );

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lịch sử đo");

        XLSX.writeFile(
          wb,
          `Lich_su_do_${currentDevice?.name || deviceId}_${format(
            dateRange.from,
            "yyyyMMdd_HHmm",
          )}_${format(dateRange.to, "yyyyMMdd_HHmm")}.xlsx`,
        );
      } else {
        const headers = [
          "Thời gian",
          "SpO2 (%)",
          "Nhịp tim (BPM)",
          "Nhiệt độ (°C)",
          "Khí gas (ppm)",
          "Độ ẩm (%)",
          "Huyết áp",
        ];

        const rows = sortedData.map((item) => [
          format(new Date(item.time), "dd/MM/yyyy HH:mm:ss"),
          item.spo2,
          item.heartRate,
          item.temperature,
          item.gas,
          item.humidity,
          item.bloodPressure,
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
        link.download = `Lich_su_do_${currentDevice?.name || deviceId}_${format(
          dateRange.from,
          "yyyyMMdd_HHmm",
        )}_${format(dateRange.to, "yyyyMMdd_HHmm")}.csv`;
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

  const getAlertStatus = (item: HealthData) => {
    const alerts = [];
    if (item.spo2 < 92) alerts.push("SpO2 thấp");
    if (item.heartRate > 140) alerts.push("Nhịp tim cao");
    if (item.temperature > 38) alerts.push("Nhiệt độ cao");
    if (item.gas > 50) alerts.push("Khí gas cao");
    if (item.humidity > 80) alerts.push("Độ ẩm cao");

    const bpParts = item.bloodPressure.split("/");
    const sys = parseInt(bpParts[0]);
    const dia = parseInt(bpParts[1]);
    if (sys > 140 || dia > 90) alerts.push("Huyết áp cao");

    return alerts;
  };

  if (!deviceId) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground">
              Đang tải thông tin thiết bị...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentDevice && !loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground">
              Không tìm thấy thiết bị với ID: {deviceId}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Tính khoảng thời gian hiển thị
  const timeRangeText = () => {
    if (displayData.length === 0) return "";
    const times = displayData.map((d) => new Date(d.time));
    const minTime = new Date(Math.min(...times.map((t) => t.getTime())));
    const maxTime = new Date(Math.max(...times.map((t) => t.getTime())));
    const hoursDiff = Math.round(differenceInMinutes(maxTime, minTime) / 60);
    if (hoursDiff < 24) {
      return ` (${hoursDiff} giờ)`;
    }
    return ` (${Math.round(hoursDiff / 24)} ngày)`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Thanh tiến độ xuất file */}
        {exporting && (
          <div className="fixed bottom-4 right-4 z-50 w-80 bg-background border rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Đang xuất dữ liệu...</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {exportProgress < 30 && "Đang tải dữ liệu..."}
              {exportProgress >= 30 && exportProgress < 80 && "Đang xử lý..."}
              {exportProgress >= 80 && "Đang tạo file..."}
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <TrendingUp className="h-9 w-9 text-primary" />
              Lịch sử đo thông số sức khỏe
            </h1>
            <p className="text-muted-foreground mt-2">
              Thiết bị:{" "}
              <span className="font-medium">
                {currentDevice?.name || currentDevice?.id || "Không tên"}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              ID: {deviceId} | Hiển thị: {displayData.length} bản ghi gần nhất
              {displayData.length > 0 && timeRangeText()}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
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
              className="gap-2"
              disabled={exporting}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>

            <Button
              onClick={() => exportData("csv")}
              variant="outline"
              className="gap-2"
              disabled={exporting}
            >
              <Download className="h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : displayData.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">
              Chưa có dữ liệu đo nào
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Dữ liệu sẽ được cập nhật khi thiết bị gửi thông tin đo
            </p>
          </Card>
        ) : (
          <>
            <Card className="mb-6 bg-muted/30">
              <CardContent className="py-3">
                <p className="text-sm text-center text-muted-foreground">
                  📊 Hiển thị {displayData.length} bản ghi gần nhất
                  {timeRangeText()}
                </p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  💡 Để xuất dữ liệu theo khoảng thời gian, hãy chọn ngày và
                  nhấn Xuất Excel/CSV
                </p>
              </CardContent>
            </Card>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* SpO2 Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    SpO₂ (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                      />
                      <YAxis domain={[70, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="spo2"
                        stroke="#3b82f6"
                        name="SpO₂ (%)"
                        strokeWidth={2}
                        dot={chartData.length > 50 ? { r: 1 } : { r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Heart Rate Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Nhịp tim (BPM)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                      />
                      <YAxis domain={[40, 200]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        stroke="#ef4444"
                        name="Nhịp tim (BPM)"
                        strokeWidth={2}
                        dot={chartData.length > 50 ? { r: 1 } : { r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Temperature Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-orange-500" />
                    Nhiệt độ (°C)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                      />
                      <YAxis domain={[35, 40]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#f97316"
                        name="Nhiệt độ (°C)"
                        strokeWidth={2}
                        dot={chartData.length > 50 ? { r: 1 } : { r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gas Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-purple-500" />
                    Khí gas (ppm)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="gas"
                        stroke="#8b5cf6"
                        name="Khí gas (ppm)"
                        strokeWidth={2}
                        dot={chartData.length > 50 ? { r: 1 } : { r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Humidity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-cyan-500" />
                    Độ ẩm (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={Math.floor(chartData.length / 10)}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#06b6d4"
                        name="Độ ẩm (%)"
                        strokeWidth={2}
                        dot={chartData.length > 50 ? { r: 1 } : { r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Blood Pressure */}
              {displayData.some((item) => item.bloodPressure !== "--/--") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-pink-500" />
                      Huyết áp (mmHg)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {displayData.slice(0, 20).map((item, idx) => {
                        const parts = item.bloodPressure.split("/");
                        const sys = parseInt(parts[0]);
                        const dia = parseInt(parts[1]);
                        const isHigh = sys > 140 || dia > 90;

                        return (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-2 border-b hover:bg-muted/50"
                          >
                            <span className="text-sm">
                              {format(new Date(item.time), "dd/MM/yyyy HH:mm")}
                            </span>
                            <Badge
                              variant={isHigh ? "destructive" : "outline"}
                              className="text-lg font-semibold"
                            >
                              {item.bloodPressure}
                            </Badge>
                          </div>
                        );
                      })}
                      {displayData.length > 20 && (
                        <p className="text-center text-sm text-muted-foreground pt-2">
                          ... và {displayData.length - 20} bản ghi khác
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Bảng dữ liệu */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Danh sách đo chi tiết ({displayData.length} bản ghi gần nhất)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-4 text-left">Thời gian</th>
                        <th className="p-4 text-left">Thiết bị</th>
                        <th className="p-4 text-center">SpO₂ (%)</th>
                        <th className="p-4 text-center">Nhịp tim (BPM)</th>
                        <th className="p-4 text-center">Nhiệt độ (°C)</th>
                        <th className="p-4 text-center">Khí gas (ppm)</th>
                        <th className="p-4 text-center">Độ ẩm (%)</th>
                        <th className="p-4 text-center">Huyết áp</th>
                        <th className="p-4 text-center">Cảnh báo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayData.map((item, idx) => {
                        const alerts = getAlertStatus(item);
                        const hasAlert = alerts.length > 0;

                        return (
                          <tr
                            key={idx}
                            className={`border-b hover:bg-muted/50 ${
                              hasAlert ? "bg-red-50 dark:bg-red-950/20" : ""
                            }`}
                          >
                            <td className="p-4 font-medium">
                              {format(
                                new Date(item.time),
                                "dd/MM/yyyy HH:mm:ss",
                              )}
                            </td>
                            <td className="p-4">
                              {currentDevice?.name ||
                                currentDevice?.id ||
                                deviceId}
                            </td>
                            <td className="p-4 text-center">
                              <Badge
                                variant={
                                  item.spo2 >= 95
                                    ? "default"
                                    : item.spo2 >= 92
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {item.spo2}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Badge
                                variant={
                                  item.heartRate <= 140
                                    ? item.heartRate >= 60
                                      ? "default"
                                      : "secondary"
                                    : "destructive"
                                }
                              >
                                {item.heartRate}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Badge
                                variant={
                                  item.temperature <= 38
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {item.temperature.toFixed(1)}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Badge
                                variant={
                                  item.gas <= 50 ? "default" : "destructive"
                                }
                              >
                                {item.gas}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              <Badge
                                variant={
                                  item.humidity <= 80
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {item.humidity}
                              </Badge>
                            </td>
                            <td className="p-4 text-center font-medium">
                              {item.bloodPressure}
                            </td>
                            <td className="p-4 text-center">
                              {hasAlert && (
                                <Badge variant="destructive" className="gap-1">
                                  <span className="text-xs">⚠️</span>
                                  {alerts[0]}
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
