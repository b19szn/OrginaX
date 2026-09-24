"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Filter,
} from "lucide-react";

export interface BatchResultData {
  submissionId: string;
  assignmentTitle: string;
  modality: string;
  files: Array<{
    index: number;
    id: string;
    name: string;
    size: number;
    tokenCount: number;
  }>;
  matrix: Array<Array<{
    similarity: number;
    jobId: string | null;
    status: "self" | "high" | "moderate" | "low";
  }>>;
  flaggedPairs: Array<{
    pairKey: string;
    fileA: { index: number; name: string; id: string };
    fileB: { index: number; name: string; id: string };
    similarity: number;
    rawCosine: number;
    status: "high" | "moderate" | "low";
    jobId: string;
  }>;
  summary: {
    totalStudents: number;
    totalComparisons: number;
    highRiskCount: number;
    moderateRiskCount: number;
    safeCount: number;
    averageSimilarity: number;
    highestSimilarity: number;
    topRiskPair?: string;
  };
}

interface ClassroomMatrixViewProps {
  data: BatchResultData;
  onReset: () => void;
}

export default function ClassroomMatrixView({ data, onReset }: ClassroomMatrixViewProps) {
  const [filter, setFilter] = useState<"all" | "high" | "moderate">("all");
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
    score: number;
    jobId: string | null;
  } | null>(null);

  const filteredPairs = data.flaggedPairs.filter((pair) => {
    if (filter === "high") return pair.status === "high";
    if (filter === "moderate") return pair.status === "moderate";
    return true;
  });

  const getCellBg = (similarity: number, isSelf: boolean) => {
    if (isSelf) return "bg-slate-100/60 text-slate-300 font-normal";
    if (similarity >= 70) return "bg-rose-100/70 text-rose-700 hover:bg-rose-200/80 font-medium cursor-pointer shadow-sm border border-rose-200/80";
    if (similarity >= 35) return "bg-amber-100/60 text-amber-700 hover:bg-amber-200/70 font-medium cursor-pointer border border-amber-200/60";
    return "bg-slate-50/70 text-slate-500 hover:bg-slate-100 font-normal cursor-pointer border border-slate-100";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Users className="w-3 h-3 text-indigo-500" />
              Classroom Cross-Examination Report
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {data.modality} Evaluation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
            {data.assignmentTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Cross-evaluated {data.summary.totalStudents} student submissions across{" "}
            {data.summary.totalComparisons} unique pairwise combinations.
          </p>
        </div>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          Analyze Another Batch
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-sm">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Submissions</div>
          <div className="text-2xl font-semibold text-slate-800 mt-1">{data.summary.totalStudents}</div>
          <div className="text-xs text-slate-500 mt-0.5">Student files loaded</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-sm">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cross-Checks</div>
          <div className="text-2xl font-semibold text-slate-800 mt-1">{data.summary.totalComparisons}</div>
          <div className="text-xs text-slate-500 mt-0.5">All-vs-all pairs</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 shadow-sm">
          <div className="text-xs font-medium text-rose-500 uppercase tracking-wider">High Collusion</div>
          <div className="text-2xl font-semibold text-rose-600 mt-1">{data.summary.highRiskCount}</div>
          <div className="text-xs text-rose-500/80 mt-0.5">Pairs &ge; 70% Match</div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 shadow-sm">
          <div className="text-xs font-medium text-amber-500 uppercase tracking-wider">Paraphrased</div>
          <div className="text-2xl font-semibold text-amber-600 mt-1">{data.summary.moderateRiskCount}</div>
          <div className="text-xs text-amber-600/80 mt-0.5">Pairs 35% - 69%</div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 shadow-sm col-span-2 md:col-span-1">
          <div className="text-xs font-medium text-indigo-500 uppercase tracking-wider">Class Average</div>
          <div className="text-2xl font-semibold text-indigo-700 mt-1">{data.summary.averageSimilarity}%</div>
          <div className="text-xs text-indigo-500/80 mt-0.5">Mean similarity score</div>
        </div>
      </div>

      {/* Main Grid: Heatmap Matrix */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Classroom Similarity Heatmap Matrix (N &times; N)
            </h3>
            <p className="text-xs text-slate-500">
              Click any colored cell to jump straight to the side-by-side Cross-Sentence Semantic Alignment report.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-100 border border-rose-200"></span>
              High (&ge; 70%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></span>
              Moderate (35-69%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span>
              Low (&lt; 35%)
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto pb-2">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-medium text-slate-400 bg-slate-50/50 border border-slate-100 rounded-tl-lg">
                  Student / File
                </th>
                {data.files.map((file, idx) => (
                  <th
                    key={file.id || idx}
                    className="p-2 text-center text-xs font-medium text-slate-600 bg-slate-50/50 border border-slate-100 max-w-[130px] truncate"
                    title={file.name}
                  >
                    <span className="inline-block truncate max-w-[110px]">
                      #{idx + 1} {file.name.replace(/\.[^/.]+$/, "")}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td
                    className="p-2.5 text-xs font-medium text-slate-700 bg-slate-50/30 border border-slate-100 max-w-[180px] truncate"
                    title={data.files[rIdx]?.name}
                  >
                    <span className="text-slate-400 mr-1.5">#{rIdx + 1}</span>
                    {data.files[rIdx]?.name}
                  </td>
                  {row.map((cell, cIdx) => {
                    const isSelf = rIdx === cIdx;
                    return (
                      <td key={cIdx} className="p-1 border border-slate-100/80 text-center">
                        {isSelf ? (
                          <div
                            className="w-full py-2 rounded-lg bg-slate-100/80 text-slate-400 text-xs font-medium border border-slate-200/60"
                            title="Identity: Document compared to itself (100% match)"
                          >
                            100% <span className="text-[10px] text-slate-400 font-normal">(Self)</span>
                          </div>
                        ) : cell.jobId ? (
                          <Link
                            href={`/report/${cell.jobId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() =>
                              setHoveredCell({
                                row: rIdx,
                                col: cIdx,
                                score: cell.similarity,
                                jobId: cell.jobId,
                              })
                            }
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`block w-full py-2 rounded-lg text-xs transition-all ${getCellBg(
                              cell.similarity,
                              false
                            )}`}
                            title={`Compare #${rIdx + 1} & #${cIdx + 1}: ${cell.similarity}% Match. Click to open deep report.`}
                          >
                            {cell.similarity}%
                          </Link>
                        ) : (
                          <div
                            className={`w-full py-2 rounded-lg text-xs ${getCellBg(
                              cell.similarity,
                              false
                            )}`}
                          >
                            {cell.similarity}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hoveredCell && (
          <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between">
            <span>
              Comparing{" "}
              <strong className="text-slate-700 font-medium">
                {data.files[hoveredCell.row]?.name}
              </strong>{" "}
              &harr;{" "}
              <strong className="text-slate-700 font-medium">
                {data.files[hoveredCell.col]?.name}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-indigo-600 font-medium">
              Similarity: {hoveredCell.score}% (Click to open full diff)
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>

      {/* Flagged Pairs Leaderboard */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Ranked Collusion &amp; Similarity Watchlist
            </h3>
            <p className="text-xs text-slate-500">
              Student pairs ranked by highest cross-document similarity.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Pairs ({data.flaggedPairs.length})
            </button>
            <button
              onClick={() => setFilter("high")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === "high"
                  ? "bg-white text-rose-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              High Risk ({data.summary.highRiskCount})
            </button>
            <button
              onClick={() => setFilter("moderate")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === "moderate"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Moderate ({data.summary.moderateRiskCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-medium text-slate-400">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Student File A</th>
                <th className="py-2.5 px-3 text-center">&harr;</th>
                <th className="py-2.5 px-3">Student File B</th>
                <th className="py-2.5 px-3">Similarity</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
                <th className="py-2.5 px-3 text-right">Deep Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredPairs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No pairs matching this filter threshold.
                  </td>
                </tr>
              ) : (
                filteredPairs.map((pair, idx) => {
                  return (
                    <tr
                      key={pair.pairKey}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-3 font-medium text-slate-400">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 max-w-[200px] truncate">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{pair.fileA.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300 font-medium">
                        &harr;
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 max-w-[200px] truncate">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{pair.fileB.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 w-10">
                            {pair.similarity}%
                          </span>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pair.similarity >= 70
                                  ? "bg-rose-500"
                                  : pair.similarity >= 35
                                  ? "bg-amber-500"
                                  : "bg-slate-300"
                              }`}
                              style={{ width: `${pair.similarity}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {pair.status === "high" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            High Risk / Collusion
                          </span>
                        ) : pair.status === "moderate" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Suspected Paraphrasing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                            <CheckCircle2 className="w-3 h-3 text-slate-400" />
                            Original / Low Match
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/report/${pair.jobId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100 transition-all shadow-sm"
                        >
                          Inspect Diff
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
