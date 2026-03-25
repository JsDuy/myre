"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import Link from "next/link";
import { useDevice } from "@/providers/DeviceProvider";
import { useAuth } from "@/providers/AuthProvider"; // ← Import thêm
import { signOut } from "firebase/auth"; // ← Import signOut
import { auth } from "@/lib/firebase"; // ← Import auth từ firebase config

export function Header() {
  const { selectedDevice } = useDevice();
  const { user } = useAuth(); // ← Lấy user từ AuthContext

  const navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Về chúng tôi", href: "/about" },
    { label: "Liên hệ", href: "/contact" },
    { label: "Theo dõi sức khỏe", href: "/monitor" },
    {
      label: "Lịch sử cảnh báo",
      href: selectedDevice
        ? `/alertHistory/${selectedDevice.id}`
        : "/alertHistory",
    },
    {
      label: "Lịch sử đo",
      href: selectedDevice ? `/history/${selectedDevice.id}` : "/history",
    },
    { label: "Danh sách thiết bị", href: "/devices" },
  ];

  // Hàm đăng xuất
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Sau khi logout, Firebase Auth sẽ tự update user = null qua onAuthStateChanged
      // Bạn có thể thêm toast thông báo nếu muốn
      // toast.success("Đã đăng xuất thành công");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 font-bold text-xl"
        >
          <span className="text-primary">MyApp</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons - PHẦN ĐÃ SỬA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            // Đã đăng nhập → hiện nút Đăng xuất
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          ) : (
            // Chưa đăng nhập → hiện 2 nút cũ
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu - cũng cần sửa tương tự */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Mở menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle></SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-6 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex flex-col gap-4 mt-6">
                {user ? (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="flex items-center gap-2 justify-center"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/login">Đăng nhập</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Đăng ký</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
