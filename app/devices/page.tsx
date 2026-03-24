"use client";

import { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { devicesRef } from "@/lib/firebase-devices-ref";
import { useDevice } from "@/providers/DeviceProvider";
import { useNavigation } from "@/context/navigation-context";
import { toast } from "sonner";

import { Plus, Share2, Users, Trash2, ArrowRight, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import SharedMembersDialog from "@/components/SharedMembersDialog";

const BASE_URL = "http://192.168.163.253:8000";

const DeviceApi = {
  async registerDevice(
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
  },

  async shareDevice(deviceUid: string, targetEmail: string) {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${BASE_URL}/devices/share`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_uid: deviceUid,
        target_email: targetEmail,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  async revokeDevice(
    deviceUid: string,
    targetUserUid: string,
    targetEmail: string,
  ) {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${BASE_URL}/devices/revoke`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_uid: deviceUid,
        target_user_uid: targetUserUid,
        target_email: targetEmail,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  async getDeviceMembers(deviceUid: string) {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${BASE_URL}/devices/${deviceUid}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export default function DevicesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho SharedMembersDialog
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedDeviceForMembers, setSelectedDeviceForMembers] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { selectDevice } = useDevice();
  const { setIndex } = useNavigation();
  const user = auth.currentUser;

  // Lấy danh sách thiết bị realtime từ Firebase
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onValue(devicesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setDevices([]);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = snapshot.val() as Record<string, any>;
        const list = Object.entries(data).map(([id, dev]) => ({
          id,
          ...dev,
        }));
        setDevices(list);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // ==================== THÊM THIẾT BỊ ====================
  const handleAddDevice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const deviceId = (
      form.elements.namedItem("deviceId") as HTMLInputElement
    ).value.trim();
    const deviceName =
      (
        form.elements.namedItem("deviceName") as HTMLInputElement
      ).value.trim() || `Thiết bị ${deviceId}`;

    if (!deviceId) return;

    try {
      await DeviceApi.registerDevice(deviceId, deviceId, deviceName);
      toast.success("✅ Thêm thiết bị thành công!");
      form.reset();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("❌ Lỗi thêm thiết bị", { description: err.message });
    }
  };

  // ==================== CHIA SẺ THIẾT BỊ ====================
  const handleShareDevice = async (deviceId: string, email: string) => {
    if (!email) return;
    try {
      await DeviceApi.shareDevice(deviceId, email.toLowerCase().trim());
      toast.success("✅ Đã gửi yêu cầu chia sẻ thiết bị");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("❌ Lỗi chia sẻ thiết bị", { description: err.message });
    }
  };

  // ==================== XÓA THIẾT BỊ (Viewer) ====================
  const handleRemoveDevice = async (deviceId: string, deviceName: string) => {
    if (!confirm(`Ngừng theo dõi thiết bị "${deviceName}"?`)) return;

    try {
      const deviceRef = ref(db, `users/${user?.uid}/devices/${deviceId}`);
      await remove(deviceRef);
      toast.success("Đã ngừng theo dõi thiết bị");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("Lỗi khi xóa thiết bị", { description: err.message });
    }
  };

  // Mở dialog quản lý người được chia sẻ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openMembersDialog = (dev: any) => {
    setSelectedDeviceForMembers({
      id: dev.id,
      name: dev.nickname || `Thiết bị ${dev.id}`,
    });
    setMembersDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="p-10 text-center">
        Vui lòng đăng nhập để xem danh sách thiết bị
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Thiết bị của bạn</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Thêm thiết bị
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm thiết bị mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <Label>Device ID</Label>
                <Input
                  name="deviceId"
                  placeholder="Nhập mã thiết bị"
                  required
                />
              </div>
              <div>
                <Label>Tên thiết bị (tùy chọn)</Label>
                <Input
                  name="deviceName"
                  placeholder="Ví dụ: Thiết bị phòng ngủ"
                />
              </div>
              <Button type="submit" className="w-full">
                Thêm thiết bị
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-muted-foreground">
              Đang tải danh sách thiết bị...
            </p>
          </div>
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Chưa có thiết bị nào.
          <br />
          Nhấn nút `+` để thêm thiết bị đầu tiên.
        </div>
      ) : (
        <div className="grid gap-4">
          {devices.map((dev) => {
            const isOwner = dev.role === "owner";
            const deviceName = dev.nickname || `Thiết bị ${dev.id}`;

            return (
              <Card key={dev.id} className="overflow-hidden">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Server className="h-10 w-10 text-blue-600" />
                    <div>
                      <p className="font-semibold text-lg">{deviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {dev.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <>
                        {/* Chia sẻ nhanh */}
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
                              id={`share-input-${dev.id}`}
                              placeholder="Nhập email người nhận"
                            />
                            <Button
                              onClick={() => {
                                const input = document.getElementById(
                                  `share-input-${dev.id}`,
                                ) as HTMLInputElement;
                                if (input)
                                  handleShareDevice(dev.id, input.value);
                              }}
                            >
                              Chia sẻ
                            </Button>
                          </DialogContent>
                        </Dialog>

                        {/* Quản lý người được chia sẻ */}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openMembersDialog(dev)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {!isOwner && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveDevice(dev.id, deviceName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Vào theo dõi thiết bị */}
                    <Button
                      onClick={() => {
                        selectDevice(dev.id, deviceName);
                        setIndex(0);
                        window.location.href = "/monitor";
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog quản lý thành viên */}
      {selectedDeviceForMembers && (
        <SharedMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          deviceId={selectedDeviceForMembers.id}
          deviceName={selectedDeviceForMembers.name}
        />
      )}
    </div>
  );
}
