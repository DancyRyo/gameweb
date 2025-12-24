import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Classic Games Collection - Free Online Browser Games | Play 50+ Games",
  description: "Play 50+ free classic games online! Enjoy Snake, Tetris, Pac-Man, 2048, Minesweeper, and more arcade, puzzle, and strategy games directly in your browser. No download required!",
  keywords: "free online games, browser games, classic games, arcade games, puzzle games, snake game, tetris online, pacman, 2048 game, minesweeper, online gaming, free games no download, web games, retro games, casual games",
  authors: [{ name: "Classic Games Collection" }],
  creator: "Classic Games Collection",
  publisher: "Classic Games Collection",
  robots: "index, follow",
  alternates: {
    canonical: "https://classicgameshub.tech",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://classicgameshub.tech",
    title: "Classic Games Collection - Free Online Browser Games",
    description: "Play 50+ free classic games online! Snake, Tetris, Pac-Man, 2048, and more. No download required!",
    siteName: "Classic Games Collection",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Classic Games Collection - Free Online Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Classic Games Collection - Free Online Browser Games",
    description: "Play 50+ free classic games online! Snake, Tetris, Pac-Man, 2048, and more. No download required!",
    images: ["/og-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "games",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
