"use client";

import { FileText, Code2, AlertTriangle, Zap, CheckCircle2, TrendingUp } from "lucide-react";

interface MetricsData {
  totalSubmissions: number;
  totalComparisons: number;
  highSimilarityCount: number;
  modalityCount: Record<string, number>;
  avgLatencyMs: number;
}

interface StatCardsProps {
  metrics: MetricsData;
}

export default function StatCards({ metrics }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      {/* 1. TEXT / ARTIFACTS CARD - Blue Reference Theme */}
      <div className="multimodal-card p-6 bg-gradient-to-br from-blue-50/90 via-white/95 to-sky-50/60 border border-blue-200/90 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-normal uppercase tracking-wider text-slate-500">
            Active Artifacts
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-100/90 border border-blue-300/80 flex items-center justify-center text-blue-700 shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-normal text-slate-800 tracking-tight">
            {metrics.totalSubmissions}
          </div>
          <p className="text-xs font-normal text-slate-500 mt-1.5 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-600">Across {metrics.totalComparisons} comparison pairs</span>
          </p>
        </div>
      </div>

      {/* 2. CODE AST / MODALITY BALANCE - Green Reference Theme */}
      <div className="multimodal-card p-6 bg-gradient-to-br from-emerald-50/90 via-white/95 to-teal-50/60 border border-emerald-200/90 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/5 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-normal uppercase tracking-wider text-slate-500">
            Modality Balance
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-100/90 border border-emerald-300/80 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Code2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-normal text-slate-800 tracking-tight flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium">
              <span>{metrics.modalityCount?.TEXT || 0}</span>
              <span className="text-[10px] text-orange-600">TXT</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span>{metrics.modalityCount?.CODE || 0}</span>
              <span className="text-[10px] text-emerald-600">AST</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
              <span>{metrics.modalityCount?.IMAGE || 0}</span>
              <span className="text-[10px] text-blue-600">IMG</span>
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-2 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-600">Unified Joint Embedding Space</span>
          </p>
        </div>
      </div>

      {/* 3. PLAGIARISM RISK FLAGS - Orange Reference Theme */}
      <div className="multimodal-card p-6 bg-gradient-to-br from-orange-50/90 via-white/95 to-amber-50/60 border border-orange-200/90 hover:border-orange-400 hover:shadow-md hover:shadow-orange-500/5 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-normal uppercase tracking-wider text-slate-500">
            High Similarity Flags
          </span>
          <div className="w-9 h-9 rounded-xl bg-orange-100/90 border border-orange-300/80 flex items-center justify-center text-orange-700 shadow-2xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-normal text-slate-800 tracking-tight flex items-baseline space-x-2">
            <span>{metrics.highSimilarityCount}</span>
            <span className="text-xs font-medium text-orange-800 bg-orange-100/90 border border-orange-300/80 px-2.5 py-0.5 rounded-full">
              &gt; 85% Score
            </span>
          </div>
          <p className="text-xs font-normal text-slate-600 mt-1.5">
            Cloned structures flagged
          </p>
        </div>
      </div>

      {/* 4. LATENCY & THROUGHPUT - Sky Blue Theme */}
      <div className="multimodal-card p-6 bg-gradient-to-br from-sky-50/90 via-white/95 to-blue-50/60 border border-sky-200/90 hover:border-sky-400 hover:shadow-md hover:shadow-sky-500/5 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-normal uppercase tracking-wider text-slate-500">
            Pipeline Latency
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-100/90 border border-sky-300/80 flex items-center justify-center text-sky-700 shadow-2xs">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-normal text-slate-800 tracking-tight flex items-baseline space-x-1.5">
            <span>{metrics.avgLatencyMs}</span>
            <span className="text-sm font-medium text-sky-700">ms</span>
          </div>
          <p className="text-xs font-normal text-slate-600 mt-1.5">
            End-to-end vector extraction
          </p>
        </div>
      </div>
    </div>
  );
}
