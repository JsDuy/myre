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
import { Providers } from "./providers";
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
    <html
      lang="en"
      className={cn("font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <AuthProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <DeviceProvider>
            <NavigationProvider>
              <HydrationFix />
              <Header /> <Providers>{children}</Providers>
              <ClientToaster />
              <Footer />
            </NavigationProvider>
          </DeviceProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
