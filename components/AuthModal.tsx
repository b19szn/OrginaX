"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Loader2, Sparkles, GraduationCap } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, signup, loginAsDemo } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (tab === "login") {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || "Authentication failed.");
        } else {
          closeAuthModal();
          const u = (res as any).user;
          if (u?.role === "ADMIN" || u?.adminRole) {
            window.location.href = "/admin";
          }
        }
      } else {
        const res = await signup(name, email, password, role);
        if (!res.success) {
          setError(res.error || "Failed to create account.");
        }
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
      if (!res.success) {
        setError(res.error || "Demo login failed.");
      } else {
        closeAuthModal();
        if (demoEmail.includes("admin")) {
          window.location.href = "/admin";
        } else if (demoEmail.includes("evaluator")) {
          window.location.href = "/instructor";
        } else {
          window.location.href = "/student";
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Decor */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-medium text-slate-800 tracking-tight">
                OriginaX Authentication
              </h3>
              <p className="text-xs text-slate-500">
                Institutional Access & Identity Gate
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="mt-4 flex p-1 rounded-xl bg-slate-100/80 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                tab === "login"
                  ? "bg-white text-slate-800 shadow-xs border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                tab === "signup"
                  ? "bg-white text-slate-800 shadow-xs border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {tab === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Eleanor Vance"
                      className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Academic Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="STUDENT">Student / Graduate Candidate</option>
                    <option value="TEACHER">Faculty / Thesis Evaluator</option>
                    <option value="ADMIN">Academic Integrity Auditor</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@university.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-[#334155] hover:bg-[#1e293b] text-white text-xs font-medium rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{tab === "login" ? "Sign In to OriginaX" : "Create Account & Enter"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Instant Role Access
              </span>
              <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                1-Click Demo
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickDemo("admin@originax.online")}
                className="w-full p-2 text-left bg-gradient-to-r from-purple-50/80 via-indigo-50/40 to-slate-50 hover:bg-purple-50/90 border border-purple-200/80 hover:border-purple-300 rounded-xl transition-all group flex items-center justify-between shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-purple-100/90 border border-purple-200 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-semibold text-slate-800 group-hover:text-purple-800 truncate">
                        Shezan Mahmud
                      </span>
                      <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                        SUPERADMIN
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Platform SuperAdmin Console
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-purple-700 font-medium flex items-center group-hover:translate-x-0.5 transition-transform">
                  Enter &rarr;
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo("evaluator@university.edu")}
                  className="p-2 text-left bg-slate-50/90 hover:bg-emerald-50/60 border border-slate-200/70 hover:border-emerald-300 rounded-xl transition-all group"
                >
                  <div className="flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-medium text-slate-800 group-hover:text-emerald-800 truncate">
                      Dr. Eleanor Vance
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Faculty Evaluator
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickDemo("alex.rivera@berkeley.edu")}
                  className="p-2 text-left bg-slate-50/90 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-300 rounded-xl transition-all group"
                >
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-medium text-slate-800 group-hover:text-blue-800 truncate">
                      Alex Rivera
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    Graduate Researcher
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
