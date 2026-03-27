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
  const { user, getIdToken } = useAuth(); // Thêm useAuth
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getIdToken();

      const res = await fetch("/api/admin/devices", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data: Device[] = await res.json();
      setDevices(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

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
        const error = await res.json();
        toast.error(error.detail || "Xóa thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa");
    }
  };

  const columns: ColumnDef<Device>[] = [
    {
      accessorKey: "device_uid",
      header: "Device UID",
    },
    {
      accessorKey: "name",
      header: "Tên thiết bị",
    },
    {
      accessorKey: "type",
      header: "Loại",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("type") || "Không xác định"}
        </Badge>
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
      header: "Số thành viên",
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
              <DropdownMenuItem
                onClick={() =>
                  toast.info("Chức năng chỉnh sửa device đang phát triển")
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
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

  return <DataTable columns={columns} data={devices} loading={loading} />;
}
