"use client";

import Link from "next/link";
import { ShieldCheck, LogIn, LogOut, UserCheck, Sparkles, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { user, logout, openAuthModal, isLoading } = useAuth();

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "TEACHER":
        return "Faculty";
      case "ADMIN":
        return "Auditor";
      default:
        return "Student";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3.5">
          {/* Project Brand Identity: Minimalist Editorial Style */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:border-emerald-300 transition-all">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-800 text-lg tracking-tight">
                  OriginaX
                </span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  v2.4
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">
                Multi-Modal Plagiarism Detector
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs sm:text-sm font-medium text-slate-600">
            <Link
              href="/dashboard"
              className="hover:text-slate-900 transition-colors font-medium"
            >
              Detection Lab
            </Link>

            <Link
              href="/student"
              className="hover:text-slate-900 transition-colors font-medium"
            >
              Student Portal
            </Link>

            <Link
              href="/instructor"
              className="hover:text-slate-900 transition-colors font-medium"
            >
              Instructor Suite
            </Link>

            <Link
              href="/admin"
              className="hover:text-slate-900 transition-colors text-slate-500 hover:text-emerald-700"
            >
              Admin Console
            </Link>

            <a
              href="/dashboard#audit-section"
              className="hover:text-slate-800 transition-colors"
            >
              Audit Trail
            </a>

            <Link
              href="/report/cmuekjt130006oqhojwv5cdzs"
              className="hover:text-slate-800 transition-colors"
            >
              Unified Reports
            </Link>

            <Link
              href="/#pricing"
              className="hover:text-emerald-700 transition-colors font-medium text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-200/80"
            >
              Pricing Plans
            </Link>
          </nav>

          {/* Right Action Button & Auth Profile */}
          <div className="flex items-center space-x-3">
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-3">
                    {/* User Identity Chip */}
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-xs text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-medium flex items-center justify-center text-[10px]">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/60">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={logout}
                      title="Sign Out"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={openAuthModal}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sign In</span>
                    </button>

                    <Link
                      href="/signup"
                      className="px-3.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}
              </>
            )}

            <a
              href="#upload-section"
              className="primary-pill-btn text-xs sm:text-sm font-medium tracking-wide inline-flex items-center space-x-2"
            >
              <span>Launch Analysis</span>
            </a>
          </div>
        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal />
    </>
  );
}
