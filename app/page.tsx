import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Chào Duy! Next.js + shadcn/ui đã sẵn sàng 🚀
          </h1>
          <p className="text-xl text-muted-foreground">
            Stack 2026: App Router + Tailwind v4 + shadcn components
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle>Button đẹp</CardTitle>
              <CardDescription>Nhấn thử xem</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button size="lg">Click me!</Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle>Dark mode sẵn</CardTitle>
              <CardDescription>Thử chuyển theme browser</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle>Thêm component dễ</CardTitle>
              <CardDescription>npx shadcn@latest add [tên]</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button variant="ghost" asChild>
                <a href="https://ui.shadcn.com/docs/components" target="_blank">
                  Xem tất cả components
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
