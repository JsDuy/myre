"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { CircularGauge } from "@/components/CircularGauge"; // điều chỉnh path nếu cần
import { AlertDanger } from "@/components/AlertDanger";
import { toast } from "sonner";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ref, onValue, off } from "firebase/database";
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
// ──────────────────────────────────────────────
// TYPE cho dữ liệu health (dựa trên code bạn)
interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  safeMin: number;
  safeMax: number;
  note?: string;
}

interface Alert {
  id: string;
  timestamp: string;
  message: string;
  details: string;
  label: string;
}

export default function HealthMonitorPage() {
  const { user } = useAuth();
  const { selectedDevice, loading: deviceLoading } = useDevice();

  const [metrics, setMetrics] = useState<HealthMetric[]>([
    {
      label: "Nhịp tim",
      value: 0,
      unit: "bpm",
      min: 40,
      max: 180,
      safeMin: 60,
      safeMax: 100,
    },
    {
      label: "Nhiệt độ cơ thể",
      value: 0,
      unit: "°C",
      min: 30,
      max: 42,
      safeMin: 36,
      safeMax: 37.5,
    },
    {
      label: "Nồng độ oxy (SpO2)",
      value: 0,
      unit: "%",
      min: 70,
      max: 100,
      safeMin: 95,
      safeMax: 100,
    },
    {
      label: "Nhiệt độ môi trường",
      value: 0,
      unit: "°C",
      min: 0,
      max: 50,
      safeMin: 18,
      safeMax: 30,
    },
    {
      label: "Nồng độ khí gas",
      value: 0,
      unit: "ppm",
      min: 0,
      max: 500,
      safeMin: 0,
      safeMax: 100,
    },
    {
      label: "Độ ẩm môi trường",
      value: 0,
      unit: "%",
      min: 0,
      max: 100,
      safeMin: 40,
      safeMax: 60,
    },
    {
      label: "Huyết áp (Systolic)",
      value: 0,
      unit: "mmHg",
      min: 60,
      max: 200,
      safeMin: 90,
      safeMax: 120,
      note: "N/A",
    },
  ]);

  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [soundMuted, setSoundMuted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const toastIdsRef = useRef<Record<string, string>>({});
  const beepedRef = useRef<Record<string, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  const hasDanger = useMemo(
    () => metrics.some((m) => m.value < m.safeMin || m.value > m.safeMax),
    [metrics],
  );
  useEffect(() => {
    if (!user || !selectedDevice || deviceLoading) return;

    const deviceId = selectedDevice.id;
    const healthRef = ref(db, `devices/${deviceId}/health_data/latest`);

    const unsubscribe = onValue(
      healthRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        setMetrics((prev) =>
          prev.map((item) => {
            let value = item.value;
            let note = item.note;

            switch (item.label) {
              case "Nhịp tim":
                value = Number(data.heartRate) || 0;
                break;
              case "Nồng độ oxy (SpO2)":
                value = Number(data.spo || data.spo2) || 0;
                break;
              case "Nhiệt độ cơ thể":
              case "Nhiệt độ môi trường":
                value = Number(data.temperature) || 0;
                break;
              case "Nồng độ khí gas":
                value = Number(data.gas) || 0;
                break;
              case "Độ ẩm môi trường":
                value = Number(data.humidity) || 0;
                break;
              case "Huyết áp (Systolic)":
                const bp = data.bloodPressure || "--/--";
                note = bp;
                value = Number(bp.split("/")[0]) || 0; // lấy systolic
                break;
            }

            return { ...item, value, note };
          }),
        );

        setIsOnline(true);
      },
      (err) => {
        console.error("Realtime error:", err);
        setIsOnline(false);
        toast.error("Mất kết nối realtime với thiết bị");
      },
    );

    return () => {
      off(healthRef);
      unsubscribe();
    };
  }, [user, selectedDevice, deviceLoading]);
  // ──────────────────────────────────────────────
  // Hàm phát / dừng âm thanh
  const playAlertSound = () => {
    if (isPlayingRef.current || soundMuted) return;

    try {
      const audio = new Audio("/sounds/0311(1).MP3");
      audio.volume = 0.7;
      audio.loop = true;
      audioRef.current = audio;
      audio
        .play()
        .then(() => {
          isPlayingRef.current = true;
        })
        .catch((err) => console.warn("Autoplay blocked:", err));
    } catch (err) {
      console.error("Lỗi phát âm thanh:", err);
    }
  };

  const stopAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      isPlayingRef.current = false;
    }
  };

  // ──────────────────────────────────────────────
  // Logic alert & sound (chạy khi metrics thay đổi)
  useEffect(() => {
    if (soundMuted) {
      stopAlertSound();
      return;
    }

    const currentlyHasDanger = metrics.some(
      (m) => m.value < m.safeMin || m.value > m.safeMax,
    );

    if (currentlyHasDanger && !isPlayingRef.current) {
      playAlertSound();
    } else if (!currentlyHasDanger && isPlayingRef.current) {
      stopAlertSound();
      // Đóng hết toast khi hết danger toàn bộ
      Object.values(toastIdsRef.current).forEach((id) => toast.dismiss(id));
      toastIdsRef.current = {};
    }

    // Xử lý từng metric
    metrics.forEach((item) => {
      const isDanger = item.value < item.safeMin || item.value > item.safeMax;
      const wasBeeped = beepedRef.current[item.label] ?? false;

      if (isDanger) {
        beepedRef.current[item.label] = true;

        if (!wasBeeped) {
          const timestamp = new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          });
          const message = `${item.label} vượt ngưỡng an toàn!`;
          const details = `Giá trị: ${item.value}${item.unit} (an toàn: ${item.safeMin} – ${item.safeMax})`;

          setAlertHistory((prev) => [
            {
              id: `${item.label}-${Date.now()}`,
              timestamp,
              message,
              details,
              label: item.label,
            },
            ...prev,
          ]);

          const toastId = toast.error(message, {
            description: details,
            duration: Infinity,
            icon: <AlertTriangle className="h-5 w-5" />,
            action: {
              label: "Chi tiết",
              onClick: () => console.log("Chi tiết:", item.label),
            },
          }) as string;

          toastIdsRef.current[item.label] = toastId;
        }
      } else {
        delete beepedRef.current[item.label];
        const id = toastIdsRef.current[item.label];
        if (id) {
          toast.dismiss(id);
          delete toastIdsRef.current[item.label];
        }
      }
    });
  }, [metrics, soundMuted]);

  // Cleanup
  useEffect(() => {
    return () => stopAlertSound();
  }, []);

  // ──────────────────────────────────────────────
  // TODO: Tích hợp Firebase realtime ở đây (sẽ làm ở bước tiếp theo)
  // useEffect(() => {
  //   // listener Firebase
  // }, [selectedDeviceId]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Phần header với dropdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Theo dõi sức khỏe thời gian thực
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            {selectedDevice
              ? `Thiết bị: ${selectedDevice.name} (${selectedDevice.id})`
              : "Chưa chọn thiết bị"}
          </p>
        </div>

        {/* Dropdown chọn thiết bị */}
        <div className="w-full md:w-72">
          <Select
            value={selectedDevice?.id || ""}
            onValueChange={(deviceId) => {
              const dev = devices.find((d) => d.id === deviceId);
              if (dev) setSelectedDevice(dev);
            }}
            disabled={devices.length === 0 || deviceLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn thiết bị" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((dev) => (
                <SelectItem key={dev.id} value={dev.id}>
                  {dev.name} (
                  {dev.role === "owner" ? "Chủ sở hữu" : "Được chia sẻ"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid gauge - giữ nguyên */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {metrics.map((item, idx) => (
          <CircularGauge
            key={idx}
            value={item.value}
            min={item.min}
            max={item.max}
            unit={item.unit}
            safeMin={item.safeMin}
            safeMax={item.safeMax}
            label={item.label}
            size="lg"
            note={item.note}
          />
        ))}
      </div>

      {alertHistory.length > 0 && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Các cảnh báo gần đây ({alertHistory.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAlertHistory([])}
              className="text-red-600 hover:bg-red-100"
            >
              Tắt tất cả
            </Button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {alertHistory.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-white rounded border border-red-100 flex justify-between items-start gap-4"
              >
                <div>
                  <p className="font-medium text-red-700">{alert.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.details}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setAlertHistory((prev) =>
                      prev.filter((a) => a.id !== alert.id),
                    )
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-12 text-sm text-muted-foreground">
        Dữ liệu cập nhật realtime • Cập nhật lần cuối:{" "}
        {new Date().toLocaleTimeString("vi-VN")}
      </div>
    </div>
  );
}
