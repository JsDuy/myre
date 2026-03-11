// app/monitor/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { CircularGauge } from "../../components/CircularGauge";
import { AlertDanger } from "../../components/AlertDanger";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ClientOnlyDate } from "@/components/ClientOnlyDate";
export default function HealthMonitorPage() {
  const [data] = useState([
    {
      label: "Nhiệt độ cơ thể",
      value: 36.8,
      unit: "°C",
      min: 30,
      max: 42,
      safeMin: 36,
      safeMax: 37.5,
    },
    {
      label: "Nồng độ oxy (SpO2)",
      value: 95,
      unit: "%",
      min: 70,
      max: 100,
      safeMin: 95,
      safeMax: 100,
    },
    {
      label: "Nhiệt độ môi trường",
      value: 28.5,
      unit: "°C",
      min: 0,
      max: 50,
      safeMin: 18,
      safeMax: 30,
    },
    {
      label: "Nồng độ khí gas",
      value: 45,
      unit: "ppm",
      min: 0,
      max: 500,
      safeMin: 0,
      safeMax: 100,
    },
    {
      label: "Độ ẩm môi trường",
      value: 45,
      unit: "%",
      min: 0,
      max: 100,
      safeMin: 40,
      safeMax: 60,
    },
    {
      label: "Huyết áp (Systolic)",
      value: 90,
      unit: "mmHg",
      min: 60,
      max: 200,
      safeMin: 90,
      safeMax: 120,
      note: "118/78 mmHg",
    },
  ]);

  const [alertHistory, setAlertHistory] = useState<
    Array<{
      id: string;
      timestamp: string;
      message: string;
      details: string;
      label: string; // để biết item nào
    }>
  >([]);
  useEffect(() => {
    console.log("alertHistory thay đổi:", alertHistory);
  }, [alertHistory]);

  const toastIdsRef = useRef<Record<string, string>>({});
  const [soundMuted, setSoundMuted] = useState(false);

  // Ref lưu trạng thái "đã beep cho thông số này chưa" (key: label)
  const beepedRef = useRef<Record<string, boolean>>({});

  // Ref để lưu instance của audio đang phát
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Ref để theo dõi trạng thái đang phát âm thanh
  const isPlayingRef = useRef(false);

  // Tính hasDanger tổng thể
  const hasDanger = useMemo(
    () =>
      data.some(
        (item) => item.value < item.safeMin || item.value > item.safeMax,
      ),
    [data],
  );

  // Hàm dừng âm thanh
  const stopAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      isPlayingRef.current = false;
      console.log("Đã dừng âm thanh cảnh báo");
    }
  };

  // Hàm phát âm thanh lặp lại
  const playAlertSound = () => {
    // Nếu đang phát rồi thì không phát lại
    if (isPlayingRef.current) return;

    try {
      // Tạo audio instance mới
      const audio = new Audio("/sounds/0311(1).MP3");
      audio.volume = 1;
      audio.loop = true; // Lặp lại vô hạn

      // Lưu vào ref
      audioRef.current = audio;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlayingRef.current = true;
            console.log("Bắt đầu phát âm thanh cảnh báo (lặp lại)");
          })
          .catch((error) => {
            console.log("Trình duyệt đã chặn phát âm thanh:", error);
            audioRef.current = null;
          });
      }
    } catch (e) {
      console.log("Lỗi phát âm thanh:", e);
    }
  };

  // useEffect(() => {
  //   // Luôn kiểm tra và dừng âm thanh nếu soundMuted = true
  //   if (soundMuted) {
  //     stopAlertSound();
  //     return;
  //   }

  //   // Kiểm tra xem có thông số nào đang nguy hiểm không
  //   const currentlyHasDanger = data.some(
  //     (item) => item.value < item.safeMin || item.value > item.safeMax,
  //   );

  //   // Nếu có nguy hiểm và chưa phát âm thanh thì phát
  //   if (currentlyHasDanger && !isPlayingRef.current) {
  //     playAlertSound();
  //   }
  //   // Nếu không còn nguy hiểm và đang phát thì dừng
  //   else if (!currentlyHasDanger && isPlayingRef.current) {
  //     stopAlertSound();
  //   }

  //   // Cập nhật trạng thái beepedRef cho từng thông số
  //   data.forEach((item) => {
  //     const isCurrentlyDanger =
  //       item.value < item.safeMin || item.value > item.safeMax;

  //     if (isCurrentlyDanger) {
  //       beepedRef.current[item.label] = true;
  //     } else {
  //       delete beepedRef.current[item.label];
  //     }
  //   });
  // }, [data, soundMuted]);

  // Cleanup khi component unmount

  useEffect(() => {
    // Luôn kiểm tra và dừng âm thanh nếu soundMuted = true
    if (soundMuted) {
      stopAlertSound();
      return;
    }

    // Kiểm tra tổng danger
    const currentlyHasDanger = data.some(
      (item) => item.value < item.safeMin || item.value > item.safeMax,
    );

    // Quản lý âm thanh
    if (currentlyHasDanger && !isPlayingRef.current) {
      playAlertSound();
    } else if (!currentlyHasDanger && isPlayingRef.current) {
      stopAlertSound();

      // Hết danger toàn bộ → đóng hết toast (phòng miss)
      Object.values(toastIdsRef.current).forEach((id) => toast.dismiss(id));
      toastIdsRef.current = {};
    }

    // Xử lý từng item
    data.forEach((item) => {
      const isCurrentlyDanger =
        item.value < item.safeMin || item.value > item.safeMax;
      const wasBeeped = beepedRef.current[item.label] ?? false;

      if (isCurrentlyDanger) {
        beepedRef.current[item.label] = true;

        // Danger mới → tạo toast và lưu ID
        if (!wasBeeped) {
          const timestamp = new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
          });
          const message = `${item.label} vượt ngưỡng an toàn!`;
          const details = `Giá trị: ${item.value}${item.unit} (an toàn: ${item.safeMin} – ${item.safeMax})`;

          // Thêm vào lịch sử
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
            closeButton: true,
            icon: <AlertTriangle className="h-5 w-5" />,
            action: {
              label: "Chi tiết",
              onClick: () => {
                console.log("Xem chi tiết:", item.label);
                // Optional scroll: document.getElementById(`gauge-${item.label.replace(/\s+/g, '-')}`)?.scrollIntoView({ behavior: 'smooth' });
              },
            },
          });

          // Lưu ID (ép kiểu nếu TS kêu)
          toastIdsRef.current[item.label] = toastId as string;
        }
      } else {
        // Hết danger → xóa đánh dấu + đóng toast nếu tồn tại
        delete beepedRef.current[item.label];

        const existingToastId = toastIdsRef.current[item.label];
        if (existingToastId) {
          toast.dismiss(existingToastId);
          delete toastIdsRef.current[item.label];
        }
      }
    });
  }, [data, soundMuted]);

  useEffect(() => {
    return () => {
      stopAlertSound();
    };
  }, []);

  const handleMuteToggle = () => {
    setSoundMuted((prev) => !prev);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <AlertDanger
        isDanger={hasDanger}
        muted={soundMuted}
        onMuteToggle={handleMuteToggle}
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Theo dõi sức khỏe thời gian thực
        </h1>
        <p className="text-xl text-muted-foreground">
          Giám sát 6 thông số quan trọng
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {data.map((item, index) => (
          <CircularGauge
            key={index}
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
        Dữ liệu cập nhật mỗi 5 giây • Cập nhật lần cuối:{" "}
        {/* {new Date().toLocaleTimeString("vi-VN")} */}
        {/* <ClientOnlyDate /> */}
      </div>
    </div>
  );
}
