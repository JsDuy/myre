// app/history/page.tsx
"use client";

import { useState } from "react";
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

// Dữ liệu mẫu tạm thời (reset khi reload) - sau này thay bằng fetch từ logger hoặc backend
const mockAlertHistory = [
  {
    id: 1,
    timestamp: "11/03/2026 23:03:17",
    warnings: ["SpO2 thấp: 0%", "Khí gas cao: 404 ppm"],
    details: {
      SpO2: "0%",
      "Nhịp tim": "0 BPM",
      "Nhiệt độ": "31.8°C",
      "Khí gas": "404 ppm",
      "Độ ẩm": "48%",
      "Huyết áp": "--/--",
    },
  },
  {
    id: 2,
    timestamp: "09/03/2026 17:10:54",
    warnings: ["SpO2 thấp: 0%", "Khí gas cao: 404 ppm"],
    details: {
      SpO2: "0%",
      "Nhịp tim": "0 BPM",
      // ... thêm tương tự
    },
  },
  // Thêm entry khác nếu cần
];

export default function AlertHistoryPage() {
  const [alerts, setAlerts] = useState(mockAlertHistory); // Sau này dùng global logger hoặc localStorage tạm

  // Tính tổng số cảnh báo
  const totalAlerts = alerts.length;

  // Optional: Nếu dùng alertLogger.ts từ trước, load từ đó
  // useEffect(() => {
  //   setAlerts(getAlertHistory().reverse()); // Mới nhất lên đầu
  // }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {" "}
      {/* Padding bottom cho mobile nav nếu có */}
      {/* Header giống mobile */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Lịch sử cảnh báo
          </h1>
          {/* Icon back nếu cần (cho mobile feel) */}
          {/* <ArrowLeft className="h-6 w-6" /> */}
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Tổng số cảnh báo */}
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

        {/* Thời gian phạm vi */}
        <div className="flex items-center justify-center gap-2 mb-8 text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <span>Từ 04/03/2026 đến 11/03/2026</span>
        </div>

        {/* Danh sách cảnh báo */}
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Chưa có cảnh báo nào trong lịch sử.
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {alerts.map((alert) => (
              <AccordionItem
                key={alert.id}
                value={alert.id.toString()}
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
      {/* Footer note */}
      <div className="text-center text-sm text-muted-foreground py-6">
        Dữ liệu tạm thời - reset khi reload trang • Sẽ kết nối backend sau
      </div>
    </div>
  );
}
