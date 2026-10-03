"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Code2,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Lock,
  GraduationCap,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

function InstructorSidebarLinks({ collapsed }: { collapsed: boolean }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const navItems = [
    {
      id: "overview",
      name: "Overview",
      tab: "overview",
      icon: LayoutDashboard,
    },
    {
      id: "classroom",
      name: "Classes & Grading",
      tab: "classroom",
      icon: GraduationCap,
      badge: "Classes",
    },
    {
      id: "pairwise",
      name: "Compare 2 Files",
      tab: "pairwise",
      icon: Sparkles,
    },
    {
      id: "batch",
      name: "Classroom Batch",
      tab: "batch",
      icon: Users,
    },
    {
      id: "ast-code",
      name: "Code Plagiarism",
      tab: "ast-code",
      icon: Code2,
    },
    {
      id: "diagrams",
      name: "Image & Diagrams",
      tab: "diagrams",
      icon: ImageIcon,
    },
    {
      id: "reports",
      name: "Reports & History",
      tab: "reports",
      icon: FileText,
    },
  ];

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <Link
            key={item.id}
            href={`/instructor?tab=${item.tab}`}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group ${
              isActive
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            title={collapsed ? item.name : undefined}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-emerald-600"
              }`}
            />
            {!collapsed && (
              <span className="flex-1 whitespace-nowrap text-[13px] font-medium">
                {item.name}
              </span>
            )}
            {!collapsed && item.badge && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                  isActive
                    ? "bg-slate-800 text-emerald-300 border-slate-700"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

function InstructorBreadcrumb() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const labels: Record<string, string> = {
    overview: "Overview",
    classroom: "Classes & Grading",
    pairwise: "Compare 2 Files",
    batch: "Classroom Batch",
    "ast-code": "Code Plagiarism",
    diagrams: "Image & Diagrams",
    reports: "Reports & History",
  };

  return (
    <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
      <Link href="/instructor" className="hover:text-slate-800 transition">
        Instructor Console
      </Link>
      <span className="text-slate-300">/</span>
      <span className="text-slate-800 font-semibold">{labels[activeTab] || "Overview"}</span>
    </div>
  );
}

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Instructor Console...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeUser = user;

  return (
    <div className="min-h-screen flex antialiased font-sans bg-[#fafbfc] text-slate-800">
      {/* ---------------- INSTRUCTOR SIDEBAR (w-72 to ensure zero truncation) ---------------- */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-72"
        } transition-all duration-200 bg-white/95 backdrop-blur-xl border-r border-slate-200/90 flex flex-col shrink-0 sticky top-0 h-screen z-40 shadow-xs`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <Link href="/instructor" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-slate-900 text-base tracking-tight truncate">
                    OriginaX
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Faculty
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-normal truncate">
                  Evaluator Suite
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Instructor Identity Card */}
        {!collapsed && (
          <div className="p-3 mx-3 mt-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-medium flex items-center justify-center text-xs shrink-0">
              {activeUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">
                {activeUser.name}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium truncate">
                Faculty Course Evaluator
              </div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <React.Suspense fallback={<div className="p-2 text-xs text-slate-400">Loading navigation...</div>}>
            <InstructorSidebarLinks collapsed={collapsed} />
          </React.Suspense>
        </div>

        {/* Bottom Sidebar: Admin Console link, public showcase, and logout */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/admin"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-semibold transition shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5" />
            {!collapsed && <span>Open Admin Console</span>}
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 text-xs font-medium transition shadow-2xs"
          >
            <span>←</span>
            {!collapsed && <span>Public Showcase</span>}
          </Link>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-rose-600 hover:bg-rose-50 text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {!collapsed && (
            <div className="px-1 pt-1 text-[10px] text-slate-400 truncate text-center font-mono">
              {activeUser.email}
            </div>
          )}
        </div>
      </aside>

      {/* ---------------- RIGHT MAIN WORKSPACE ---------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between">
          <React.Suspense fallback={<div className="text-xs text-slate-400">Instructor Console</div>}>
            <InstructorBreadcrumb />
          </React.Suspense>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50/90 border border-amber-200/80 text-amber-800 text-xs font-medium shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Zero-Knowledge: ENFORCED</span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <span>←</span>
              <span>Showcase</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <AuthModal />
    </div>
  );
}
