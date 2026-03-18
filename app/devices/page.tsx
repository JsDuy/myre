"use client";

import { useDevice } from "@/providers/DeviceProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShieldCheck, UserPlus, Trash2, Share2 } from "lucide-react";

// Hàm gọi API (tương tự device_api.dart)
const BASE_URL = "http://192.168.1.102:8000"; // thay bằng env sau

async function registerDevice(
  deviceCode: string,
  deviceUid: string,
  deviceName: string,
) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${BASE_URL}/devices/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_code: deviceCode,
      device_uid: deviceUid,
      device_name: deviceName,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function shareDevice(deviceUid: string, targetEmail: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${BASE_URL}/devices/share`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ device_uid: deviceUid, target_email: targetEmail }),
  });
  if (!res.ok) throw new Error(await res.text());
}

// Trang Devices
export default function DevicesPage() {
  const { user, loading: authLoading } = useAuth();
  const { devices, selectedDevice, setSelectedDevice, loading } = useDevice();
  const router = useRouter();

  const [newCode, setNewCode] = useState("");
  const [newUid, setNewUid] = useState("");
  const [newName, setNewName] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [activeDevice, setActiveDevice] = useState<string | null>(null);

  if (authLoading || loading) return <div className="p-8">Đang tải...</div>;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Thiết bị của bạn</h1>

      <div className="flex justify-between mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Thêm thiết bị
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đăng ký thiết bị mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Device Code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
              <Input
                placeholder="Device UID"
                value={newUid}
                onChange={(e) => setNewUid(e.target.value)}
              />
              <Input
                placeholder="Tên thiết bị"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Button
                onClick={async () => {
                  try {
                    await registerDevice(newCode, newUid, newName);
                    toast.success("Đăng ký thiết bị thành công");
                    // listener realtime sẽ tự update
                  } catch (err: any) {
                    toast.error("Lỗi: " + err.message);
                  }
                }}
              >
                Đăng ký
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            Chưa có thiết bị nào. Thêm ngay!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((dev) => (
            <Card
              key={dev.id}
              className={
                selectedDevice?.id === dev.id ? "border-primary border-2" : ""
              }
            >
              <CardHeader>
                <CardTitle className="flex justify-between">
                  {dev.name}
                  <span className="text-sm text-muted-foreground">
                    {dev.role}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDevice(dev)}
                  >
                    Chọn thiết bị này
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Chia sẻ thiết bị</DialogTitle>
                      </DialogHeader>
                      <Input
                        placeholder="Email người nhận"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                      />
                      <Button
                        onClick={async () => {
                          try {
                            await shareDevice(dev.id, shareEmail);
                            toast.success("Đã chia sẻ");
                          } catch (err: any) {
                            toast.error(err.message);
                          }
                        }}
                      >
                        Chia sẻ
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
