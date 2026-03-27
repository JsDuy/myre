"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Menu,
  LogOut,
  Heart,
  Activity,
  Home,
  History,
  Bell,
  Smartphone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useDevice } from "@/providers/DeviceProvider";
import { useAuth } from "@/providers/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const { selectedDevice } = useDevice();
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    {
      label: "Trang chủ",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      label: "Theo dõi sức khỏe",
      href: "/monitor",
      icon: Activity,
      active: pathname === "/monitor",
    },
    {
      label: "Lịch sử cảnh báo",
      href: selectedDevice
        ? `/alertHistory/${selectedDevice.id}`
        : "/alertHistory",
      icon: Bell,
      active: pathname?.startsWith("/alertHistory"),
    },
    {
      label: "Lịch sử đo",
      href: selectedDevice ? `/history/${selectedDevice.id}` : "/history",
      icon: History,
      active: pathname?.startsWith("/history"),
    },
    {
      label: "Danh sách thiết bị",
      href: "/devices",
      icon: Smartphone,
      active: pathname === "/devices",
    },
    {
      label: "Tài khoản",
      href: "/account",
      icon: User,
      active: pathname === "/account",
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 b dark:bg-black/75 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto flex h-16 w-[90%] items-center justify-between px-4">
        {/* Logo và tên app */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
            <Image
              src="/img/logo.png"
              alt="Logo"
              width={52}
              height={52}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-300 to-blue-800 bg-clip-text text-transparent">
              HealthWatch
            </span>
            <span className="text-xs text-gray-500 -mt-1">
              IoT Health Monitor
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  item.active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon
                  className={cn("h-4 w-4", item.active && "text-blue-600")}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-700">
                  {user.email?.split("@")[0]}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2 border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild className="hover:bg-gray-100">
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
              >
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                    <Image
                      src="/img/logo.png"
                      alt="Logo"
                      width={52}
                      height={52}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <SheetTitle className="text-left text-lg">
                      HealthWatch
                    </SheetTitle>
                    <p className="text-xs text-gray-500">IoT Health Monitor</p>
                  </div>
                </div>
              </SheetHeader>

              <nav className="flex-1 flex flex-col p-4 gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        item.active
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t">
                {user ? (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 justify-center border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/login">Đăng nhập</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                    >
                      <Link href="/register">Đăng ký</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
