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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Calendar,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Wind,
  Eye,
  Microscope,
  Baby,
  Briefcase,
  Star,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ContactPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

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
        1000
      );
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      // Tạo các hình khối 3D dạng trái tim
      const geometry = new THREE.SphereGeometry(0.8, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.3,
        metalness: 0.2,
        emissive: 0xdc2626,
        emissiveIntensity: 0.15,
      });

      const heartSphere = new THREE.Mesh(geometry, material);
      scene.add(heartSphere);

      // Thêm các particles hình trái tim nhỏ
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 800;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 12;
        posArray[i + 1] = (Math.random() - 0.5) * 8;
        posArray[i + 2] = (Math.random() - 0.5) * 10;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3)
      );
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xef4444,
        transparent: true,
        opacity: 0.5,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Thêm ánh sáng
      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 2, 3);
      scene.add(directionalLight);

      const backLight = new THREE.PointLight(0xef4444, 0.4);
      backLight.position.set(0, 0, -2);
      scene.add(backLight);

      camera.position.z = 3.5;

      let mouseX = 0;
      let mouseY = 0;

      document.addEventListener("mousemove", (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      });

      const animate = () => {
        requestAnimationFrame(animate);

        heartSphere.rotation.x += 0.003;
        heartSphere.rotation.y += 0.005;
        heartSphere.rotation.z += 0.002;

        particles.rotation.x += 0.0003;
        particles.rotation.y += 0.0004;

        heartSphere.position.x = mouseX * 0.2;
        heartSphere.position.y = -mouseY * 0.2;

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý gửi form ở đây
    console.log("Form submitted:", formData);
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  // Đội ngũ bác sĩ chuyên khoa
  const doctors = [
    {
      name: "PGS.TS.BS Nguyễn Văn An",
      specialty: "Chuyên khoa Tim mạch",
      experience: "25 năm kinh nghiệm",
      hospital: "Bệnh viện Bạch Mai",
      avatar: "/img/doctor1.jpg",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50",
      bio: "Chuyên gia đầu ngành về tim mạch can thiệp, từng công tác tại Pháp.",
    },
    {
      name: "TS.BS Trần Thị Lan Hương",
      specialty: "Chuyên khoa Thần kinh",
      experience: "20 năm kinh nghiệm",
      hospital: "Bệnh viện Việt Đức",
      avatar: "/img/doctor2.jpg",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      bio: "Chuyên gia về đột quỵ và các bệnh lý thần kinh, nghiên cứu sinh tại Nhật Bản.",
    },
    {
      name: "BS.CKII Lê Minh Tuấn",
      specialty: "Chuyên khoa Cơ xương khớp",
      experience: "18 năm kinh nghiệm",
      hospital: "Bệnh viện Chấn thương chỉnh hình",
      avatar: "/img/doctor3.jpg",
      icon: Bone,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      bio: "Phẫu thuật viên chính, chuyên điều trị thoát vị đĩa đệm và thoái hóa khớp.",
    },
    {
      name: "BS.CKI Phạm Thị Thu Thảo",
      specialty: "Chuyên khoa Hô hấp",
      experience: "15 năm kinh nghiệm",
      hospital: "Bệnh viện Nhiệt đới Trung ương",
      avatar: "/img/doctor4.jpg",
      icon: Wind,
      color: "text-green-500",
      bgColor: "bg-green-50",
      bio: "Chuyên gia về hen suyễn và COPD, từng tham gia nghiên cứu tại Singapore.",
    },
    {
      name: "TS.BS Hoàng Minh Đức",
      specialty: "Chuyên khoa Mắt",
      experience: "22 năm kinh nghiệm",
      hospital: "Bệnh viện Mắt Trung ương",
      avatar: "/img/doctor5.jpg",
      icon: Eye,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      bio: "Chuyên phẫu thuật LASIK và điều trị các bệnh lý võng mạc.",
    },
    {
      name: "PGS.TS.BS Vũ Thị Kim Liên",
      specialty: "Chuyên khoa Nhi",
      experience: "28 năm kinh nghiệm",
      hospital: "Bệnh viện Nhi Trung ương",
      avatar: "/img/doctor6.jpg",
      icon: Baby,
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      bio: "Chuyên gia hàng đầu về nhi khoa và tiêm chủng, cố vấn cho WHO.",
    },
  ];

  // Thông tin liên hệ
  const contactInfo = [
    {
      icon: MapPin,
      title: "Địa chỉ",
      content: "Số 10, Đường Nguyễn Khuyến, Phường 5, TP. Biên Hòa, Đồng Nai",
      link: null,
    },
    {
      icon: Phone,
      title: "Hotline tư vấn",
      content: "1900 1234",
      link: "tel:19001234",
    },
    {
      icon: Mail,
      title: "Email hỗ trợ",
      content: "support@healthsmartiot.vn",
      link: "mailto:support@healthsmartiot.vn",
    },
    {
      icon: Clock,
      title: "Thời gian làm việc",
      content: "Thứ 2 - Thứ 7: 7:30 - 20:00<br/>Chủ nhật: 8:00 - 17:00",
      link: null,
    },
  ];

  // Câu hỏi thường gặp
  const faqs = [
    {
      question: "Làm thế nào để đặt lịch tư vấn với bác sĩ?",
      answer:
        "Bạn có thể gọi đến hotline 1900 1234 hoặc điền form đăng ký bên cạnh để được hỗ trợ đặt lịch tư vấn trực tiếp hoặc online qua video call.",
    },
    {
      question: "Chi phí tư vấn là bao nhiêu?",
      answer:
        "Chi phí tư vấn phụ thuộc vào từng bác sĩ và hình thức tư vấn (trực tiếp/online). Giá dao động từ 200.000đ - 500.000đ/buổi. Học sinh, sinh viên được giảm 30%.",
    },
    {
      question: "Dữ liệu sức khỏe của tôi có được bảo mật không?",
      answer:
        "Tất cả dữ liệu sức khỏe đều được mã hóa và bảo mật tuyệt đối theo tiêu chuẩn y tế quốc tế, chỉ có bác sĩ điều trị và bạn mới có quyền truy cập.",
    },
    {
      question: "Tôi có thể nhận kết quả tư vấn qua đâu?",
      answer:
        "Kết quả tư vấn sẽ được gửi qua email và ứng dụng HealthSmart IoT, kèm theo các chỉ định và hướng dẫn chi tiết.",
    },
  ];

  return (
    <>
      {/* Canvas 3D Background */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
        style={{ opacity: 0.3 }}
      />

      <main className="relative">
        {/* Hero Section */}
        <section className="min-h-[60vh] flex items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <Badge className="animate-pulse bg-gradient-to-r from-red-500 to-red-600 text-white border-0 px-4 py-1 text-sm">
              Đội ngũ chuyên gia y tế
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Liên hệ & Tư vấn
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Đội ngũ bác sĩ chuyên khoa hàng đầu sẵn sàng tư vấn cho bạn
              <br />
              <span className="text-red-600 font-medium">
                24/7 hỗ trợ sức khỏe toàn diện
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="#appointment">
                  Đặt lịch tư vấn
                  <Calendar className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="px-8 py-6 text-lg border-2"
              >
                <Link href="#doctors">
                  Xem đội ngũ bác sĩ
                  <Stethoscope className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Doctors Team Section */}
        <section id="doctors" className="py-20 px-6 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                Đội ngũ y bác sĩ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Chuyên gia tư vấn sức khỏe
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm và chuyên môn cao
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor, index) => {
                const Icon = doctor.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden"
                  >
                    <div className="relative h-32 bg-gradient-to-r from-red-50 to-pink-50">
                      <div className="absolute -bottom-8 left-6">
                        <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
                          <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white text-xl">
                            {doctor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <Badge className="absolute top-4 right-4 bg-white/90 text-red-600 border-red-200">
                        <Star className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                        Chuyên gia
                      </Badge>
                    </div>
                    <CardContent className="pt-12 pb-6">
                      <div className="mb-3">
                        <h3 className="font-bold text-lg">{doctor.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-5 h-5 rounded-full ${doctor.bgColor} flex items-center justify-center`}
                          >
                            <Icon className={`h-3 w-3 ${doctor.color}`} />
                          </div>
                          <p className="text-sm font-medium text-red-600">
                            {doctor.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Briefcase className="h-4 w-4" />
                          <span>{doctor.experience}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {doctor.bio}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        asChild
                      >
                        <Link href="#appointment">
                          Đặt lịch tư vấn
                          <Calendar className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Info & Form Section */}
        <section
          id="appointment"
          className="py-20 px-6 bg-gradient-to-b from-blue-50/30 to-white backdrop-blur-sm"
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <div className="space-y-6">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Thông tin liên hệ
                  </Badge>
                  <h2 className="text-3xl font-bold">Liên hệ với chúng tôi</h2>
                  <p className="text-gray-600 dark:text-white">
                    Hãy liên hệ với chúng tôi qua các kênh dưới đây để được hỗ
                    trợ nhanh nhất.
                  </p>

                  <div className="space-y-4 mt-6">
                    {contactInfo.map((info, index) => {
                      const Icon = info.icon;
                      return (
                        <Card key={index} className="border-0 shadow-sm">
                          <CardContent className="flex items-start gap-4 p-4">
                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{info.title}</h3>
                              {info.link ? (
                                <a
                                  href={info.link}
                                  className="text-gray-600 hover:text-red-600 transition-colors dark:text-white" 
                                >
                                  {info.content}
                                </a>
                              ) : (
                                <p
                                  className="text-gray-600 dark:text-white"
                                  dangerouslySetInnerHTML={{ __html: info.content }}
                                />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Social Links */}
                  <div className="pt-4">
                    <h3 className="font-semibold mb-3 dark:text-black">Kết nối với chúng tôi</h3>
                    <div className="flex gap-3">
                      {["Facebook", "Zalo", "YouTube", "TikTok"].map((social) => (
                        <Button
                          key={social}
                          variant="outline"
                          size="sm"
                          className="rounded-full dark:bg-gray-800 dark:text-white border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-all"
                        >
                          {social}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Đặt lịch tư vấn</CardTitle>
                  <CardDescription>
                    Vui lòng điền đầy đủ thông tin, chúng tôi sẽ liên hệ lại trong
                    vòng 24h
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input
                        id="name"
                        placeholder="Nguyễn Văn A"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-red-500"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-red-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                          id="phone"
                          placeholder="090xxxxxxx"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Chuyên khoa cần tư vấn *</Label>
                      <select
                        id="subject"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        required
                      >
                        <option value="">Chọn chuyên khoa</option>
                        <option value="tim-mach">Tim mạch</option>
                        <option value="than-kinh">Thần kinh</option>
                        <option value="co-xuong-khop">Cơ xương khớp</option>
                        <option value="ho-hap">Hô hấp</option>
                        <option value="mat">Mắt</option>
                        <option value="nhi">Nhi khoa</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mô tả triệu chứng *</Label>
                      <Textarea
                        id="message"
                        placeholder="Vui lòng mô tả chi tiết các triệu chứng bạn đang gặp phải..."
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        className="focus:ring-red-500"
                      />
                    </div>

                    {formSubmitted && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm">
                          Đã gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại
                          sớm.
                        </span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Gửi yêu cầu tư vấn
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                      Bằng việc gửi form, bạn đồng ý với chính sách bảo mật thông
                      tin của chúng tôi
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <MessageCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Câu hỏi thường gặp
              </h2>
              <p className="text-gray-600 dark:text-white">
                Những thắc mắc phổ biến về dịch vụ tư vấn của chúng tôi
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 text-sm font-bold">
                          {index + 1}
                        </span>
                      </div>
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 pl-9 dark:text-white">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Chưa tìm thấy câu trả lời?{" "}
                <Link href="#appointment" className="text-red-600 font-medium hover:underline">
                  Liên hệ trực tiếp với chúng tôi
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 text-center text-gray-500 text-sm border-t">
          <p>
            © 2026 HealthSmart IoT - Hệ thống giám sát sức khỏe thông minh
          </p>
          <p className="mt-2">
            Đội ngũ bác sĩ chuyên khoa | Tư vấn sức khỏe 24/7
          </p>
        </footer>
      </main>
    </>
  );
}