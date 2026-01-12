import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import Script from "next/script";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

export const metadata = {
  title: "草莓手柄遥控器 | Strawberry Gamepad Mapper - Control your Mac with a Gamepad",
  description: "草莓手柄遥控器是专为 Mac 用户设计的工具，可将手柄映射为键盘鼠标和系统快捷键。The best tool for Mac users to map gamepad inputs to keyboard and mouse events. Perfect for remote control and gaming. Free download for macOS.",
  keywords: "草莓手柄, 手柄映射, Mac遥控器, gamepad mapper, mac remote, strawberry gamepad, mac gamepad controller, game controller to mouse",
  alternates: {
    canonical: "https://classicgameshub.tech",
    languages: {
      'zh-CN': 'https://classicgameshub.tech',
      'en-US': 'https://classicgameshub.tech',
    },
  },
  openGraph: {
    title: "草莓手柄遥控器 | Strawberry Gamepad Mapper",
    description: "将您的游戏手柄转变为功能强大的 Mac 遥控器。Transform your gamepad into a powerful remote control for your Mac.",
    url: "https://classicgameshub.tech",
    siteName: "Strawberry Gamepad",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "草莓手柄遥控器 | Strawberry Gamepad Mapper",
    description: "Mac 上的手柄映射神器。Control your Mac with a Gamepad.",
    creator: "@siantgirl",
    images: ["/logo.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VEJRM4MWEB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VEJRM4MWEB');
          `}
        </Script>

      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
