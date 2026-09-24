"use client";

import Link from "next/link";
import { ShieldCheck, Layers, FileSearch, Activity, FileText } from "lucide-react";

export default function Navbar() {
  return (
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
        <nav className="hidden md:flex items-center space-x-8 text-sm font-normal text-slate-600">
          <Link
            href="/dashboard"
            className="hover:text-slate-800 text-slate-800 font-medium transition-colors"
          >
            Dashboard
          </Link>

          <a
            href="/dashboard#upload-section"
            className="hover:text-slate-800 transition-colors"
          >
            Ingestion Engine
          </a>

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
        </nav>

        {/* Right Action Button (Minimalist Sleek Slate Pill) */}
        <div className="flex items-center space-x-4">
          <a
            href="#upload-section"
            className="primary-pill-btn text-xs sm:text-sm font-medium tracking-wide inline-flex items-center space-x-2"
          >
            <span>Launch Analysis</span>
          </a>
        </div>
      </div>
    </header>
  );
}
