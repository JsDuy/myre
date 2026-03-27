"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Device = {
  id: number;
  device_uid: string;
  name: string;
  type?: string;
  status: "online" | "offline";
  owner_uid?: string;
  created_at?: string;
  member_count?: number;
};

export default function DevicesTable() {
  const { user, getIdToken } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog Edit
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("");

  const fetchDevices = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await getIdToken();
      const res = await fetch("/api/admin/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();
      const data: Device[] = await res.json();
      setDevices(data);
    } catch {
      toast.error("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  // Mở dialog sửa
  const openEdit = (device: Device) => {
    setEditingDevice(device);
    setNewName(device.name);
    setNewType(device.type || "");
    setEditDialogOpen(true);
  };

  // Xử lý sửa thiết bị
  const handleUpdate = async () => {
    if (!editingDevice) return;

    try {
      const token = await getIdToken();
      const res = await fetch(
        `/api/admin/devices/${editingDevice.device_uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newName.trim(),
            type: newType.trim() || undefined,
          }),
        },
      );

      if (res.ok) {
        toast.success("Cập nhật thiết bị thành công!");
        setEditDialogOpen(false);
        fetchDevices(); // Refresh bảng
      } else {
        const err = await res.json();
        toast.error(err.detail || "Cập nhật thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi cập nhật");
    }
  };

  // Xóa thiết bị
  const handleDelete = async (device: Device) => {
    if (!confirm(`Bạn chắc chắn muốn xóa thiết bị "${device.name}"?`)) return;

    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/devices/${device.device_uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success(`Đã xóa thiết bị ${device.name}`);
        fetchDevices();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Xóa thất bại");
      }
    } catch {
      toast.error("Lỗi khi xóa thiết bị");
    }
  };

  const columns: ColumnDef<Device>[] = [
    { accessorKey: "device_uid", header: "Device UID" },
    { accessorKey: "name", header: "Tên thiết bị" },
    {
      accessorKey: "type",
      header: "Loại",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("type") || "—"}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "online" ? "default" : "secondary"}>
            {status === "online" ? "🟢 Online" : "⚫ Offline"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "member_count",
      header: "Thành viên",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {row.getValue("member_count") || 1}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const device = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(device)}>
                <Edit className="mr-2 h-4 w-4" />
                Sửa thông tin
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => handleDelete(device)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa thiết bị
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={devices} loading={loading} />

      {/* Dialog Sửa Thiết Bị */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sửa thông tin thiết bị</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Device UID (không thay đổi)</Label>
              <Input value={editingDevice?.device_uid || ""} disabled />
            </div>
            <div>
              <Label htmlFor="name">Tên thiết bị</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nhập tên mới"
              />
            </div>
            <div>
              <Label htmlFor="type">Loại thiết bị</Label>
              <Input
                id="type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="Ví dụ: Wearable, IoT Sensor, ..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
