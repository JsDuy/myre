"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  X,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ref,
  onValue,
  off,
  query,
  orderByChild,
  limitToLast,
  push,
  set,
} from "firebase/database";
import { db } from "@/lib/firebase";
import { useDevice } from "@/providers/DeviceProvider";
import { useAuth } from "@/providers/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  safeMin: number;
  safeMax: number;
  note?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  isNoFinger?: boolean;
}

interface Alert {
  id: string;
  timestamp: string;
  message: string;
  details: string;
  createdAt: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metricIcons: Record<string, any> = {
  "Nhịp tim": Heart,
  "Nồng độ oxy (SpO2)": Wind,
  "Nhiệt độ môi trường": Thermometer,
  "Nồng độ khí gas": Activity,
  "Độ ẩm môi trường": Droplets,
};

export default function HealthMonitorPage() {
  const { user } = useAuth();
  const {
    selectedDevice,
    setSelectedDevice,
    devices,
    loading: deviceLoading,
  } = useDevice();

  const [metrics, setMetrics] = useState<HealthMetric[]>([
    {
      label: "Nhịp tim",
      value: 0,
      unit: "bpm",
      min: 40,
      max: 180,
      safeMin: 55,
      safeMax: 90,
      icon: Heart,
    },
    {
      label: "Nồng độ oxy (SpO2)",
      value: 0,
      unit: "%",
      min: 70,
      max: 100,
      safeMin: 75,
      safeMax: 100,
      icon: Wind,
    },
    {
      label: "Nhiệt độ môi trường",
      value: 0,
      unit: "°C",
      min: 0,
      max: 50,
      safeMin: 18,
      safeMax: 38,
      icon: Thermometer,
    },
    {
      label: "Nồng độ khí gas",
      value: 0,
      unit: "ppm",
      min: 0,
      max: 700,
      safeMin: 0,
      safeMax: 620,
      icon: Activity,
    },
    {
      label: "Độ ẩm môi trường",
      value: 0,
      unit: "%",
      min: 0,
      max: 100,
      safeMin: 40,
      safeMax: 70,
      icon: Droplets,
    },
  ]);

  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [mounted, setMounted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [noFingerDetected, setNoFingerDetected] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const currentToastIdRef = useRef<string | null>(null);
  const lastAlertSignatureRef = useRef<string>("");

  const hasDanger = useMemo(() => {
    // Nếu đang ở trạng thái không có ngón tay -> không coi là danger
    if (noFingerDetected) return false;

    return metrics.some((m) => {
      // Chỉ kiểm tra các chỉ số có value > 0 (bỏ qua chỉ số đang ở trạng thái không có ngón tay)
      if (m.value === 0) return false;
      return m.value < m.safeMin || m.value > m.safeMax;
    });
    // eslint-disable-next-line react-hooks/immutability
  }, [metrics, noFingerDetected]);

  // Format thời gian
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // ====================== Listener Health Data ======================
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!user || !selectedDevice || deviceLoading) return;

    const deviceId = selectedDevice.id;
    const healthRef = ref(db, `devices/${deviceId}/health_data/latest`);

    const unsubscribe = onValue(healthRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setIsOnline(false);
        return;
      }

      // Lấy giá trị HR và SpO2
      const heartRate = Number(data.heartRate ?? data.hr ?? 0);
      const spo2 = Number(data.spo2 ?? data.spo ?? 0);

      // Kiểm tra điều kiện "không có ngón tay"
      const isNoFinger = heartRate === 0 && spo2 === 0;
      setNoFingerDetected(isNoFinger);

      setMetrics((prev) =>
        prev.map((item) => {
          let value = item.value;
          let note = item.note;

          switch (item.label) {
            case "Nhịp tim":
              value = Number(data.heartRate ?? data.hr ?? 0);
              if (isNoFinger) {
                note = "Không phát hiện ngón tay";
              } else {
                note = undefined;
              }
              break;
            case "Nồng độ oxy (SpO2)":
              value = Number(data.spo2 ?? data.spo ?? 0);
              if (isNoFinger) {
                note = "Không phát hiện ngón tay";
              } else {
                note = undefined;
              }
              break;
            case "Nhiệt độ môi trường":
              value = Number(data.envTemp ?? data.temperature ?? 0);
              break;
            case "Nồng độ khí gas":
              value = Number(data.gas ?? data.gasLevel ?? 0);
              break;
            case "Độ ẩm môi trường":
              value = Number(data.humidity ?? 0);
              break;
          }
          return { ...item, value, note };
        }),
      );

      setLastUpdate(new Date());
      setIsOnline(true);
    });

    return () => {
      off(healthRef);
      unsubscribe();
    };
  }, [user, selectedDevice, deviceLoading]);

  // ====================== Listener Alert History ======================
  useEffect(() => {
    if (!user || !selectedDevice || deviceLoading) return;

    const deviceId = selectedDevice.id;
    const alertsRef = ref(db, `devices/${deviceId}/alert_history`);
    const q = query(alertsRef, orderByChild("timestamp"), limitToLast(50));

    const unsubscribe = onValue(q, (snapshot) => {
      const newAlerts: Alert[] = [];
      snapshot.forEach((child) => {
        const data = child.val();
        if (!data?.timestamp) return;

        const date = new Date(data.timestamp);
        const displayTime = date.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const reasons: string[] = [];
        if (data.spo2 < 75) reasons.push(`SpO2 thấp: ${data.spo2}%`);
        if (data.spo2 > 100) reasons.push(`SpO2 cao: ${data.spo2}%`);
        if (data.heartRate > 90)
          reasons.push(`Nhịp tim cao: ${data.heartRate} BPM`);
        if (data.heartRate < 55)
          reasons.push(`Nhịp tim thấp: ${data.heartRate} BPM`);
        if (data.temperature > 38)
          reasons.push(`Nhiệt độ cao: ${data.temperature}°C`);
        if (data.temperature < 18)
          reasons.push(`Nhiệt độ thấp: ${data.temperature}°C`);
        if (data.gas > 620) reasons.push(`Khí gas cao: ${data.gas} ppm`);
        if (data.humidity > 70) reasons.push(`Độ ẩm cao: ${data.humidity}%`);
        if (data.humidity < 40) reasons.push(`Độ ẩm thấp: ${data.humidity}%`);

        newAlerts.push({
          id: child.key!,
          timestamp: displayTime,
          message: reasons.join(" • ") || "Cảnh báo sức khỏe",
          details: `Nhịp tim: ${data.heartRate} | SpO2: ${data.spo2}`,
          createdAt: data.timestamp,
        });
      });

      newAlerts.sort((a, b) => b.createdAt - a.createdAt);
      setAlertHistory(newAlerts);
    });

    return () => {
      off(alertsRef);
      unsubscribe();
    };
  }, [user, selectedDevice, deviceLoading]);

  // ====================== GHI ALERT VÀO FIREBASE ======================
  const saveAlertToFirebase = async () => {
    if (!selectedDevice || !user) return;

    const deviceId = selectedDevice.id;
    const now = Date.now();

    const signature = metrics.map((m) => `${m.label}-${m.value}`).join("|");
    if (signature === lastAlertSignatureRef.current) return;
    lastAlertSignatureRef.current = signature;

    const alertData = {
      timestamp: now,
      heartRate: metrics[0].value,
      spo2: metrics[1].value,
      temperature: metrics[2].value,
      gas: metrics[3].value,
      humidity: metrics[4].value,
    };

    try {
      const alertRef = push(ref(db, `devices/${deviceId}/alert_history`));
      await set(alertRef, alertData);
      console.log("✅ Đã lưu cảnh báo vào Firebase");
    } catch (err) {
      console.error("❌ Lỗi lưu alert vào Firebase:", err);
    }
  };

  // Kiểm tra danger và thực hiện hành động
  useEffect(() => {
    if (soundMuted || !isOnline) {
      // eslint-disable-next-line react-hooks/immutability
      stopAlertSound();
      return;
    }

    if (hasDanger) {
      // eslint-disable-next-line react-hooks/immutability
      playAlertSound();
      saveAlertToFirebase();

      const description = metrics
        .filter((m) => m.value < m.safeMin || m.value > m.safeMax)
        .map((m) => `${m.label}: ${m.value}${m.unit}`)
        .join(" • ");

      if (currentToastIdRef.current) toast.dismiss(currentToastIdRef.current);

      const toastId = toast.error("⚠️ Cảnh báo sức khỏe!", {
        description,
        duration: Infinity,
        icon: <AlertTriangle className="h-5 w-5" />,
        action: { label: "Tắt", onClick: () => toast.dismiss(toastId) },
      }) as string;

      currentToastIdRef.current = toastId;
    } else {
      stopAlertSound();
      if (currentToastIdRef.current) {
        toast.dismiss(currentToastIdRef.current);
        currentToastIdRef.current = null;
      }
      lastAlertSignatureRef.current = "";
    }
  }, [hasDanger, metrics, soundMuted, isOnline]);

  const playAlertSound = useCallback(() => {
    if (soundMuted) {
      console.log("🔇 Âm thanh đã bị tắt");
      return;
    }
    if (isPlayingRef.current || soundMuted) return;

    // Chỉ phát âm thanh khi có tương tác người dùng trước đó
    // hoặc đợi user click vào trang
    try {
      const audio = new Audio("/sounds/0311(1).MP3");
      audio.volume = 0.7;
      audio.loop = true;

      // Thêm event listener để xử lý lỗi play
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioRef.current = audio;
            isPlayingRef.current = true;
          })
          .catch((err) => {
            console.warn("Audio play was prevented:", err);
            // Không set audioRef vì không phát được
          });
      }
    } catch (err) {
      console.error("Lỗi phát âm thanh:", err);
    }
  }, [soundMuted]);

  const stopAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      isPlayingRef.current = false;
    }
  };

  const handleMuteToggle = () => setSoundMuted((prev) => !prev);

  useEffect(() => {
    return () => {
      stopAlertSound();
      if (currentToastIdRef.current) toast.dismiss(currentToastIdRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-gray-800 lg:mx-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Activity className="h-3 w-3 mr-1" />
                Theo dõi sức khỏe realtime
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300">
                Giám sát sức khỏe
              </h1>
              <p className="text-muted-foreground">
                {selectedDevice
                  ? `Thiết bị: ${selectedDevice.id}`
                  : "Vui lòng chọn thiết bị để bắt đầu theo dõi"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Online Status */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white  rounded-full shadow-sm border">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-600">Offline</span>
                  </>
                )}
              </div>

              <div className="text-sm text-muted-foreground dark:text-black/80 bg-white px-3 py-2 rounded-full shadow-sm">
                CN: {mounted ? formatTime(lastUpdate.getTime()) : "---"}
              </div>

              {/* Device Selector */}
              <div className="w-64">
                <Select
                  value={selectedDevice?.id || ""}
                  onValueChange={(id) => {
                    const dev = devices.find((d) => d.id === id);
                    if (dev) setSelectedDevice(dev);
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-200 shadow-sm">
                    <SelectValue placeholder="Chọn thiết bị" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id}>
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span>{dev.id}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {dev.role === "owner"
                              ? "Chủ sở hữu"
                              : "Được chia sẻ"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mute Button */}
              <Button
                variant={soundMuted ? "outline" : "default"}
                size="icon"
                onClick={handleMuteToggle}
                className={`rounded-full ${!soundMuted && hasDanger ? "animate-pulse bg-red-500 hover:bg-red-600 mx-6" : "mx-6"}`}
              >
                {soundMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        {noFingerDetected && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 shadow-sm">
            <Fingerprint className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">
                ⚠️ Không phát hiện ngón tay
              </p>
              <p className="text-sm text-amber-600">
                Vui lòng đặt ngón tay lên cảm biến để theo dõi nhịp tim và SpO2
              </p>
            </div>
          </div>
        )}
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            const isDanger =
              item.value < item.safeMin || item.value > item.safeMax;
            const isNormal = !isDanger && item.value > 0;

            return (
              <Card
                key={idx}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isDanger
                    ? "border-red-200 bg-gradient-to-br from-red-50 to-white"
                    : "border-gray-100"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${isDanger ? "bg-red-100" : "bg-blue-50"}`}
                      >
                        <Icon
                          className={`h-5 w-5 ${isDanger ? "text-red-500" : "text-blue-500 dark:text-white-800"}`}
                        />
                      </div>
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {item.label}
                      </CardTitle>
                    </div>
                    {item.note && item.note !== "N/A" && (
                      <Badge variant="outline" className="text-xs">
                        {item.note}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${isDanger ? "text-red-600" : isNormal ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-600"}`}
                    >
                      {item.value > 0 ? item.value.toFixed(1) : "---"}
                      <span className="text-lg font-normal text-gray-500 ml-1">
                        {item.unit}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-center gap-2 text-xs">
                      <span className="text-green-600">↓ {item.safeMin}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-red-600">{item.safeMax} ↑</span>
                    </div>
                    {isDanger && (
                      <Badge variant="destructive" className="mt-3 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Chỉ số bất thường
                      </Badge>
                    )}
                  </div>
                </CardContent>
                <div
                  className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
                    isDanger
                      ? "bg-red-500"
                      : isNormal
                        ? "bg-green-500"
                        : "bg-gray-300"
                  }`}
                  style={{
                    width: `${((item.value - item.min) / (item.max - item.min)) * 100}%`,
                  }}
                />
              </Card>
            );
          })}
        </div>

        {/* Alert History */}
        {alertHistory.length > 0 && (
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <CardTitle className="text-red-700">
                    Lịch sử cảnh báo
                  </CardTitle>
                  <Badge variant="destructive" className="ml-2">
                    {alertHistory.length} cảnh báo
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAlertHistory([])}
                  className="border-red-200 hover:bg-red-50 hover:text-red-600 transition-all dark:border-red-400 dark:hover:bg-red-500 dark:hover:text-white dark:text-black my-5"
                >
                  Xóa tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-96 overflow-y-auto">
                {alertHistory.slice(0, 10).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-red-50/50 transition-colors flex justify-between items-start group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <p className="font-medium text-red-700">
                          {alert.message}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{alert.details}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {alert.timestamp}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        setAlertHistory((prev) =>
                          prev.filter((a) => a.id !== alert.id),
                        )
                      }
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
            <div
              className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="text-sm text-muted-foreground">
              {isOnline
                ? "Đang kết nối đến thiết bị"
                : "Mất kết nối, đang thử lại..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
