"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [lang, setLang] = useState("zh");

  const content = {
    en: {
      title: "STRAWBERRY",
      subtitle: "GAMEPAD REMOTE",
      description: "Transform your gamepad into a powerful remote control for your Mac. Map buttons to keyboard keys, mouse moves, and system shortcuts with ease.",
      download: "Download .dmg",
      featuresTitle: "POWERFUL FEATURES",
      features: [
        { title: "Custom Mapping", desc: "Map any gamepad button to any key." },
        { title: "Low Latency", desc: "Ultra-fast response for smooth control." },
        { title: "Retro Vibes", desc: "A beautiful interface inspired by classic games." },
        { title: "Mac Native", desc: "Optimized specifically for macOS users." },
      ],
      switchLang: "中文",
      screenshots: "Screenshots",
      footer: "© 2026 Strawberry Gamepad Remote. Built for Mac players.",
      mainImg: "/english.png",
    },
    zh: {
      title: "草莓手柄遥控器",
      subtitle: "映射遥控器",
      description: "将您的游戏手柄转变为功能强大的 Mac 遥控器。轻松将手柄按键映射到键盘按键、鼠标移动和系统快捷键。",
      download: "下载 .dmg",
      featuresTitle: "核心功能",
      features: [
        { title: "自定义映射", desc: "将任何手柄按键映射到任何按键。" },
        { title: "极低延迟", desc: "超快响应，确保流畅控制。" },
        { title: "复古风情", desc: "灵感源自经典游戏的精美界面。" },
        { title: "Mac 原生", desc: "专为 macOS 用户优化。" },
      ],
      switchLang: "English",
      screenshots: "应用截图",
      footer: "© 2026 草莓手柄映射遥控器. 专为 Mac 玩家打造。",
      mainImg: "/cn.png",
    },
  };

  const t = content[lang];

  return (
    <main className="min-h-screen selection:bg-yellow-200">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Strawberry Gamepad Logo"
            width={48}
            height={48}
            className="retro-card !p-1 bg-white"
          />
          <span className="retro-title text-sm md:text-lg hidden sm:block">
            {t.title}
          </span>
        </div>
        <button
          onClick={() => setLang(lang === "en" ? "zh" : "en")}
          className="retro-btn text-xs"
        >
          {t.switchLang}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <header>
            <h1 className="retro-title text-4xl md:text-6xl mb-4 leading-tight">
              {t.title} <br />
              <span className="text-accent">{t.subtitle}</span>
            </h1>
            <p className="text-lg md:text-xl opacity-80 leading-relaxed font-medium">
              {t.description}
            </p>
          </header>

          <div className="flex flex-wrap gap-4">
            <a
              href="/StrawberryGamepad.dmg"
              download
              className="retro-btn px-8 py-4 text-lg"
            >
              {t.download}
            </a>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-secondary/30 rounded-full blur-3xl group-hover:bg-secondary/50 transition duration-500"></div>
          <div className="relative retro-card p-2 bg-slate-100 overflow-hidden">
            <Image
              src={t.mainImg}
              alt="Strawberry Gamepad Remote Screenshot"
              width={800}
              height={500}
              className="w-full h-auto rounded-sm shadow-inner"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 border-y-4 border-border py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="retro-title text-2xl mb-12 text-center">
            {t.featuresTitle}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.map((f, i) => (
              <div key={i} className="retro-card hover:-translate-y-2 transition-transform cursor-default">
                <h3 className="retro-title text-xs mb-4">{f.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="retro-title text-2xl mb-12">{t.screenshots}</h2>
        <div className="retro-card p-4 inline-block max-w-full">
          <Image
            src={t.mainImg}
            alt="App Detail View"
            width={1000}
            height={600}
            className="max-w-full h-auto"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t-4 border-border bg-secondary/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍓</span>
            <span>{t.footer}</span>
          </div>
          <div className="flex gap-6">
            <a href="https://x.com/siantgirl" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline underline-offset-4">X</a>
          </div>
        </div>
      </footer>

      {/* Floating Retro Decors */}
      <div className="fixed top-20 right-10 -z-10 text-6xl opacity-10 animate-pulse pointer-events-none">🎮</div>
      <div className="fixed bottom-20 left-10 -z-10 text-6xl opacity-10 animate-bounce pointer-events-none">🍓</div>

      {/* Floating Donation QR */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <div className="retro-card !p-2 bg-white flex flex-col items-center gap-2 transform transition-transform group-hover:-translate-y-2">
          <Image
            src="/qr.jpg"
            alt="Buy me a milk tea"
            width={180}
            height={180}
            className="rounded-sm"
          />
          <span className="text-[10px] font-bold text-primary-dark whitespace-nowrap">
            请我喝奶茶 🍵
          </span>
        </div>
      </div>
    </main>
  );
}
