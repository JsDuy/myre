// components/ClientOnlyDate.tsx
"use client";

import { useState } from "react";

export function ClientOnlyDate() {
  const [time] = useState(() => {
    // Khởi tạo đồng bộ chỉ 1 lần khi component mount (client-side)
    return new Date().toLocaleTimeString("vi-VN");
  });

  return <span>{time || "--:--:--"}</span>;
}
