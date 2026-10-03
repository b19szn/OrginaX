"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileText,
  Code2,
  Image as ImageIcon,
} from "lucide-react";
import ReportSummary from "@/components/ReportSummary";
import DiffViewer from "@/components/DiffViewer";
import ImageHeatmapOverlay from "@/components/ImageHeatmapOverlay";

export default function ReportPage() {
  const params = useParams();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/report/${jobId}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to load report data.");
      }
      setJob(data.job);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    fetchJob();

    // Poll if not complete
    const interval = setInterval(() => {
      if (job && (job.status === "COMPLETE" || job.status === "FAILED")) {
        clearInterval(interval);
      } else {
        fetchJob();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [jobId, job?.status]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-slate-700 animate-spin" />
        <p className="text-sm font-normal text-slate-600">
          Synthesizing cross-artifact originality report...
        </p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-medium text-slate-800">Report Unavailable</h2>
        <p className="text-sm text-slate-500 font-normal">{error || "Job not found."}</p>
        <Link
          href="/dashboard"
          className="primary-pill-btn text-xs font-medium inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const { artifactA, artifactB, status, report } = job;
  const modality = artifactA?.type || "TEXT";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-normal text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center space-x-2 text-xs font-normal text-slate-500">
          <span>Modality:</span>
          <span className="font-normal text-slate-700 uppercase px-2 py-0.5 rounded bg-slate-200">
            {modality}
          </span>
        </div>
      </div>

      {/* Processing or Failed Notice */}
      {status !== "COMPLETE" && (
        <div
          className={`p-4 rounded-xl border flex items-center space-x-3 text-xs font-normal ${
            status === "FAILED"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
          }`}
        >
          {status === "FAILED" ? (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">Pipeline Status: {status}</p>
            <p className="text-slate-600">
              {job.errorMessage || "The multi-modal inference pipeline is actively processing."}
            </p>
          </div>
        </div>
      )}

      {/* Executive Report Summary with Radial Gauge */}
      <ReportSummary job={job} />

      {/* Detailed Modality Visualization */}
      {modality === "IMAGE" ? (
        <ImageHeatmapOverlay
          diffData={report?.diff}
          imageAUrl={artifactA?.originalFileUrl}
          imageBUrl={artifactB?.originalFileUrl}
        />
      ) : (
        <DiffViewer
          modality={modality}
          diffData={report?.diff}
          artifactAName={`Artifact A: ${artifactA?.type} (${artifactA?.id.slice(0, 8)})`}
          artifactBName={`Artifact B: ${artifactB?.type} (${artifactB?.id.slice(0, 8)})`}
        />
      )}

      {/* Academic Framework & Methodology Card */}
      <div className="clinical-card p-6 border border-slate-200 bg-white">
        <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-slate-100 text-slate-800 font-medium text-sm">
          <BookOpen className="w-4 h-4 text-slate-700" />
          <span>Methodology &amp; Metric Verification (Cross-Modal Alignment)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 font-normal">
          <div>
            <span className="font-medium text-slate-700 block mb-1">
              Cross-Modal Embedding Extraction
            </span>
            <p className="leading-relaxed">
              Dispatches each artifact through modality-specific AI APIs: Sentence-BERT for natural language, CodeBERT AST embeddings for programmatic representations, and CLIP for visual rasters.
            </p>
          </div>
          <div>
            <span className="font-medium text-slate-700 block mb-1">
              Cosine Similarity Metric
            </span>
            <p className="leading-relaxed">
              Evaluates inner product over Euclidean lengths:
              <code className="block mt-1 p-1 bg-slate-100 rounded text-slate-700 font-mono text-[11px]">
                cos(θ) = (A · B) / (||A|| ||B||)
              </code>
              Normalized into calibrated 0–100% confidence tiers.
            </p>
          </div>
          <div>
            <span className="font-medium text-slate-700 block mb-1">
              Threshold Calibration
            </span>
            <p className="leading-relaxed">
              Standardized criteria: <span className="font-medium text-red-700">&gt;85%</span> (High Plagiarism Risk / Verbatim duplication), <span className="font-medium text-amber-700">60–85%</span> (Moderate / Semantic paraphrase), and <span className="font-medium text-slate-700">&lt;60%</span> (Original work).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
