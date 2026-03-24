import type { Metadata } from "next";
import { AuthProvider } from "@/providers/AuthProvider";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClientToaster } from "@/components/ClientToaster";
import { HydrationFix } from "@/components/HydrationFix";
import { DeviceProvider } from "@/providers/DeviceProvider";
import { NavigationProvider } from "@/context/navigation-context";
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Health Watch Web",
  description: "Theo dõi sức khỏe realtime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <AuthProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <DeviceProvider>
            <NavigationProvider>
              <HydrationFix />
              <Header /> {children}
              {/* <Toaster
          position="bottom-right" // giống Zalo: góc phải dưới
          richColors // màu đẹp cho error/warning
          duration={5000} // tự tắt sau 5 giây
          closeButton // có nút đóng
          toastOptions={{
            classNames: {
              error: "bg-red-600 text-white border-red-700",
              warning: "bg-orange-500 text-white border-orange-600",
            },
          }}
        /> */}
              <ClientToaster />
              <Footer />
            </NavigationProvider>
          </DeviceProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
