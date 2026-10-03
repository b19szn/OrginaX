"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Code2,
  Image as ImageIcon,
  RefreshCw,
  Users,
  Grid,
  Sparkles,
} from "lucide-react";

export interface ClassroomBatchSummary {
  id: string;
  title: string;
  createdAt: string;
  studentCount: number;
  comparisonsCount: number;
  modality: string;
  averageSimilarity: number;
  highestSimilarity: number;
  highRiskCount: number;
  moderateRiskCount: number;
  topRiskPair?: string;
  files: string[];
}

interface RecentJobsTableProps {
  jobs: any[];
  batches?: ClassroomBatchSummary[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectBatch?: (batchId: string) => void;
}

export default function RecentJobsTable({
  jobs,
  batches = [],
  isLoading,
  onRefresh,
  onSelectBatch,
}: RecentJobsTableProps) {
  const [activeTab, setActiveTab] = useState<"batches" | "pairwise">("batches");

  const getCleanFilename = (artifact: any) => {
    if (!artifact?.originalFileUrl) return artifact?.type || "Artifact";
    const name = artifact.originalFileUrl.split("/").pop() || "";
    return name.replace(/^\d+-/, "");
  };

  const getModalityIcon = (type: string) => {
    switch (type) {
      case "CODE":
        return <Code2 className="w-3.5 h-3.5 text-emerald-600" />;
      case "IMAGE":
        return <ImageIcon className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-orange-600" />;
    }
  };

  const getModalityPillClass = (type: string) => {
    switch (type) {
      case "CODE":
        return "bg-emerald-50/90 text-emerald-800 border-emerald-200";
      case "IMAGE":
        return "bg-blue-50/90 text-blue-800 border-blue-200";
      default:
        return "bg-orange-50/90 text-orange-800 border-orange-200";
    }
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null || score === undefined) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          Pending
        </span>
      );
    }
    if (score >= 70) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          {score.toFixed(1)}% (High Risk)
        </span>
      );
    }
    if (score >= 35) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          {score.toFixed(1)}% (Moderate)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
        {score.toFixed(1)}% (Original)
      </span>
    );
  };

  return (
    <div
      id="audit-section"
      className="multimodal-card overflow-hidden border border-slate-200/90 shadow-md bg-white/90 backdrop-blur-md rounded-2xl"
    >
      {/* Table Header Bar with Navigation Tabs */}
      <div className="bg-gradient-to-r from-slate-50/90 via-teal-50/30 to-blue-50/30 border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">
              Audit Trail &amp; Analysis History
            </h3>
            <span className="text-xs text-slate-400 font-normal">· Real-time logs</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified records of classroom batch cross-examinations and 1-on-1 comparison jobs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/60 text-xs">
            <button
              onClick={() => setActiveTab("batches")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "batches"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Classroom Batches ({batches.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("pairwise")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "pairwise"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>All Pairwise Checks ({jobs.length})</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
            title="Refresh history"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? "animate-spin text-slate-700" : ""}`}
            />
            <span className="hidden sm:inline">{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Classroom Batches Tab Content */}
      {activeTab === "batches" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-medium uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">Assignment / Class Title</th>
                <th className="py-3 px-6">Format</th>
                <th className="py-3 px-6">Roster Size</th>
                <th className="py-3 px-6">Cross-Checks</th>
                <th className="py-3 px-6">Collusion Alert</th>
                <th className="py-3 px-6">Class Mean Match</th>
                <th className="py-3 px-6">Analyzed At</th>
                <th className="py-3 px-6 text-right">Classroom Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-normal">
                    No classroom batches analyzed yet. Use the Classroom Batch mode above to upload multiple student files at once.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-normal text-slate-800 max-w-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <span>{batch.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-700 border border-teal-100">
                          Class Batch
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 truncate">
                        Files: {batch.files.slice(0, 3).join(", ")}
                        {batch.files.length > 3 && ` +${batch.files.length - 3} more`}
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md border text-xs font-medium ${getModalityPillClass(
                          batch.modality
                        )}`}
                      >
                        {getModalityIcon(batch.modality)}
                        <span>{batch.modality}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-6 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{batch.studentCount} Students</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-slate-600 font-medium">
                      {batch.comparisonsCount} Pairs
                    </td>

                    <td className="py-3.5 px-6">
                      {batch.highRiskCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          {batch.highRiskCount} High Risk ({batch.highestSimilarity}%)
                        </span>
                      ) : batch.moderateRiskCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          {batch.moderateRiskCount} Paraphrased
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          Low Overlap
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 font-mono font-medium text-slate-700">
                      {batch.averageSimilarity.toFixed(1)}%
                    </td>

                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(batch.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      {onSelectBatch ? (
                        <button
                          onClick={() => onSelectBatch(batch.id)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium transition-all border border-teal-200/80 shadow-2xs"
                        >
                          <Grid className="w-3 h-3 text-teal-600" />
                          <span>Open Class Matrix</span>
                        </button>
                      ) : (
                        <Link
                          href={`#upload-section`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium transition-all border border-teal-200/80 shadow-2xs"
                        >
                          <span>Open Matrix</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* All Pairwise Comparisons Tab Content */}
      {activeTab === "pairwise" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-medium uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-6">Comparison Subject / Files</th>
                <th className="py-3 px-6">Modalities</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Similarity Score</th>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6 text-right">Deep Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-normal">
                    No comparisons logged yet. Use the upload panel above or click &quot;Load Demo Benchmark Pairs&quot;.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-normal text-slate-800 max-w-sm">
                      <div className="font-semibold text-slate-800 flex items-center space-x-1.5 truncate">
                        <span className="truncate">{getCleanFilename(job.artifactA)}</span>
                        <span className="text-slate-400 font-normal">&harr;</span>
                        <span className="truncate">{getCleanFilename(job.artifactB)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                        <span className="truncate">{job.submission?.title || "Multi-Modal Pair Comparison"}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md border text-xs font-medium ${getModalityPillClass(
                            job.artifactA?.type
                          )}`}
                        >
                          {getModalityIcon(job.artifactA?.type)}
                          <span>{job.artifactA?.type}</span>
                        </span>
                        <span className="text-slate-400">&harr;</span>
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md border text-xs font-medium ${getModalityPillClass(
                            job.artifactB?.type
                          )}`}
                        >
                          {getModalityIcon(job.artifactB?.type)}
                          <span>{job.artifactB?.type}</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center space-x-1.5 font-medium ${
                          job.status === "COMPLETE"
                            ? "text-slate-800"
                            : job.status === "FAILED"
                            ? "text-red-700"
                            : "text-amber-700"
                        }`}
                      >
                        {job.status === "COMPLETE" && <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />}
                        {job.status === "PENDING" && <Clock className="w-3.5 h-3.5 animate-spin" />}
                        {job.status === "FAILED" && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{job.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-6 font-mono font-medium">
                      {getScoreBadge(job.similarityScore)}
                    </td>

                    <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(job.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/report/${job.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-800 font-medium transition-all border border-slate-200 hover:border-slate-300 shadow-2xs"
                      >
                        <span>Inspect Diff</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
