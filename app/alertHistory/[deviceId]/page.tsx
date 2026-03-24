// app/history/[deviceId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ← Quan trọng
import { ref, onValue, query, orderByChild } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/AuthProvider";

import { AlertTriangle, Bell, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
}

export default function AlertHistoryPage() {
  const { deviceId } = useParams<{ deviceId: string }>(); // Lấy deviceId từ URL
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid || !deviceId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    // Chỉ lấy alert_history của device được chọn
    const alertsRef = ref(db, `devices/${deviceId}/alert_history`);

    const q = query(alertsRef, orderByChild("timestamp")); // hoặc "createdAt" nếu bạn có

    const unsubscribe = onValue(
      q,
      (snapshot) => {
        const history: AlertItem[] = [];

        snapshot.forEach((child) => {
          const data = child.val();

          // Xử lý reasons → warnings
          const warnings: string[] = [];
          if (data.reasons) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Object.values(data.reasons).forEach((reason: any) => {
              if (reason) warnings.push(String(reason));
            });
          }

          // Format thời gian
          let displayTime = "Không có thời gian";
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
          }

          // Xây dựng details
          const details: Record<string, string> = {
            SpO2: data.spo2 !== undefined ? `${data.spo2}%` : "--",
            "Nhịp tim":
              data.heartRate !== undefined ? `${data.heartRate} BPM` : "--",
            "Nhiệt độ":
              data.temperature !== undefined ? `${data.temperature}°C` : "--",
            "Khí gas": data.gas !== undefined ? `${data.gas} ppm` : "--",
            "Độ ẩm": data.humidity !== undefined ? `${data.humidity}%` : "--",
            "Huyết áp": data.bloodPressure || "--/--",
          };

          history.push({
            id: child.key!,
            timestamp: displayTime,
            warnings,
            details,
            createdAt:
              typeof data.timestamp === "number" ? data.timestamp : undefined,
          });
        });

        // Mới nhất lên đầu
        history.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setAlerts(history);
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

  const totalAlerts = alerts.length;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Lịch sử cảnh báo - Thiết bị {deviceId}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="mb-6 border-red-200 bg-red-50/50">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng số cảnh báo
                </p>
                <p className="text-3xl font-bold">{totalAlerts}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-4 py-2 text-lg"
            >
              <Bell className="h-5 w-5" />
              {totalAlerts}
            </Badge>
          </CardContent>
        </Card>

        {alerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Thiết bị này chưa có cảnh báo nào.
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {alerts.map((alert) => (
              <AccordionItem
                key={alert.id}
                value={alert.id}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="bg-red-50 hover:bg-red-100 px-6 py-4">
                  <div className="flex items-center gap-4 text-left">
                    <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-700">
                        {alert.timestamp}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {alert.warnings.join(" • ")}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 pt-4 bg-white">
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle>Cảnh báo</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1">
                        {alert.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Chi tiết lúc đó:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {Object.entries(alert.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
