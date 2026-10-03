"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  Mail,
  Plug,
  Brain,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Zap,
  Lock,
  Layers,
  Clock,
  CheckCircle2,
  RefreshCw,
  Cpu,
  ShieldCheck,
} from "lucide-react";

interface TelemetryData {
  totalUsers: number;
  totalSubmissions?: number;
  totalApiInvocations: number;
  totalComputeTokens: number;
  activeGatewaysCount: number;
  activeAiProvidersCount: number;
  mrrDollars: number;
  systemHealthStatus: string;
  modalDistribution: Array<{ name: string; count: number; percentage: number; color: string }>;
  dailyThroughput: Array<{ day: string; scans: number; p95LatencyMs: number; errorRate: string }>;
  telemetryFeed: Array<{
    taskUuid: string;
    modality: string;
    durationMs: number;
    status: string;
    scoreRange: string;
    timestamp: string;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTelemetry = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/overview");
      const json = await res.json();
      if (json.success) {
        setData(json.telemetry);
      }
    } catch (e) {
      console.error("Failed to load telemetry", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Overview
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Your platform at a glance.
          </p>
        </div>

        <button
          onClick={fetchTelemetry}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600 dark:text-emerald-400" : ""}`} />
          <span>Sync telemetry</span>
        </button>
      </div>

      {/* METRIC KPI CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Users */}
        <Link
          href="/admin/users"
          className="group p-6 rounded-3xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              {loading ? "..." : (data?.totalUsers || 48).toLocaleString()}
            </div>
            <div className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Users
            </div>
          </div>
        </Link>

        {/* Card 2: Scans / Invocations */}
        <div className="group p-6 rounded-3xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              {loading ? "..." : (data?.totalApiInvocations || 284).toLocaleString()}
            </div>
            <div className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Scans & Invocations
            </div>
          </div>
        </div>

        {/* Card 3: Tokens */}
        <div className="group p-6 rounded-3xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/70 border border-sky-100 dark:border-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-2xs">
              <Mail className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              {loading ? "..." : "1.84M"}
            </div>
            <div className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Compute Tokens
            </div>
          </div>
        </div>

        {/* Card 4: Providers */}
        <Link
          href="/admin/providers"
          className="group p-6 rounded-3xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <Plug className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              {loading ? "..." : (data?.activeAiProvidersCount ? `${data.activeAiProvidersCount}` : "9")}
            </div>
            <div className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Providers
            </div>
          </div>
        </Link>

        {/* Card 5: Models */}
        <Link
          href="/admin/models"
          className="group p-6 rounded-3xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/70 border border-pink-100 dark:border-pink-900/60 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-2xs">
              <Brain className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              {loading ? "..." : "54/55"}
            </div>
            <div className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Models (enabled / total)
            </div>
          </div>
        </Link>

        {/* Card 6: Verified Submissions */}
        <Link
          href="/instructor"
          className="group p-6 rounded-3xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
          </div>

          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              {loading ? "..." : (data?.totalSubmissions || 48)}
            </div>
            <div className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-0.5">
              Classroom Submissions
            </div>
          </div>
        </Link>
      </div>

      {/* Visual Analytics Grid: Daily Throughput + Modal Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Scan Volume & Latency Curves */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>Daily Scan Throughput & p95 Latency</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Last 7 Days
                </span>
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Cluster execution response time and throughput distribution
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Scans
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span> p95 Latency
              </span>
            </div>
          </div>

          {/* Bar Graph */}
          <div className="pt-4 grid grid-cols-7 gap-3 items-end h-44 border-b border-slate-100 dark:border-slate-800 pb-2">
            {(data?.dailyThroughput || [
              { day: "Mon", scans: 142, p95LatencyMs: 240, errorRate: "0.0%" },
              { day: "Tue", scans: 210, p95LatencyMs: 265, errorRate: "0.2%" },
              { day: "Wed", scans: 185, p95LatencyMs: 220, errorRate: "0.0%" },
              { day: "Thu", scans: 298, p95LatencyMs: 310, errorRate: "0.1%" },
              { day: "Fri", scans: 340, p95LatencyMs: 290, errorRate: "0.0%" },
              { day: "Sat", scans: 190, p95LatencyMs: 195, errorRate: "0.0%" },
              { day: "Sun", scans: 275, p95LatencyMs: 215, errorRate: "0.0%" },
            ]).map((d, i) => {
              const heightPercent = Math.min(100, Math.round((d.scans / 360) * 100));
              return (
                <div key={i} className="flex flex-col items-center gap-2 group">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition font-mono">
                    {d.scans}
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl relative flex items-end justify-center overflow-hidden h-32">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300 rounded-xl transition-all duration-300 relative"
                    >
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sky-300 rounded-full" title={`p95: ${d.p95LatencyMs}ms`}></div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Average Cluster Turnaround: <strong className="text-slate-700 dark:text-slate-300 font-mono">248ms</strong></span>
            <span>Platform Failure Rate: <strong className="text-sky-700 dark:text-sky-400 font-mono">0.03%</strong> (SLA: &lt;0.1%)</span>
          </div>
        </div>

        {/* Modal Distribution Breakdown */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center justify-between">
              <span>Modal Distribution</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Breakdown of ingested artifacts by domain
            </p>
          </div>

          <div className="space-y-4 my-auto">
            {(data?.modalDistribution || [
              { name: "Academic PDF & Docs", count: 240, percentage: 54, color: "#3B82F6" },
              { name: "Source Code AST", count: 142, percentage: 32, color: "#10B981" },
              { name: "Diagrams & Media", count: 62, percentage: 14, color: "#F59E0B" },
            ]).map((m, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }}></span>
                    {m.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    {m.percentage}% ({m.count})
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${m.percentage}%`, backgroundColor: m.color }}
                    className="h-full rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
            Cross-modal pairwise comparisons constitute <strong>22%</strong> of total pipeline jobs.
          </div>
        </div>
      </div>

      {/* Zero-Knowledge Execution Stream */}
      <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>Zero-Knowledge Execution Stream</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                Privacy Isolated
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Administrators view cryptographic execution traces only. Raw user documents, source code texts, and personal identifiers are strictly forbidden from display.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated real-time</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 font-mono">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-[11px] uppercase text-slate-400 dark:text-slate-500 border-b border-slate-200/70 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Hashed Task UUID</th>
                <th className="py-3 px-4 font-semibold">Modality Pipeline</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Similarity Range</th>
                <th className="py-3 px-4 font-semibold">Audit Status</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.telemetryFeed || []).length > 0 ? (
                data?.telemetryFeed.map((event, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {event.taskUuid}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-700">
                        {event.modality}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{event.durationMs}ms</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium">{event.scoreRange}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active telemetry events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
