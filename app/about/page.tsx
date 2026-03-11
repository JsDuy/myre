// app/about/page.tsx

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      {/* Hero section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Về Chúng Tôi
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Chúng tôi là đội ngũ đam mê xây dựng các sản phẩm công nghệ giúp cuộc
          sống dễ dàng hơn.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Card className="border-primary/20 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Sứ mệnh</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Mang đến những giải pháp phần mềm hiện đại, thân thiện và hiệu quả
              cho cá nhân cũng như doanh nghiệp tại Việt Nam và khu vực.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle>Tầm nhìn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Trở thành công ty công nghệ hàng đầu khu vực Đông Nam Á vào năm
              2030, với trọng tâm là sáng tạo và trải nghiệm người dùng.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-16" />

      {/* Team section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-8">Đội ngũ của chúng tôi</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Nguyễn Văn A",
              role: "Founder & CEO",
              avatar: "/avatars/avatar1.png",
            },
            {
              name: "Trần Thị B",
              role: "Lead Developer",
              avatar: "/avatars/avatar2.png",
            },
            {
              name: "Lê Văn C",
              role: "UI/UX Designer",
              avatar: "/avatars/avatar3.png",
            },
          ].map((member) => (
            <div key={member.name} className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Button size="lg" asChild>
          <a href="/contact">Liên hệ với chúng tôi</a>
        </Button>
      </div>
    </div>
  );
}
