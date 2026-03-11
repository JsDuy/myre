// app/login/page.tsx

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
import { Checkbox } from "../../components/ui/checkbox";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/50">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-base">
            Nhập thông tin để tiếp tục
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Social login placeholder */}
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="example@email.com" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Nhớ đăng nhập
              </Label>
            </div>
          </div>

          <Button className="w-full text-base py-6">Đăng nhập</Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-sm pt-2 border-t">
          <p className="text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
