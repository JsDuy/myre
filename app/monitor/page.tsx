// app/monitor/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { CircularGauge } from "../../components/ui/CircularGauge";
import { AlertDanger } from "../../components/AlertDanger";

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
      value: 97,
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
      value: 70,
      unit: "mmHg",
      min: 60,
      max: 200,
      safeMin: 90,
      safeMax: 120,
      note: "118/78 mmHg",
    },
  ]);

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

  useEffect(() => {
    // Luôn kiểm tra và dừng âm thanh nếu soundMuted = true
    if (soundMuted) {
      stopAlertSound();
      return;
    }

    // Kiểm tra xem có thông số nào đang nguy hiểm không
    const currentlyHasDanger = data.some(
      (item) => item.value < item.safeMin || item.value > item.safeMax,
    );

    // Nếu có nguy hiểm và chưa phát âm thanh thì phát
    if (currentlyHasDanger && !isPlayingRef.current) {
      playAlertSound();
    }
    // Nếu không còn nguy hiểm và đang phát thì dừng
    else if (!currentlyHasDanger && isPlayingRef.current) {
      stopAlertSound();
    }

    // Cập nhật trạng thái beepedRef cho từng thông số
    data.forEach((item) => {
      const isCurrentlyDanger =
        item.value < item.safeMin || item.value > item.safeMax;

      if (isCurrentlyDanger) {
        beepedRef.current[item.label] = true;
      } else {
        delete beepedRef.current[item.label];
      }
    });
  }, [data, soundMuted]);

  // Cleanup khi component unmount
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
      <div className="text-center mt-12 text-sm text-muted-foreground">
        Dữ liệu cập nhật mỗi 5 giây • Cập nhật lần cuối:{" "}
        {new Date().toLocaleTimeString("vi-VN")}
      </div>
    </div>
  );
}
