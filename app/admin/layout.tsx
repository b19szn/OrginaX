"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plug,
  Brain,
  Bot,
  Palette,
  CreditCard,
  Users,
  Settings,
  Activity,
  Key,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sun,
  Moon,
  Lock,
  Sparkles,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isLightMode, setIsLightMode] = useState(true);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("originax_admin_theme");
    if (savedTheme === "dark") {
      setIsLightMode(false);
      document.documentElement.classList.add("dark");
    } else {
      setIsLightMode(true);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextLight = !isLightMode;
    setIsLightMode(nextLight);
    if (nextLight) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("originax_admin_theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("originax_admin_theme", "dark");
    }
  };

  const navItems = [
    {
      name: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      emoji: "📊",
    },
    {
      name: "Providers",
      href: "/admin/providers",
      icon: Plug,
      emoji: "🔌",
    },
    {
      name: "Models",
      href: "/admin/models",
      icon: Brain,
      emoji: "🧠",
    },
    {
      name: "AI Engine",
      href: "/admin/ai-engine",
      icon: Bot,
      emoji: "🤖",
    },
    {
      name: "Image Engine",
      href: "/admin/image-engine",
      icon: Palette,
      emoji: "🎨",
    },
    {
      name: "Payment Gateways",
      href: "/admin/monetization",
      icon: CreditCard,
      emoji: "💳",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      emoji: "👥",
    },
    {
      name: "Settings",
      href: "/admin/cms",
      icon: Settings,
      emoji: "⚙️",
    },
    {
      name: "Tracking",
      href: "/admin/telemetry",
      icon: Activity,
      emoji: "📈",
    },
    {
      name: "Keys Monitor",
      href: "/admin/keys-monitor",
      icon: Key,
      emoji: "🔑",
    },
  ];

  // Resolve current active item name
  const currentNav = navItems.find((item) => item.href === pathname) || navItems[0];

  return (
    <div
      className={`min-h-screen flex antialiased font-sans transition-colors duration-200 ${
        isLightMode
          ? "multimodal-canvas text-slate-700"
          : "multimodal-canvas-dark text-slate-200 dark"
      }`}
    >
      {/* LEFT SIDEBAR (Dedicated Full-Height Docked Console) */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } transition-all duration-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 sticky top-0 h-screen z-40 shadow-xs`}
      >
        {/* Brand Console Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-base tracking-tight leading-tight truncate">
                  Admin Console
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal truncate">
                  OriginaX control panel
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-white dark:bg-indigo-600 dark:text-white font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? "text-indigo-300 dark:text-white"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 truncate tracking-tight text-[13px]">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Sidebar: Back to App Pill + Operator Email */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 transition shadow-2xs"
          >
            <span>←</span>
            {!collapsed && <span>Back to dashboard</span>}
          </Link>

          {!collapsed && (
            <div className="px-1 text-[11px] text-slate-400 dark:text-slate-500 truncate font-mono">
              shezanmahmud2003@gmail.com
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Breadcrumb & Controls Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 px-6 sm:px-8 py-3.5 flex items-center justify-between">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition">Admin</span>
            <span>/</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <span>{currentNav.emoji}</span>
              <span>{currentNav.name}</span>
            </span>
          </div>

          {/* Right Action Controls: Light/Dark Mode Toggle + Back to Dashboard */}
          <div className="flex items-center gap-3">
            {/* Zero-Knowledge Privacy Status Badge */}
            <div
              title="Zero-Knowledge Privacy: Document content and raw scans are cryptographically obscured from administrators."
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-medium"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Zero-Knowledge:</span>
              <span className="font-semibold text-amber-900 dark:text-amber-200">ENFORCED</span>
            </div>

            {/* Light / Dark Mode Pill Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs cursor-pointer select-none"
              title={`Switch to ${isLightMode ? "Dark" : "Light"} Mode`}
            >
              {isLightMode ? (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>{isLightMode ? "Light mode" : "Dark mode"}</span>
              <span
                className={`w-7 h-4 rounded-full relative inline-flex items-center px-0.5 transition-colors ${
                  isLightMode ? "bg-emerald-500" : "bg-indigo-600"
                }`}
              >
                <span
                  className={`w-3 h-3 bg-white rounded-full shadow-xs transform transition-transform ${
                    isLightMode ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </span>
            </button>

            {/* Back to App Action */}
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
            >
              <span>← Back to app</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
