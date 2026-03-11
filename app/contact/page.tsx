// app/contact/page.tsx

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Liên hệ với chúng tôi
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy gửi tin nhắn cho
          chúng tôi!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Form liên hệ */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Gửi tin nhắn</CardTitle>
            <CardDescription>
              Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng 24h.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" placeholder="Nguyễn Văn A" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="example@email.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Tiêu đề</Label>
              <Input id="subject" placeholder="Hỏi về dịch vụ..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Tin nhắn</Label>
              <Textarea
                id="message"
                placeholder="Nội dung bạn muốn gửi..."
                rows={6}
              />
            </div>

            <Button className="w-full">Gửi tin nhắn</Button>
          </CardContent>
        </Card>

        {/* Thông tin liên hệ */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Địa chỉ</h3>
                  <p className="text-muted-foreground">
                    123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Điện thoại</h3>
                  <p className="text-muted-foreground">+84 123 456 789</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">contact@myapp.vn</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-2xl font-bold mb-6">Giờ làm việc</h2>
            <p className="text-muted-foreground">
              Thứ 2 - Thứ 6: 8:00 - 17:30
              <br />
              Thứ 7: 9:00 - 12:00
              <br />
              Chủ nhật: Nghỉ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
