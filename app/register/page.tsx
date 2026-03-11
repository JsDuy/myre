// app/register/page.tsx

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/50">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Tạo tài khoản
          </CardTitle>
          <CardDescription className="text-base">
            Điền thông tin để bắt đầu
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Social signup placeholder */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="w-full gap-2">
              Google
            </Button>
            <Button variant="outline" className="w-full gap-2">
              GitHub
            </Button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Hoặc</span>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" placeholder="Nguyễn Văn A" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="example@email.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button className="w-full text-base py-6">Đăng ký</Button>

          <p className="text-center text-xs text-muted-foreground">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Điều khoản
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Chính sách bảo mật
            </Link>
            .
          </p>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm pt-2 border-t">
          <p className="text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
