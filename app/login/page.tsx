"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, GraduationCap, Sparkles, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, navigate to role-specific dashboard
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "ADMIN" || user.adminRole) {
        router.push("/admin");
      } else if (user.role === "STUDENT") {
        router.push("/student");
      } else {
        router.push("/instructor");
      }
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        const u = (res as any).user;
        if (u?.role === "ADMIN" || u?.adminRole) {
          router.push("/admin");
        } else if (u?.role === "STUDENT") {
          router.push("/student");
        } else {
          router.push("/instructor");
        }
      } else {
        setError(res.error || "Authentication failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await loginAsDemo(demoEmail);
      if (res.success) {
        if (demoEmail.includes("admin")) {
          router.push("/admin");
        } else if (demoEmail.includes("evaluator")) {
          router.push("/instructor");
        } else {
          router.push("/student");
        }
      } else {
        setError(res.error || "Demo login failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#fafbfc]">
      {/* Brand Identity */}
      <div className="mb-8 text-center">
        <Link href="/dashboard" className="inline-flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 transition-all">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800 text-xl tracking-tight">OriginaX</span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Multi-Modal Plagiarism Detector
            </p>
          </div>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl shadow-slate-100/50">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            Sign In to OriginaX
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional verification required to run multi-modal plagiarism scans.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@university.edu"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 bg-[#334155] hover:bg-[#1e293b] text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Institutional Access */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Instant Access Roles
            </span>
            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              1-Click Demo
            </span>
          </div>

          <div className="space-y-2.5">
            {/* SuperAdmin Quick Access */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleQuickDemo("admin@originax.online")}
              className="w-full p-2.5 text-left bg-gradient-to-r from-purple-50/80 via-indigo-50/40 to-slate-50 border border-purple-200/90 hover:border-purple-300 rounded-2xl transition-all group flex items-center justify-between shadow-2xs hover:shadow-xs"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-100/90 border border-purple-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-purple-900 truncate">
                      Shezan Mahmud
                    </span>
                    <span className="text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.2 rounded bg-purple-100/90 text-purple-800 border border-purple-200">
                      SuperAdmin
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Platform SuperAdmin &amp; Console Access
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-medium text-purple-700 group-hover:translate-x-0.5 transition-transform shrink-0 pr-1 flex items-center">
                Enter Console &rarr;
              </div>
            </button>

            {/* Evaluator & Student 2-Col Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo("evaluator@university.edu")}
                className="p-3 text-left bg-slate-50/90 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 rounded-2xl transition-all group"
              >
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 group-hover:text-emerald-800 truncate">
                    Dr. Eleanor Vance
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Faculty Evaluator
                </div>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo("alex.rivera@berkeley.edu")}
                className="p-3 text-left bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 rounded-2xl transition-all group"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-800 group-hover:text-blue-800 truncate">
                    Alex Rivera
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Graduate Researcher
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Need an institutional account?{" "}
          <Link
            href="/signup"
            className="font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
