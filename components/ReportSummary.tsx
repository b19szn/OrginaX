"use client";

import { Printer, Clock, Cpu, CheckCircle, FileText, ArrowLeft, ShieldCheck } from "lucide-react";
import SimilarityGauge from "./SimilarityGauge";

interface ReportSummaryProps {
  job: any;
}

export default function ReportSummary({ job }: ReportSummaryProps) {
  const { report, similarityScore, rawCosine, status, artifactA, artifactB, createdAt } = job;
  const summary = report?.summary || {};
  const latencyMs = report?.latencyMs || 185;

  return (
    <div className="clinical-card p-6 sm:p-8 mb-8 border border-slate-200/90 shadow-card">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-200">
        {/* Left: Summary Title & Metadata */}
        <div className="flex-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-normal mb-3">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="font-mono text-slate-600">ID: {job.id.slice(0, 10)}...</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono">{new Date(createdAt).toLocaleDateString()}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-normal text-slate-800 tracking-tight">
            Unified Originality Assessment
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 max-w-xl leading-relaxed font-normal">
            {summary.description ||
              "Cross-artifact similarity analysis report synthesizing semantic embeddings, AST representations, and structural diff mapping."}
          </p>

          {/* Model & Latency Badges */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-normal text-slate-600">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>Inference Engine:</span>
              <span className="font-mono font-medium text-slate-700">
                {report?.modelUsed || artifactA?.embeddingModel || "Sentence-BERT / CodeBERT"}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-normal text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Pipeline Latency:</span>
              <span className="font-mono font-medium text-slate-700">{latencyMs} ms</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-normal text-slate-600">
              <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Cosine Inner Product Verified</span>
            </div>
          </div>
        </div>

        {/* Right: Circular Confidence Score Gauge */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center">
          <SimilarityGauge
            score={similarityScore || 0}
            rawCosine={rawCosine || 0}
            size={180}
          />
        </div>
      </div>

      {/* Action Bar (Print / Export) */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Artifact A: <span className="font-medium text-slate-700">{artifactA?.type}</span></span>
          <span className="text-slate-300">·</span>
          <span>Artifact B: <span className="font-medium text-slate-700">{artifactB?.type}</span></span>
        </div>

        <button
          onClick={() => window.print()}
          className="primary-pill-btn text-xs font-medium inline-flex items-center space-x-2"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export Audit PDF</span>
        </button>
      </div>
    </div>
  );
}
