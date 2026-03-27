// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Hàm đồng bộ user với backend
  const syncUserToBackend = async (
    uid: string,
    email: string,
    displayName: string,
  ) => {
    try {
      const response = await fetch(`${FASTAPI_URL}/auth/sync-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          email: email,
          display_name: displayName,
        }),
      });

      if (!response.ok) {
        console.error("Failed to sync user to backend:", await response.text());
      }
    } catch (error) {
      console.error("Error syncing user to backend:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length === 0) {
      toast.error("Lỗi", {
        description: "Vui lòng nhập tên người dùng.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Lỗi", {
        description: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    if (password.length < 6) {
      toast.error("Lỗi", {
        description: "Mật khẩu phải ít nhất 6 ký tự.",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Tạo user trên Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Cập nhật display name
      await updateProfile(user, { displayName: name });

      // 3. Tạo cấu trúc trên Firebase Realtime Database
      const emailKey = email.replace(/\./g, ",");

      // 🔥 Tạo email_to_uid mapping
      await set(ref(db, `email_to_uid/${emailKey}`), user.uid);

      // 🔥 Tạo user profile
      await set(ref(db, `users/${user.uid}/profile`), {
        email: email,
        name: name,
        createdAt: Date.now(),
      });

      // 🔥 Tạo devices node (trống)
      await set(ref(db, `users/${user.uid}/devices`), {});

      // 🔥 Tạo alert_history (nếu cần)
      await set(ref(db, `users/${user.uid}/alert_history`), {});

      // 4. Đồng bộ với PostgreSQL backend
      await syncUserToBackend(user.uid, email, name);

      toast.success("Thành công", {
        description: "Đăng ký thành công! Đang chuyển hướng...",
      });

      router.push("/login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let message = "Đăng ký thất bại. Vui lòng thử lại.";
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "Email này đã được sử dụng.";
          break;
        case "auth/invalid-email":
          message = "Email không hợp lệ.";
          break;
        case "auth/weak-password":
          message = "Mật khẩu quá yếu (ít nhất 6 ký tự).";
          break;
        case "auth/operation-not-allowed":
          message = "Tính năng đăng ký chưa được kích hoạt trong Firebase.";
          break;
      }
      toast.error("Lỗi đăng ký", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
          <CardDescription>
            Tạo tài khoản để theo dõi sức khỏe realtime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên người dùng</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <a href="/login" className="text-primary hover:underline">
              Đăng nhập
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
