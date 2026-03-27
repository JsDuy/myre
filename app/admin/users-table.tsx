"use client";

import { useEffect, useState, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

type User = {
  uid: string;
  email: string;
  displayName?: string;
  is_admin?: boolean;
  created_at?: string;
};

export default function UsersTable() {
  const { user, getIdToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getIdToken();
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Fetched users:", data);
      setUsers(data);
    } catch (error) {
      toast.error("Không thể tải danh sách users");
    } finally {
      setLoading(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userToDelete: User) => {
    // Không cho xóa chính mình
    if (userToDelete.uid === user?.uid) {
      toast.error("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }

    if (!confirm(`Xóa user ${userToDelete.email}?`)) return;

    setDeleting(userToDelete.uid);
    try {
      const token = await getIdToken();
      console.log("Deleting user:", userToDelete.uid);

      const res = await fetch(`/api/admin/users/${userToDelete.uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Delete response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("Delete response:", data);
        toast.success("Đã xóa user");
        // Force refresh dữ liệu
        await fetchUsers();
      } else {
        const error = await res.json();
        console.error("Delete error:", error);
        toast.error(error.detail || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Delete exception:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setDeleting(null);
    }
  };

  const handleSetAdmin = async (userToUpdate: User) => {
    try {
      const token = await getIdToken();
      console.log(
        "Setting admin for user:",
        userToUpdate.uid,
        "to",
        !userToUpdate.is_admin,
      );

      const res = await fetch(`/api/admin/users/${userToUpdate.uid}/admin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_admin: !userToUpdate.is_admin }),
      });

      console.log("Set admin response status:", res.status);

      if (res.ok) {
        toast.success(
          userToUpdate.is_admin ? "Đã gỡ quyền admin" : "Đã set quyền admin",
        );
        await fetchUsers();
      } else {
        const error = await res.json();
        console.error("Set admin error:", error);
        toast.error(error.detail || "Thay đổi thất bại");
      }
    } catch (error) {
      console.error("Set admin exception:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: "uid", header: "UID" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "displayName", header: "Tên hiển thị" },
    {
      accessorKey: "is_admin",
      header: "Vai trò",
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_admin") ? "default" : "secondary"}>
          {row.getValue("is_admin") ? "Admin" : "User"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const userItem = row.original;
        const isCurrentUser = userItem.uid === user?.uid;
        const isDeleting = deleting === userItem.uid;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isDeleting}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSetAdmin(userItem)}>
                <Shield className="mr-2 h-4 w-4" />
                {userItem.is_admin ? "Gỡ quyền Admin" : "Set làm Admin"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(userItem)}
                disabled={isCurrentUser || isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={users} loading={loading} />;
}
