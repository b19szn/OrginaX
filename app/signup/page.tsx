"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    if (user.role === "ADMIN" || user.adminRole) {
      router.push("/admin");
    } else if (user.role === "STUDENT") {
      router.push("/student");
    } else {
      router.push("/instructor");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await signup(name, email, password, role);
      if (res.success) {
        if (role === "STUDENT") {
          router.push("/student");
        } else {
          router.push("/instructor");
        }
      } else {
        setError(res.error || "Registration failed.");
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

      {/* Main Signup Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl shadow-slate-100/50">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            Register Investigator Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create an academic profile to run AST vectorizations and multi-modal scans.
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
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Eleanor Vance / Student Name"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

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
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Academic Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            >
              <option value="STUDENT">Student / Researcher</option>
              <option value="TEACHER">Faculty / Department Evaluator</option>
              <option value="ADMIN">Academic Integrity Auditor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
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
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
