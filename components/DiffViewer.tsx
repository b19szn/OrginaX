"use client";

import { useState } from "react";
import { Check, Copy, Eye, FileText, Code2, Sparkles } from "lucide-react";

interface TextDiffSpan {
  id: string;
  sourceText: string;
  targetText?: string;
  similarity: number;
  status: "matched" | "modified" | "unique";
}

interface TextDiffReport {
  overallSimilarity: number;
  matchedCount: number;
  modifiedCount: number;
  uniqueCount: number;
  spansA: TextDiffSpan[];
  spansB: TextDiffSpan[];
}

interface CodeDiffLine {
  lineNumber: number;
  content: string;
  status: "identical" | "refactored" | "unique";
  similarity: number;
  matchedLineNumber?: number;
}

interface CodeDiffReport {
  overallSimilarity: number;
  structuralSimilarity: number;
  identicalLinesCount: number;
  refactoredLinesCount: number;
  uniqueLinesCount: number;
  linesA: CodeDiffLine[];
  linesB: CodeDiffLine[];
}

interface DiffViewerProps {
  modality: "TEXT" | "CODE" | "IMAGE" | "PDF" | string;
  diffData: any;
  artifactAName?: string;
  artifactBName?: string;
}

export default function DiffViewer({
  modality,
  diffData,
  artifactAName = "Artifact A (Reference Source)",
  artifactBName = "Artifact B (Suspect Submission)",
}: DiffViewerProps) {
  const [activeSpanId, setActiveSpanId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "MATCHED" | "MODIFIED">("ALL");

  if (!diffData) {
    return (
      <div className="p-8 text-center text-slate-400">
        No detailed diff structure available for this comparison.
      </div>
    );
  }

  // 1. TEXT DIFF VIEW
  if (modality === "TEXT" || modality === "PDF") {
    const report = diffData as TextDiffReport;

    return (
      <div className="clinical-card overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-medium">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-800">
                Cross-Sentence Semantic Alignment
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Sentence-BERT embedding distance mapped to localized sentence clusters
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filter === "ALL"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Sentences
            </button>
            <button
              onClick={() => setFilter("MATCHED")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                filter === "MATCHED"
                  ? "bg-red-600 text-white"
                  : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              }`}
            >
              <span>Matched ({report.matchedCount})</span>
            </button>
            <button
              onClick={() => setFilter("MODIFIED")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                filter === "MODIFIED"
                  ? "bg-amber-600 text-white"
                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span>Paraphrased ({report.modifiedCount})</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white border-b border-slate-100 px-6 py-2.5 flex items-center space-x-6 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span className="font-normal text-slate-600">Verbatim Match (&ge; 70%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span className="font-normal text-slate-600">Semantic Paraphrase (35-69%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
            <span className="font-normal text-slate-600">Unique / Original</span>
          </div>
        </div>

        {/* Side-by-Side Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Artifact A */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-normal uppercase tracking-wider text-slate-500">
                {artifactAName}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                {report.spansA?.length || 0} sentences
              </span>
            </div>

            <div className="space-y-3 font-sans text-sm leading-relaxed">
              {report.spansA?.map((span, idx) => {
                if (filter === "MATCHED" && span.status !== "matched") return null;
                if (filter === "MODIFIED" && span.status !== "modified") return null;

                const isMatched = span.status === "matched";
                const isModified = span.status === "modified";
                const isActive = activeSpanId === span.id;

                return (
                  <div
                    key={span.id}
                    onMouseEnter={() => setActiveSpanId(span.id)}
                    onMouseLeave={() => setActiveSpanId(null)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isMatched
                        ? "bg-red-50/70 border-red-200 hover:bg-red-100/70"
                        : isModified
                        ? "bg-amber-50/70 border-amber-200 hover:bg-amber-100/70"
                        : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/50"
                    } ${isActive ? "ring-2 ring-slate-400 shadow-sm" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-normal text-slate-400">
                        § {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isMatched
                            ? "bg-red-100 text-red-700"
                            : isModified
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {span.similarity}% Sim
                      </span>
                    </div>
                    <p className="text-slate-800 font-normal">{span.sourceText}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Artifact B */}
          <div className="p-6 bg-slate-50/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-normal uppercase tracking-wider text-slate-500">
                {artifactBName}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                {report.spansB?.length || 0} sentences
              </span>
            </div>

            <div className="space-y-3 font-sans text-sm leading-relaxed">
              {report.spansB?.map((span, idx) => {
                if (filter === "MATCHED" && span.status !== "matched") return null;
                if (filter === "MODIFIED" && span.status !== "modified") return null;

                const isMatched = span.status === "matched";
                const isModified = span.status === "modified";

                return (
                  <div
                    key={span.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isMatched
                        ? "bg-red-50/70 border-red-200"
                        : isModified
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-normal text-slate-400">
                        § {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isMatched
                            ? "bg-red-100 text-red-700"
                            : isModified
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {span.similarity}% Sim
                      </span>
                    </div>
                    <p className="text-slate-800 font-normal">{span.sourceText}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CODE DIFF VIEW
  if (modality === "CODE") {
    const report = diffData as CodeDiffReport;

    return (
      <div className="clinical-card overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-medium">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-800">
                AST Structural &amp; Line-Level Analysis
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                CodeBERT token sequence comparison across variable renaming &amp; syntactic inversion
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-normal">
            <span className="px-3 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Structural Invariance: {report.structuralSimilarity}%
            </span>
            <span className="px-3 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Identical Lines: {report.identicalLinesCount}
            </span>
            <span className="px-3 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Refactored: {report.refactoredLinesCount}
            </span>
          </div>
        </div>

        {/* Code Grid (Clean Light Mode, Zero Dark) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 font-mono text-xs bg-slate-50/50">
          {/* Artifact A */}
          <div className="p-4 bg-slate-50/70 text-slate-800 overflow-x-auto">
            <div className="text-xs font-medium text-slate-500 pb-2 mb-2 border-b border-slate-200">
              {artifactAName}
            </div>
            {report.linesA?.map((line) => {
              const isIdentical = line.status === "identical";
              const isRefactored = line.status === "refactored";

              return (
                <div
                  key={line.lineNumber}
                  className={`flex items-start py-0.5 px-2 rounded ${
                    isIdentical
                      ? "bg-rose-50 text-rose-800 border-l-2 border-rose-400"
                      : isRefactored
                      ? "bg-amber-50 text-amber-800 border-l-2 border-amber-400"
                      : "text-slate-700"
                  }`}
                >
                  <span className="w-8 select-none text-slate-400 text-right pr-3 font-mono">
                    {line.lineNumber}
                  </span>
                  <pre className="flex-1 font-mono whitespace-pre-wrap">{line.content}</pre>
                  {isRefactored && (
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded ml-2">
                      refactored
                    </span>
                  )}
                  {isIdentical && (
                    <span className="text-[10px] text-rose-700 bg-rose-100 px-1 rounded ml-2">
                      identical
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Artifact B */}
          <div className="p-4 bg-slate-50/70 text-slate-800 overflow-x-auto">
            <div className="text-xs font-medium text-slate-500 pb-2 mb-2 border-b border-slate-200">
              {artifactBName}
            </div>
            {report.linesB?.map((line) => {
              const isIdentical = line.status === "identical";
              const isRefactored = line.status === "refactored";

              return (
                <div
                  key={line.lineNumber}
                  className={`flex items-start py-0.5 px-2 rounded ${
                    isIdentical
                      ? "bg-rose-50 text-rose-800 border-l-2 border-rose-400"
                      : isRefactored
                      ? "bg-amber-50 text-amber-800 border-l-2 border-amber-400"
                      : "text-slate-700"
                  }`}
                >
                  <span className="w-8 select-none text-slate-400 text-right pr-3 font-mono">
                    {line.lineNumber}
                  </span>
                  <pre className="flex-1 font-mono whitespace-pre-wrap">{line.content}</pre>
                  {line.matchedLineNumber && (
                    <span className="text-[10px] text-slate-400 ml-2">
                      &rarr; L{line.matchedLineNumber}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
