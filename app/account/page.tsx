// app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  deleteUser,
  signOut,
} from "firebase/auth";
import { ref, get, set, update } from "firebase/database"; // 👈 Sửa import

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, LogOut, Trash2, User, Key, Bell, Moon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
export default function AccountPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal đổi mật khẩu
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Alert xóa tài khoản
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      setDisplayName(currentUser.displayName || "");

      // Load cài đặt thông báo từ Realtime Database
      try {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setNotifications(userData.notifications !== false);
        }
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName });
      alert("✅ Đã lưu thông tin tài khoản!");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleCopyToken = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken(); // Lấy Firebase ID Token
      await navigator.clipboard.writeText(token);

      setCopied(true);
      toast.success("✅ Đã copy Token vào clipboard!"); // Dùng sonner toast (nếu có)

      // Reset icon sau 2 giây
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Không thể copy token. Vui lòng thử lại!");
    }
  };
  const handleNotificationsChange = async (checked: boolean) => {
    if (!user) return;
    setNotifications(checked);
    try {
      // Sử dụng update để chỉ cập nhật trường notifications
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, { notifications: checked });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      alert("Mật khẩu phải ít nhất 6 ký tự!");
      return;
    }
    setChangingPassword(true);
    try {
      await updatePassword(user, newPassword);
      alert("✅ Đổi mật khẩu thành công!");
      setShowPasswordModal(false);
      setNewPassword("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      await signOut(auth);
      router.push("/login");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Xóa dữ liệu trong Realtime Database trước
      const userRef = ref(db, `users/${user.uid}`);
      await set(userRef, null); // Xóa dữ liệu user trong database
      await deleteUser(user); // Sau đó xóa user từ Authentication
      alert("✅ Tài khoản đã được xóa vĩnh viễn.");
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        alert("Vui lòng đăng nhập lại trước khi xóa tài khoản!");
      } else {
        alert("Lỗi: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-10">
          <User className="w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-tight">Tài khoản</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thông tin cá nhân */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Cập nhật tên và ảnh đại diện của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <Avatar className="w-28 h-28">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback className="text-4xl">
                      {displayName ? displayName[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Tên hiển thị</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Nhập tên của bạn"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user?.email || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uid">UID</Label>
                      <Input
                        id="uid"
                        value={user?.uid || ""}
                        disabled
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={handleCopyToken}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Đã copy Token" : "Copy Firebase Token"}
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cài đặt */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Cài đặt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Chế độ tối</p>
                    <p className="text-sm text-muted-foreground">
                      Tự động theo hệ thống
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <Separator />

              {/* Thông báo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Nhận thông báo</p>
                  </div>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={handleNotificationsChange}
                />
              </div>

              <Separator />

              {/* Đổi mật khẩu */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => setShowPasswordModal(true)}
              >
                <Key className="w-4 h-4" />
                Đổi mật khẩu
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Hành động nguy hiểm */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-3"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="flex-1 gap-3"
            onClick={() => setShowDeleteAlert(true)}
          >
            <Trash2 className="w-5 h-5" />
            Xóa tài khoản vĩnh viễn
          </Button>
        </div>
      </div>

      {/* Dialog đổi mật khẩu */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu mới (ít nhất 6 ký tự)
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert xóa tài khoản */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bạn chắc chắn muốn xóa tài khoản?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Toàn bộ dữ liệu của bạn sẽ bị
              xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
