// components/CircularGauge.tsx
import { cn } from "../../lib/utils"; // relative path từ root

interface CircularGaugeProps {
  value: number; // Giá trị hiện tại (ví dụ: 36.8)
  min: number; // Min scale
  max: number; // Max scale
  unit: string; // Đơn vị: °C, %, ppm...
  safeMin: number; // Ngưỡng an toàn dưới
  safeMax: number; // Ngưỡng an toàn trên
  label: string; // Tên thông số: "Nhiệt độ cơ thể"
  size?: "sm" | "md" | "lg"; // Kích thước: sm/md/lg
  note?: string; // Ghi chú thêm (tuỳ chọn)
}

export function CircularGauge({
  value,
  min,
  max,
  unit,
  safeMin,
  safeMax,
  label,
  size = "md",
}: CircularGaugeProps) {
  const radius = 70; // Bán kính vòng trong SVG
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  // Tính % progress (0-100)
  const progress = Math.min(
    Math.max(((value - min) / (max - min)) * 100, 0),
    100,
  );
  const offset = circumference - (progress / 100) * circumference;
  const isDanger = value < safeMin || value > safeMax;
  // Xác định màu theo ngưỡng
  let colorClass = "stroke-green-500"; // default an toàn
  if (isDanger) {
    colorClass = "stroke-red-500";
  } else if (
    value < safeMin + (safeMax - safeMin) * 0.1 ||
    value > safeMax - (safeMax - safeMin) * 0.1
  ) {
    colorClass = "stroke-yellow-500"; // gần ngưỡng
  }

  // Kích thước dựa trên prop
  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
  }[size];

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative", sizeClasses)}>
        <div
          className={
            isDanger
              ? "shadow-red-500/50 shadow-xl rounded-4xl bg-card w-full h-full flex items-center justify-center animate-pulse"
              : "shadow-xl rounded-4xl bg-card w-full h-full flex items-center justify-center"
          }
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Vòng nền xám */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#e5e7eb" // gray-200
              strokeWidth={strokeWidth}
            />
            {/* Vòng progress động */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn("transition-all duration-500 ease-out", colorClass)}
            />
          </svg>

          {/* Giá trị lớn ở giữa */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={
                isDanger
                  ? "text-red-500 text-3xl md:text-4xl font-bold"
                  : "text-3xl md:text-4xl font-bold"
              }
            >
              {value.toFixed(1)}
              <span className="text-xl font-normal">{unit}</span>
            </span>
            <span className="text-sm text-muted-foreground mt-1">{label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
