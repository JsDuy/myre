"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

import UsersTable from "./users-table";
import DevicesTable from "./devices-table";

export default function AdminPage() {
  const { user, loading, getIdToken } = useAuth(); // Thêm getIdToken
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    user.getIdTokenResult().then((idTokenResult) => {
      if (idTokenResult.claims.admin === true) {
        setIsAdmin(true);
      } else {
        router.push("/");
      }
    });
  }, [user, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Đang kiểm tra quyền admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              🔧 Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Quản lý Users và Devices của toàn hệ thống
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Chỉ Admin mới truy cập được
          </Badge>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="users">Quản lý Users</TabsTrigger>
            <TabsTrigger value="devices">Quản lý Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Danh sách Users</CardTitle>
                <Button
                  onClick={() => {
                    /* Mở dialog thêm user */
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm User mới
                </Button>
              </CardHeader>
              <CardContent>
                <UsersTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Danh sách Devices</CardTitle>
                <Button
                  onClick={() => {
                    /* Mở dialog thêm device */
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm Device mới
                </Button>
              </CardHeader>
              <CardContent>
                <DevicesTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
