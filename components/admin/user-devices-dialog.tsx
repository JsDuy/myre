// components/admin/user-devices-dialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Shield, Plus } from "lucide-react";
import { toast } from "sonner";

type DeviceAccess = {
  device_uid: string;
  device_name: string;
  role: string;
  owner_uid: string;
};

type UserDevicesDialogProps = {
  user: { uid: string; email: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
};

export function UserDevicesDialog({
  user,
  open,
  onOpenChange,
  token,
}: UserDevicesDialogProps) {
  const [devices, setDevices] = useState<DeviceAccess[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allDevices, setAllDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedRole, setSelectedRole] = useState("viewer");

  const fetchUserDevices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.uid}/devices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDevices(data);
    } catch (error) {
      toast.error("Không thể tải danh sách devices");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDevices = async () => {
    try {
      const res = await fetch("/api/admin/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllDevices(data);
    } catch (error) {
      toast.error("Không thể tải danh sách devices");
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchUserDevices();
      fetchAllDevices();
    }
  }, [open, user]);

  const handleRevoke = async (deviceUid: string) => {
    if (!confirm("Gỡ quyền truy cập device này?")) return;

    try {
      const res = await fetch(
        `/api/admin/users/${user?.uid}/devices/${deviceUid}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        toast.success("Đã gỡ quyền truy cập");
        fetchUserDevices();
      } else {
        toast.error("Gỡ quyền thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleUpdateRole = async (deviceUid: string, newRole: string) => {
    try {
      const res = await fetch(
        `/api/admin/users/${user?.uid}/devices/${deviceUid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (res.ok) {
        toast.success("Đã cập nhật role");
        fetchUserDevices();
      } else {
        toast.error("Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleAddDevice = async () => {
    if (!selectedDevice) {
      toast.error("Vui lòng chọn device");
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/users/${user?.uid}/devices/${selectedDevice}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: selectedRole }),
        },
      );

      if (res.ok) {
        toast.success("Đã thêm quyền truy cập");
        setShowAddDevice(false);
        setSelectedDevice("");
        fetchUserDevices();
      } else {
        const error = await res.json();
        toast.error(error.detail || "Thêm thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  // Lọc devices chưa được cấp quyền
  const availableDevices = allDevices.filter(
    (d) => !devices.some((ud) => ud.device_uid === d.device_uid),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quản lý devices - {user?.email}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Devices được phép truy cập</h3>
            <Button size="sm" onClick={() => setShowAddDevice(!showAddDevice)}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm device
            </Button>
          </div>

          {showAddDevice && (
            <div className="border rounded-lg p-4 space-y-3">
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn device" />
                </SelectTrigger>
                <SelectContent>
                  {availableDevices.map((device) => (
                    <SelectItem
                      key={device.device_uid}
                      value={device.device_uid}
                    >
                      {device.name} ({device.device_uid})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer (chỉ xem)</SelectItem>
                  <SelectItem value="editor">
                    Editor (xem và chỉnh sửa)
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddDevice(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleAddDevice}>Thêm</Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              User chưa được cấp quyền device nào
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <div
                  key={device.device_uid}
                  className="border rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{device.device_name}</div>
                    <div className="text-sm text-gray-500">
                      {device.device_uid}
                    </div>
                    {device.owner_uid === user?.uid && (
                      <Badge variant="default" className="mt-1">
                        Owner
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {device.owner_uid !== user?.uid && (
                      <Select
                        value={device.role}
                        onValueChange={(val) =>
                          handleUpdateRole(device.device_uid, val)
                        }
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {device.owner_uid !== user?.uid && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleRevoke(device.device_uid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
