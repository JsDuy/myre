// components/AlertDanger.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface AlertDangerProps {
  isDanger: boolean;
  muted: boolean;
  onMuteToggle: () => void;
}

export function AlertDanger({
  isDanger,
  muted,
  onMuteToggle,
}: AlertDangerProps) {
  if (!isDanger) return null;

  return (
    <Alert
      variant="destructive"
      className="mb-10 border-red-600 bg-red-50/80 dark:bg-red-950/50 shadow-lg"
    >
      <AlertTriangle className="h-6 w-6" />
      <AlertTitle className="text-xl font-bold">CẢNH BÁO NGUY HIỂM!</AlertTitle>
      <AlertDescription className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
        <span className="text-base">
          Ít nhất một thông số đang vượt ngưỡng an toàn. Vui lòng kiểm tra và xử
          lý ngay lập tức!
        </span>
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-3">
            <Switch
              id="mute-sound"
              checked={muted}
              onCheckedChange={onMuteToggle}
            />
            <label
              htmlFor="mute-sound"
              className="text-sm font-medium cursor-pointer"
            >
              Tắt âm báo
            </label>
          </div>
          <Button variant="outline" size="sm" onClick={onMuteToggle}>
            Tắt tạm thời
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
