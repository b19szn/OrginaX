"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Sparkles,
  Users,
  Code2,
  Image as ImageIcon,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
  Zap,
  Activity,
  AlertTriangle,
  Clock,
  Layers,
  GraduationCap,
} from "lucide-react";
import UploadDashboard from "@/components/UploadDashboard";
import RecentJobsTable, { ClassroomBatchSummary } from "@/components/RecentJobsTable";
import AstVectorizerLab from "@/components/AstVectorizerLab";
import VisualDiagramLab from "@/components/VisualDiagramLab";
import InstructorClassroom from "@/components/InstructorClassroom";

function InstructorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  const [jobs, setJobs] = useState<any[]>([]);
  const [batches, setBatches] = useState<ClassroomBatchSummary[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalSubmissions: 0,
    totalComparisons: 0,
    highSimilarityCount: 0,
    modalityCount: { TEXT: 0, CODE: 0, IMAGE: 0 },
    avgLatencyMs: 180,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchJobsAndMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
        setBatches(data.batches || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobsAndMetrics();
  }, []);

  const handleSelectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    router.push("/instructor?tab=batch");
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchJobsAndMetrics();
      } else {
        alert(data.error || "Failed to seed demo data.");
      }
    } catch (err: any) {
      alert("Error seeding benchmark pairs: " + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  // ---------------- TAB: CLASSES & GRADING ----------------
  if (activeTab === "classroom") {
    return <InstructorClassroom />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ---------------- TAB 1: OVERVIEW ---------------- */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Header Title & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                Faculty Evaluator Overview
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Multi-modal similarity analysis, course cohorts, and real-time plagiarism telemetry.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchJobsAndMetrics}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
                <span>Sync telemetry</span>
              </button>

              <button
                onClick={handleSeedDemo}
                disabled={isSeeding}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#334155] text-white hover:bg-[#1e293b] transition shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSeeding ? "Seeding..." : "Load Demo Pairs"}</span>
              </button>
            </div>
          </div>

          {/* 6 KPI METRIC CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Submissions */}
            <Link
              href="/instructor?tab=reports"
              className="group p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-800">
                  {isLoading ? "..." : metrics.totalSubmissions}
                </div>
                <div className="text-sm font-medium text-slate-400 mt-0.5">
                  Ingested Submissions
                </div>
              </div>
            </Link>

            {/* Card 2: Comparisons */}
            <Link
              href="/instructor?tab=pairwise"
              className="group p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Zap className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-800">
                  {isLoading ? "..." : metrics.totalComparisons}
                </div>
                <div className="text-sm font-medium text-slate-400 mt-0.5">
                  Multi-Modal Comparisons
                </div>
              </div>
            </Link>

            {/* Card 3: High Similarity Flags */}
            <Link
              href="/instructor?tab=reports"
              className="group p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <div className="text-3xl font-extrabold tracking-tight text-rose-600">
                  {isLoading ? "..." : metrics.highSimilarityCount}
                </div>
                <div className="text-sm font-medium text-slate-400 mt-0.5">
                  High Similarity Flags (&gt;75%)
                </div>
              </div>
            </Link>

            {/* Card 4: Modality Breakdown */}
            <div className="group p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>

              <div>
                <div className="text-2xl font-extrabold tracking-tight text-slate-800">
                  {metrics.modalityCount.TEXT}T · {metrics.modalityCount.CODE}C · {metrics.modalityCount.IMAGE}V
                </div>
                <div className="text-sm font-medium text-slate-400 mt-0.5">
                  Text / Code AST / Visual Graphics
                </div>
              </div>
            </div>

            {/* Card 5: System Latency */}
            <div className="group p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-2xs">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  Real-time
                </span>
              </div>

              <div>
                <div className="text-3xl font-extrabold tracking-tight text-slate-800">
                  {metrics.avgLatencyMs || 180}ms
                </div>
                <div className="text-sm font-medium text-slate-400 mt-0.5">
                  Average Inner-Product Latency
                </div>
              </div>
            </div>

            {/* Card 6: Course Classroom Suite */}
            <Link
              href="/instructor?tab=classroom"
              className="group p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Classroom
                </span>
              </div>

              <div>
                <div className="text-xl font-bold tracking-tight text-slate-800">
                  Classes &amp; Grading
                </div>
                <div className="text-xs font-medium text-slate-400 mt-0.5">
                  Manage assignment report release &amp; grades →
                </div>
              </div>
            </Link>
          </div>

          {/* 5 FEATURE TILES (Simple, clear names with zero jargon) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Tile 1: Classes & Grading */}
            <Link
              href="/instructor?tab=classroom"
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-all">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Classes &amp; Grading
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage student classes, grade submissions, and toggle plagiarism report visibility.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Manage Classes</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 2: Compare 2 Files */}
            <Link
              href="/instructor?tab=pairwise"
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-all">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Compare 2 Files
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  One-on-one document and code comparison with side-by-side highlighted diffs.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                <span>Compare Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 3: Classroom Batch */}
            <Link
              href="/instructor?tab=batch"
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-teal-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-3 group-hover:scale-105 transition-all">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Classroom Batch
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cross-examine an entire cohort with an automated N×N collusion heatmap.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>Open Matrix</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 4: Code Plagiarism */}
            <Link
              href="/instructor?tab=ast-code"
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-105 transition-all">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Code Plagiarism
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Abstract Syntax Tree matching that detects plagiarism even with renamed variables.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700">
                <span>Check Code AST</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Tile 5: Image & Diagrams */}
            <Link
              href="/instructor?tab=diagrams"
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-300 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-all">
                  <ImageIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Image &amp; Diagrams
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Visual similarity and perceptual layout matching for charts and diagrams.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
                <span>Inspect Figures</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Recent Jobs Overview Table */}
          <RecentJobsTable
            jobs={jobs}
            batches={batches}
            isLoading={isLoading}
            onRefresh={fetchJobsAndMetrics}
            onSelectBatch={handleSelectBatch}
          />
        </div>
      )}

      {/* ---------------- TAB 2: COMPARE 2 FILES ---------------- */}
      {activeTab === "pairwise" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                Compare 2 Files
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                One-on-one multi-modal comparison across text papers, source code, and visual graphics.
              </p>
            </div>
          </div>

          <UploadDashboard
            defaultMode="pairwise"
            onJobCreated={fetchJobsAndMetrics}
            loadBatchId={null}
          />
        </div>
      )}

      {/* ---------------- TAB 3: CLASSROOM BATCH ---------------- */}
      {activeTab === "batch" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                Classroom Batch Analysis
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Automated cross-similarity matrix and collusion heatmap for multi-student cohorts.
              </p>
            </div>
          </div>

          <UploadDashboard
            defaultMode="batch"
            onJobCreated={fetchJobsAndMetrics}
            loadBatchId={selectedBatchId}
            onBatchLoaded={() => setSelectedBatchId(null)}
          />
        </div>
      )}

      {/* ---------------- TAB 4: CODE PLAGIARISM ---------------- */}
      {activeTab === "ast-code" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                Code Plagiarism Lab
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Abstract Syntax Tree structural analysis demonstrating invariance against variable and function renaming.
              </p>
            </div>
          </div>

          <AstVectorizerLab />
        </div>
      )}

      {/* ---------------- TAB 5: IMAGE & DIAGRAMS ---------------- */}
      {activeTab === "diagrams" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                Image &amp; Diagram Checker
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Perceptual hashing and visual patch alignment across scientific charts and architectural flowcharts.
              </p>
            </div>
          </div>

          <VisualDiagramLab />
        </div>
      )}

      {/* ---------------- TAB 6: REPORTS & HISTORY ---------------- */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
                Reports &amp; History
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Historical records, similarity confidence scores, and detailed originality audit logs.
              </p>
            </div>

            <button
              onClick={fetchJobsAndMetrics}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span>Refresh logs</span>
            </button>
          </div>

          <RecentJobsTable
            jobs={jobs}
            batches={batches}
            isLoading={isLoading}
            onRefresh={fetchJobsAndMetrics}
            onSelectBatch={handleSelectBatch}
          />
        </div>
      )}
    </div>
  );
}

export default function InstructorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Instructor Suite...</div>}>
      <InstructorContent />
    </Suspense>
  );
}
