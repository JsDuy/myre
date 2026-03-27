"use client";

import { useState, useEffect } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { userDevicesRef } from "@/lib/firebase-devices-ref";
import { useDevice } from "@/providers/DeviceProvider";
import { useNavigation } from "@/context/navigation-context";
import { toast } from "sonner";

import {
  Plus,
  Share2,
  Users,
  Trash2,
  ArrowRight,
  Server,
  Edit,
  Smartphone,
  Wifi,
  WifiOff,
  MoreVertical,
  Crown,
  User,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import SharedMembersDialog from "@/components/SharedMembersDialog";
import { useTheme } from "next-themes";

const BASE_URL = "http://192.168.199.253:8000";

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
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedDeviceForMembers, setSelectedDeviceForMembers] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedDeviceForEdit, setSelectedDeviceForEdit] = useState<any>(null);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});

  const { selectDevice } = useDevice();
  const { setIndex } = useNavigation();
  const user = auth.currentUser;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Lấy danh sách thiết bị
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    setLoading(true);
    const deviceListRef = userDevicesRef(user.uid);

    const unsub = onValue(deviceListRef, (snapshot) => {
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

        // Kiểm tra online status cho từng device
        list.forEach((device) => {
          const healthRef = ref(db, `devices/${device.id}/health_data/latest`);
          onValue(healthRef, (healthSnapshot) => {
            setOnlineStatus((prev) => ({
              ...prev,
              [device.id]: healthSnapshot.exists(),
            }));
          });
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

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

  const handleUpdateDeviceName = async () => {
    if (!selectedDeviceForEdit || !newDeviceName.trim() || !user) return;

    try {
      const deviceRef = ref(
        db,
        `users/${user.uid}/devices/${selectedDeviceForEdit.id}`,
      );
      await update(deviceRef, { nickname: newDeviceName.trim() });
      toast.success("✅ Cập nhật tên thiết bị thành công!");
      setEditDialogOpen(false);
      setSelectedDeviceForEdit(null);
      setNewDeviceName("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error("❌ Lỗi cập nhật tên thiết bị", { description: err.message });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openMembersDialog = (dev: any) => {
    setSelectedDeviceForMembers({
      id: dev.id,
      name: dev.nickname || `Thiết bị ${dev.id}`,
    });
    setMembersDialogOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditDialog = (dev: any) => {
    setSelectedDeviceForEdit(dev);
    setNewDeviceName(dev.nickname || "");
    setEditDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 lg:mx-20">
        <Card className="p-12 text-center shadow-lg dark:bg-slate-800">
          <Smartphone className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Vui lòng đăng nhập để xem danh sách thiết bị
          </p>
          <Button asChild className="mt-6">
            <a href="/login">Đăng nhập ngay</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 lg:mx-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Badge
              variant="outline"
              className="mb-2 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              <Smartphone className="h-3 w-3 mr-1" />
              Quản lý thiết bị
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Thiết bị của bạn
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {devices.length} thiết bị đang được kết nối
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                <Plus className="h-5 w-5" />
                Thêm thiết bị
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="dark:text-slate-100">
                  Thêm thiết bị mới
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDevice} className="space-y-4">
                <div>
                  <Label className="dark:text-slate-300">Device ID</Label>
                  <Input
                    name="deviceId"
                    placeholder="Nhập mã thiết bị"
                    required
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
                <div>
                  <Label className="dark:text-slate-300">
                    Tên thiết bị (tùy chọn)
                  </Label>
                  <Input
                    name="deviceName"
                    placeholder="Ví dụ: Thiết bị phòng ngủ"
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Thêm thiết bị
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Device List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Đang tải danh sách thiết bị...
              </p>
            </div>
          </div>
        ) : devices.length === 0 ? (
          <Card className="p-16 text-center shadow-lg dark:bg-slate-800">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-700 mb-4">
              <Smartphone className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Chưa có thiết bị nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Nhấn nút &quot;+&quot; để thêm thiết bị đầu tiên của bạn
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm thiết bị ngay
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
          </Card>
        ) : (
          <div className="grid gap-4">
            {devices.map((dev) => {
              const isOwner = dev.role === "owner";
              const deviceName = dev.nickname || `Thiết bị ${dev.id}`;
              const isOnline = onlineStatus[dev.id];

              return (
                <Card
                  key={dev.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 dark:bg-slate-800 dark:border-slate-700"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Device Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              isOwner
                                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                : "bg-gradient-to-br from-purple-500 to-purple-600"
                            }`}
                          >
                            <Server className="h-6 w-6 text-white" />
                          </div>
                          {isOwner && (
                            <div className="absolute -top-1 -right-1">
                              <Crown className="h-4 w-4 text-yellow-500" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-lg text-gray-800 dark:text-slate-200">
                              {deviceName}
                            </p>
                            {isOnline ? (
                              <Badge
                                variant="outline"
                                className="gap-1 text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 dark:text-green-400"
                              >
                                <Wifi className="h-3 w-3" />
                                Online
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="gap-1 text-gray-500 border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                              >
                                <WifiOff className="h-3 w-3" />
                                Offline
                              </Badge>
                            )}
                            {isOwner && (
                              <Badge
                                variant="secondary"
                                className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              >
                                <Crown className="h-3 w-3" />
                                Chủ sở hữu
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ID: {dev.id}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {isOwner && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 dark:border-slate-600"
                                >
                                  <Share2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">
                                    Chia sẻ
                                  </span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="dark:bg-slate-800">
                                <DialogHeader>
                                  <DialogTitle>Chia sẻ thiết bị</DialogTitle>
                                </DialogHeader>
                                <Input
                                  id={`share-input-${dev.id}`}
                                  placeholder="Nhập email người nhận"
                                  className="dark:bg-slate-700"
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

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openMembersDialog(dev)}
                              className="gap-2 dark:border-slate-600"
                            >
                              <Users className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                Thành viên
                              </span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(dev)}
                              className="gap-2 dark:border-slate-600"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline">Sửa</span>
                            </Button>
                          </>
                        )}

                        {!isOwner && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleRemoveDevice(dev.id, deviceName)
                            }
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              Ngừng theo dõi
                            </span>
                          </Button>
                        )}

                        <Button
                          onClick={() => {
                            selectDevice(dev.id, deviceName);
                            setIndex(0);
                            window.location.href = "/monitor";
                          }}
                          className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          <ArrowRight className="h-4 w-4" />
                          <span className="hidden sm:inline">Theo dõi</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Shared Members Dialog */}
      {selectedDeviceForMembers && (
        <SharedMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          deviceId={selectedDeviceForMembers.id}
          deviceName={selectedDeviceForMembers.name}
        />
      )}

      {/* Edit Device Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">
              Chỉnh sửa thông tin thiết bị
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="dark:text-slate-300">Tên thiết bị mới</Label>
              <Input
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="Nhập tên thiết bị mới"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
            <Button onClick={handleUpdateDeviceName} className="w-full">
              Lưu thay đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
