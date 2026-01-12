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
  title: "Strawberry Gamepad Mapper - Control your Mac with a Gamepad",
  description: "The best tool for Mac users to map gamepad inputs to keyboard and mouse events. Perfect for remote control and gaming. Free download for macOS.",
  keywords: "gamepad mapper, mac remote, strawberry gamepad, mac gamepad controller, game controller to mouse",
  alternates: {
    canonical: "https://classicgameshub.tech", // Placeholder
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
