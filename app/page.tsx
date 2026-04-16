"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Activity,
  Smartphone,
  Shield,
  TrendingUp,
  Users,
  GraduationCap,
  Award,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hiệu ứng 3D background với Three.js
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initThree = async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      // Tạo các hình khối 3D
      const geometry = new THREE.IcosahedronGeometry(1, 0);
      const material = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x1e40af,
        emissiveIntensity: 0.2,
      });

      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      // Thêm các particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 1000;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 10;
        posArray[i + 1] = (Math.random() - 0.5) * 10;
        posArray[i + 2] = (Math.random() - 0.5) * 10;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3),
      );
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.6,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Thêm ánh sáng
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 2, 3);
      scene.add(directionalLight);

      const backLight = new THREE.PointLight(0x3b82f6, 0.5);
      backLight.position.set(0, 0, -2);
      scene.add(backLight);

      camera.position.z = 3;

      let mouseX = 0;
      let mouseY = 0;

      document.addEventListener("mousemove", (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      });

      // Animation
      const animate = () => {
        requestAnimationFrame(animate);

        cube.rotation.x += 0.005;
        cube.rotation.y += 0.008;
        cube.rotation.z += 0.003;

        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.0005;

        cube.position.x = mouseX * 0.3;
        cube.position.y = -mouseY * 0.3;

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
      };
    };

    initThree();
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Theo dõi sức khỏe realtime",
      description:
        "Cập nhật liên tục các chỉ số sức khỏe như nhịp tim, huyết áp, nhiệt độ cơ thể.",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Activity,
      title: "Cảnh báo thông minh",
      description:
        "Phát hiện bất thường và gửi cảnh báo kịp thời đến người dùng và người thân.",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: Smartphone,
      title: "Đa nền tảng",
      description:
        "Hỗ trợ cả Web và Mobile App, đồng bộ dữ liệu liên tục qua Firebase.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Shield,
      title: "Bảo mật cao",
      description:
        "Dữ liệu được mã hóa và bảo vệ, chỉ người dùng được ủy quyền mới có thể truy cập.",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: TrendingUp,
      title: "Phân tích dữ liệu",
      description:
        "Biểu đồ trực quan, lịch sử đo lường chi tiết giúp theo dõi xu hướng sức khỏe.",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: Users,
      title: "Chia sẻ gia đình",
      description:
        "Chia sẻ dữ liệu với người thân, cùng nhau chăm sóc sức khỏe.",
      color: "text-pink-500",
      bgColor: "bg-pink-50",
    },
  ];

  const team = {
    members: [
      {
        name: "Lìu Gia Luân",
        role: "Trưởng nhóm - IoT Developer - Project Management",
        avatar: "img/a.png",
      },
      {
        name: "Lê Phượng Linh",
        role: "Backend Developer - Ux/Ui Design - Make Reports",
        avatar: "img/b.png",
      },
      {
        name: "Lê Phượng Lành",
        role: "App Mobile Developer - Data Analysis - Tester",
        avatar: "img/c.png",
      },
      {
        name: "Nguyễn Hải Duy",
        role: "Web Developer - Presenter - Project Analysis",
        avatar: "img/d.png",
      },
    ],
    groupPhoto: "img/team-photo.jpg", // Thay bằng ảnh nhóm thực tế
  };

  const advisors = [
    {
      name: "Ts. Nguyễn Thành Trung",
      title: "Giảng viên hướng dẫn",
      department: "Khoa Công nghệ Thông tin - Truyền thông",
    },
  ];

  return (
    <>
      {/* Canvas 3D Background */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      <main className="relative">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <Badge className="animate-pulse bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-4 py-1 text-sm">
              Đồ án tốt nghiệp 2026
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                HealthSmart IoT
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Hệ thống giám sát sức khỏe thông minh, kết nối IoT <br /> và lưu
              trữ dữ liệu offline
              <br />
              <span className="text-blue-600 font-medium">
                Chăm sóc sức khỏe mọi lúc, mọi nơi
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/register">
                  Bắt đầu ngay
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="px-8 py-6 text-lg border-2"
              >
                <Link href="/monitor">
                  Xem demo
                  <Sparkles className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="pt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>100+ thiết bị đang kết nối</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>24/7 giám sát liên tục</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>99.9% độ chính xác</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-white/80 dark:bg-black/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Tính năng nổi bật
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Giải pháp toàn diện cho sức khỏe
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                HealthSmart IoT mang đến trải nghiệm theo dõi sức khỏe chuyên
                nghiệp với công nghệ tiên tiến
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
                  >
                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-blue-50/50 to-white dark:from-black/30 dark:to-black/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                Đội ngũ phát triển
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Nhóm thực hiện</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Đồ án được thực hiện bởi 4 thành viên nhiệt huyết dưới sự hướng
                dẫn của các thầy cô
              </p>
            </div>

            {/* Group Photo */}
            <div className="mb-12 flex justify-center">
              <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl group">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Users className="h-20 w-20 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600">Ảnh nhóm tại đây</p>
                    <p className="text-sm text-gray-500 mt-2">
                      <Image
                        src="/img/team-photo.jpg"
                        alt="Ảnh nhóm HealthSmart  IoT"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 768px"
                        priority
                      />
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-lg font-medium">
                    Cuộc thi &quot;IT Got Talent&quot; tại trường Hutech năm
                    2024
                  </p>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {team.members.map((member, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-xl transition-all border-0 shadow-md"
                >
                  <CardContent className="pt-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-blue-100">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Advisors Section */}
        <section className="py-20 px-6 bg-white dark:bg-black/40 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <GraduationCap className="h-12 w-12 text-blue-600 mx-auto" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Sự hướng dẫn tận tâm
              </h2>
              <p className="text-gray-600">
                Chúng em xin gửi lời tri ân sâu sắc đến các thầy đã hướng dẫn và
                hỗ trợ nhóm trong suốt quá trình thực hiện đồ án
              </p>
            </div>

            <div>
              {advisors.map((advisor, index) => (
                <Card
                  key={index}
                  className="text-center border-0 shadow-md hover:shadow-lg transition-all"
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">{advisor.name}</h3>
                    <p className="text-sm text-blue-600 mt-1">
                      {advisor.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {advisor.department}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Acknowledgments Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Award className="h-16 w-16 mx-auto opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold">Lời tri ân</h2>
            <div className="space-y-4 text-lg leading-relaxed">
              <p>
                Nhóm chúng em xin chân thành cảm ơn quý Thầy Cô khoa Công nghệ
                Thông tin - Truyền thông, đặc biệt là TS. Lê Thanh Lành, ThS.
                Nguyễn Thành Trung và ThS. Quách Thị Bích Nhường đã tận tình
                hướng dẫn và truyền đạt kiến thức quý báu trong suốt thời gian
                thực hiện đồ án.
              </p>
              <p>
                Chúng em cũng xin gửi lời cảm ơn đến Ban Giám hiệu Trường Đại
                học Công nghệ Đồng Nai (DNTU) đã tạo điều kiện thuận lợi để
                chúng em có môi trường học tập và nghiên cứu tốt nhất.
              </p>
              <p className="pt-4 italic border-t border-white/20 inline-block">
                Sức khỏe là tài sản quý giá nhất - Hãy để công nghệ chăm sóc
                bạn!
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 text-center text-gray-500 text-sm border-t">
          <p>
            © 2026 HealthSmart IoT - Đồ án tốt nghiệp Trường Đại học Công nghệ
            Đồng Nai (DNTU)
          </p>
          <p className="mt-2">
            Phiên bản 1.0 | Hệ thống giám sát sức khỏe thông minh
          </p>
        </footer>
      </main>
    </>
  );
}
