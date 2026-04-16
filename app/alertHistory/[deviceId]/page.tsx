// app/alertHistory/[deviceId]/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/AuthProvider";
import { useDevice } from "@/providers/DeviceProvider";

import {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Activity,
  ArrowLeft,
  TrendingUp,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AlertItem {
  id: string;
  timestamp: string;
  warnings: string[];
  details: Record<string, string>;
  createdAt?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData?: Record<string, any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metricIcons: Record<string, any> = {
  SpO2: Wind,
  "Nhịp tim": Heart,
  "Nhiệt độ": Thermometer,
  "Khí gas": Activity,
  "Độ ẩm": Droplets,
};

const getMetricColor = (value: string, metric: string): string => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "text-gray-400";

  switch (metric) {
    case "SpO2":
      return numValue < 75
        ? "text-red-600"
        : numValue < 100
          ? "text-orange-500"
          : "text-green-600";
    case "Nhịp tim":
      return numValue > 90 || numValue < 55 ? "text-red-600" : "text-blue-600";
    case "Nhiệt độ":
      return numValue > 38 || numValue < 18
        ? "text-red-600"
        : "text-orange-500";
    case "Khí gas":
      return numValue > 620 ? "text-red-600" : "text-green-600";
    case "Độ ẩm":
      return numValue > 70 || numValue < 40 ? "text-red-600" : "text-green-600";
    default:
      return "text-gray-700";
  }
};

export default function AlertHistoryPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const router = useRouter();
  const { selectedDevice } = useDevice();
  const [allAlerts, setAllAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid || !deviceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const alertsRef = ref(db, `devices/${deviceId}/alert_history`);
    const q = query(alertsRef, orderByChild("timestamp"));

    const unsubscribe = onValue(
      q,
      (snapshot) => {
        const history: AlertItem[] = [];

        snapshot.forEach((child) => {
          const data = child.val();

          const warnings: string[] = [];
          if (data.reasons) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(data.reasons).forEach((reason: any) => {
              if (reason) warnings.push(String(reason));
            });
          }

          let displayTime = "Không có thời gian";
          let createdAt: number | undefined;

          if (data.timestamp) {
            const date = new Date(data.timestamp);
            displayTime = date.toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            createdAt = date.getTime();
          } else if (data.createdAt) {
            const date = new Date(data.createdAt);
            displayTime = date.toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            createdAt = data.createdAt;
          }

          const details: Record<string, string> = {
            SpO2: data.spo2 !== undefined ? `${data.spo2}%` : "--",
            "Nhịp tim":
              data.heartRate !== undefined ? `${data.heartRate} BPM` : "--",
            "Nhiệt độ":
              data.temperature !== undefined ? `${data.temperature}°C` : "--",
            "Khí gas": data.gas !== undefined ? `${data.gas} ppm` : "--",
            "Độ ẩm": data.humidity !== undefined ? `${data.humidity}%` : "--",
          };

          history.push({
            id: child.key!,
            timestamp: displayTime,
            warnings,
            details,
            createdAt,
            rawData: data,
          });
        });

        history.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAllAlerts(history);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Không thể tải lịch sử cảnh báo của thiết bị này.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, deviceId]);

  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return allAlerts.slice(start, end);
  }, [allAlerts, currentPage, pageSize]);

  const totalPages = Math.ceil(allAlerts.length / pageSize);
  const totalAlerts = allAlerts.length;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [deviceId]);

  const getSeverityColor = (warnings: string[]) => {
    if (
      warnings.some(
        (w) => w.includes("SpO2 thấp") || w.includes("Nhịp tim cao"),
      )
    ) {
      return "bg-red-500";
    }
    if (warnings.some((w) => w.includes("Nhiệt độ"))) {
      return "bg-orange-500";
    }
    return "bg-yellow-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Đang tải lịch sử cảnh báo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800">
      {/* Header */}
      <div className="top-0 z-10 bg-white/80 backdrop-blur-lg border-b shadow-sm dark:bg-black/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bell className="h-7 w-7 text-red-500" />
                  Lịch sử cảnh báo
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedDevice?.id || `Thiết bị ${deviceId}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-full"
              >
                Danh sách
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-full"
              >
                Lưới
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Tổng cảnh báo</p>
                  <p className="text-4xl font-bold">{totalAlerts}</p>
                </div>
                <AlertTriangle className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">
                    Cảnh báo nghiêm trọng
                  </p>
                  <p className="text-4xl font-bold">
                    {
                      allAlerts.filter((a) =>
                        a.warnings.some(
                          (w) => w.includes("SpO2") || w.includes("Nhịp tim"),
                        ),
                      ).length
                    }
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Cảnh báo môi trường</p>
                  <p className="text-4xl font-bold">
                    {
                      allAlerts.filter((a) =>
                        a.warnings.some(
                          (w) => w.includes("Khí gas") || w.includes("Độ ẩm"),
                        ),
                      ).length
                    }
                  </p>
                </div>
                <Thermometer className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {totalAlerts === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-4">
              <Bell className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Chưa có cảnh báo nào
            </h3>
            <p className="text-gray-500">
              Thiết bị này hiện tại chưa phát sinh cảnh báo nào.
            </p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info className="h-4 w-4" />
                <span>
                  Hiển thị {paginatedAlerts.length} / {totalAlerts} cảnh báo
                </span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-sm border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-blue-400"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                  <option value={100}>100 / trang</option>
                </select>
              </div>
            </div>

            {/* Alerts List */}
            {viewMode === "list" ? (
              <div className="space-y-3">
                {paginatedAlerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500 overflow-hidden"
                  >
                    <Accordion type="single" collapsible>
                      <AccordionItem value={alert.id} className="border-0">
                        <AccordionTrigger className="px-5 py-4 hover:bg-red-50/50 rounded-lg dark:bg-black/20 dark:hover:bg-black/50">
                          <div className="flex items-center gap-4 text-left flex-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getSeverityColor(alert.warnings)} animate-pulse`}
                            />
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {alert.timestamp}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-1">
                                {alert.warnings.join(" • ")}
                              </p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-5 pt-2">
                          <div className="space-y-4">
                            <Alert
                              variant="destructive"
                              className="bg-red-50 border-red-200"
                            >
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <AlertTitle className="text-red-800">
                                Chi tiết cảnh báo
                              </AlertTitle>
                              <AlertDescription>
                                <ul className="list-disc pl-5 space-y-1 text-red-700">
                                  {alert.warnings.map((w, i) => (
                                    <li key={i}>{w}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>

                            <div>
                              <h3 className="font-medium mb-3 flex items-center gap-2 text-gray-700">
                                <Clock className="h-4 w-4" />
                                Chỉ số sức khỏe tại thời điểm cảnh báo:
                              </h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                {Object.entries(alert.details).map(
                                  ([key, value]) => {
                                    const Icon = metricIcons[key] || Activity;
                                    const colorClass = getMetricColor(
                                      value,
                                      key,
                                    );
                                    return (
                                      <div
                                        key={key}
                                        className="bg-gray-50 rounded-lg p-3 text-center"
                                      >
                                        <Icon
                                          className={`h-5 w-5 mx-auto mb-1 ${colorClass}`}
                                        />
                                        <p className="text-xs text-gray-500">
                                          {key}
                                        </p>
                                        <p
                                          className={`font-bold ${colorClass}`}
                                        >
                                          {value}
                                        </p>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ))}
              </div>
            ) : (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedAlerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
                  >
                    <div
                      className={`h-1 ${getSeverityColor(alert.warnings)}`}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge variant="destructive" className="mb-2">
                          {alert.warnings.length} cảnh báo
                        </Badge>
                        <Bell className="h-4 w-4 text-gray-400" />
                      </div>
                      <CardTitle className="text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {alert.timestamp}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {alert.warnings.join(" • ")}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(alert.details)
                          .slice(0, 4)
                          .map(([key, value]) => {
                            const Icon = metricIcons[key] || Activity;
                            return (
                              <div
                                key={key}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-1">
                                  <Icon className="h-3 w-3 text-gray-400" />
                                  <span className="text-gray-500">{key}:</span>
                                </div>
                                <span className="font-medium">{value}</span>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    Đầu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    Cuối
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
