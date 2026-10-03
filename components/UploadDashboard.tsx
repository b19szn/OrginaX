"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Code2,
  Image as ImageIcon,
  UploadCloud,
  ArrowRight,
  Loader2,
  Sparkles,
  X,
  FileUp,
  Edit3,
  CheckCircle2,
  FileCode,
  Users,
  FolderUp,
  Layers,
  Lock,
} from "lucide-react";
import ClassroomMatrixView, { BatchResultData } from "./ClassroomMatrixView";
import { useAuth } from "@/context/AuthContext";

interface UploadDashboardProps {
  onJobCreated?: (jobId: string) => void;
  loadBatchId?: string | null;
  onBatchLoaded?: () => void;
  defaultMode?: "pairwise" | "batch";
}

export default function UploadDashboard({
  onJobCreated,
  loadBatchId,
  onBatchLoaded,
  defaultMode = "pairwise",
}: UploadDashboardProps) {
  const router = useRouter();
  const { user, openAuthModal, isLoading: isAuthLoading } = useAuth();
  const [comparisonMode, setComparisonMode] = useState<"pairwise" | "batch">(defaultMode);
  const [selectedModality, setSelectedModality] = useState<"TEXT" | "CODE" | "IMAGE">("TEXT");

  useEffect(() => {
    if (defaultMode) {
      setComparisonMode(defaultMode);
    }
  }, [defaultMode]);

  // Input states (Pairwise 1-on-1)
  const [title, setTitle] = useState("");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [inputModeA, setInputModeA] = useState<"upload" | "paste">("paste");
  const [inputModeB, setInputModeB] = useState<"upload" | "paste">("paste");
  const [language, setLanguage] = useState("python");

  // File input refs
  const fileInputRefA = useRef<HTMLInputElement | null>(null);
  const fileInputRefB = useRef<HTMLInputElement | null>(null);

  // Loading & Progress (Pairwise)
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<string>("");

  // Batch / Classroom states
  const [batchTitle, setBatchTitle] = useState("CS101 - Algorithms Assignment 2");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchResult, setBatchResult] = useState<BatchResultData | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgressStep, setBatchProgressStep] = useState<string>("");
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load batch requested from History
  useEffect(() => {
    if (!loadBatchId) return;
    const fetchBatch = async () => {
      setIsBatchProcessing(true);
      setBatchProgressStep("Loading saved classroom batch session...");
      try {
        const res = await fetch(`/api/batches/${loadBatchId}`);
        const data = await res.json();
        if (data.success && data.batch) {
          setBatchResult(data.batch);
          setComparisonMode("batch");
        }
      } catch (err) {
        console.error("Failed to load batch:", err);
      } finally {
        setIsBatchProcessing(false);
        setBatchProgressStep("");
        onBatchLoaded?.();
      }
    };
    fetchBatch();
  }, [loadBatchId, onBatchLoaded]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAcceptedExtensions = () => {
    switch (selectedModality) {
      case "TEXT":
        return ".pdf,.txt,.md,.rtf,.docx";
      case "CODE":
        return ".py,.js,.ts,.tsx,.cpp,.c,.h,.java,.go,.rs,.php,.rb,.html,.css,.json,.sql";
      case "IMAGE":
        return "image/*";
    }
  };

  const getModalityFilePlaceholder = () => {
    switch (selectedModality) {
      case "TEXT":
        return "PDF, TXT, or Markdown document";
      case "CODE":
        return "Source code file (.py, .js, .cpp, .java, etc.)";
      case "IMAGE":
        return "PNG, JPG, or SVG visual graphic";
    }
  };

  const handleFileChange = (file: File | null, target: "A" | "B") => {
    if (target === "A") {
      setFileA(file);
      if (file && !file.name.endsWith(".pdf") && !file.type.includes("pdf") && !file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) setTextA(content);
        };
        reader.readAsText(file);
      }
    } else {
      setFileB(file);
      if (file && !file.name.endsWith(".pdf") && !file.type.includes("pdf") && !file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) setTextB(content);
        };
        reader.readAsText(file);
      }
    }
  };

  const loadPreset = (type: "text" | "code") => {
    setInputModeA("paste");
    setInputModeB("paste");
    setFileA(null);
    setFileB(null);
    if (type === "text") {
      setSelectedModality("TEXT");
      setTitle("Academic Abstract vs Paraphrased Summary");
      setTextA(
        "The rapid proliferation of multimodal deep learning models has revolutionized automated content evaluation. However, cross-artifact plagiarism detection requires projecting heterogeneous representations into a shared semantic manifold."
      );
      setTextB(
        "The swift expansion of multimodal deep neural architectures has transformed modern automated content appraisal. Nonetheless, cross-artifact similarity analysis demands projecting disparate data representations onto a joint semantic manifold."
      );
    } else {
      setSelectedModality("CODE");
      setLanguage("python");
      setTitle("Python BFS Algorithm vs Variable Renaming");
      setTextA(
        `def shortest_path(graph, start, target):\n    # Standard BFS queue implementation\n    queue = [(start, [start])]\n    visited = set([start])\n    while queue:\n        curr, path = queue.pop(0)\n        if curr == target:\n            return path\n        for neighbor in graph.get(curr, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append((neighbor, path + [neighbor]))\n    return None`
      );
      setTextB(
        `def find_min_route(adj_list, src, dest):\n    # Modified queue search routine with renamed variables\n    frontier = [(src, [src])]\n    seen_nodes = set([src])\n    while frontier:\n        node, trajectory = frontier.pop(0)\n        if node == dest:\n            return trajectory\n        for adj in adj_list.get(node, []):\n            if adj not in seen_nodes:\n                seen_nodes.add(adj)\n                frontier.append((adj, trajectory + [adj]))\n    return None`
      );
    }
  };

  const handleUploadAndCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setIsProcessing(true);
    setProgressStep("Normalizing inputs & uploading artifacts...");

    try {
      // 1. Upload Artifact A
      const formA = new FormData();
      formA.append("type", selectedModality);
      formA.append("title", title ? `${title} (Source)` : (fileA ? fileA.name : "Artifact A"));
      if (fileA) {
        formA.append("file", fileA);
      } else {
        formA.append("content", textA);
      }
      if (selectedModality === "CODE") {
        formA.append("language", language);
      }

      const resA = await fetch("/api/upload", {
        method: "POST",
        body: formA,
      });
      const dataA = await resA.json();
      if (!dataA.success) throw new Error(dataA.error || "Failed to upload Artifact A");

      // 2. Upload Artifact B
      setProgressStep("Extracting AST/NLP representations for Artifact B...");
      const formB = new FormData();
      formB.append("type", selectedModality);
      formB.append("title", title ? `${title} (Derivative)` : (fileB ? fileB.name : "Artifact B"));
      if (fileB) {
        formB.append("file", fileB);
      } else {
        formB.append("content", textB);
      }
      if (selectedModality === "CODE") {
        formB.append("language", language);
      }

      const resB = await fetch("/api/upload", {
        method: "POST",
        body: formB,
      });
      const dataB = await resB.json();
      if (!dataB.success) throw new Error(dataB.error || "Failed to upload Artifact B");

      // 3. Initiate Comparison Job
      setProgressStep("Executing inner-product similarity & generating visual diff...");
      const compRes = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: dataA.submissionId,
          artifactAId: dataA.artifact.id,
          artifactBId: dataB.artifact.id,
        }),
      });

      const compData = await compRes.json();
      if (!compData.success) throw new Error(compData.error || "Comparison pipeline failed");

      setProgressStep("Redirecting to Unified Originality Report...");

      if (onJobCreated) {
        onJobCreated(compData.jobId);
      }

      router.push(`/report/${compData.jobId}`);
    } catch (err: any) {
      alert(err.message || "An error occurred during comparison.");
      setIsProcessing(false);
      setProgressStep("");
    }
  };

  const handleBatchFileAdd = (newFiles: FileList | File[] | null) => {
    if (!newFiles) return;
    const added = Array.from(newFiles);
    setBatchFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const filtered = added.filter((f) => !existingNames.has(f.name));
      return [...prev, ...filtered];
    });
  };

  const removeBatchFile = (index: number) => {
    setBatchFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBatchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (batchFiles.length < 2) return;

    setIsBatchProcessing(true);
    setBatchProgressStep("Ingesting & extracting student submissions...");

    try {
      const form = new FormData();
      form.append("assignmentTitle", batchTitle || "Classroom Batch Examination");
      form.append("type", selectedModality);
      if (selectedModality === "CODE") {
        form.append("language", language);
      }

      batchFiles.forEach((file) => {
        form.append("files", file);
      });

      setBatchProgressStep("Extracting embeddings & calculating N×N cross-matrix...");

      const res = await fetch("/api/batch-compare", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Batch comparison failed");

      setBatchResult(data);
      if (onJobCreated) onJobCreated(data.submissionId);
    } catch (err: any) {
      alert(`Classroom comparison error: ${err.message}`);
    } finally {
      setIsBatchProcessing(false);
      setBatchProgressStep("");
    }
  };

  const handleLoadDemoBatch = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsBatchProcessing(true);
    setBatchProgressStep("Simulating 4 student submissions & computing cross-matrix...");
    try {
      const res = await fetch("/api/batch-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isDemo: true,
          assignmentTitle: "Algorithms & Systems - Homework 2 (Demo Roster)",
          type: "TEXT",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Demo batch failed");
      setBatchResult(data);
      if (onJobCreated) onJobCreated(data.submissionId);
    } catch (err: any) {
      alert(`Demo batch error: ${err.message}`);
    } finally {
      setIsBatchProcessing(false);
      setBatchProgressStep("");
    }
  };

  const isReadyToSubmit =
    !isProcessing &&
    (selectedModality === "IMAGE"
      ? !!fileA && !!fileB
      : (!!fileA || textA.trim().length > 0) && (!!fileB || textB.trim().length > 0));

  return (
    <div id="upload-section" className="multimodal-card p-6 sm:p-10 mb-10 bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md">
      {/* Institutional Authentication Banner */}
      {!user && !isAuthLoading && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-amber-900">
                Institutional Authentication Required
              </div>
              <div className="text-[11px] text-amber-700">
                You must be signed in with an active investigator or student profile to run similarity checks and AST extractions.
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={openAuthModal}
              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-medium transition-all shadow-xs flex items-center space-x-1.5"
            >
              <span>Sign In / Register</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Level Mode Switcher: Pairwise vs Classroom Batch */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200/80">
        <div className="flex items-center p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 max-w-lg w-full sm:w-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setComparisonMode("pairwise")}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              comparisonMode === "pairwise"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Single Pair (1-on-1)</span>
          </button>

          <button
            type="button"
            onClick={() => setComparisonMode("batch")}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              comparisonMode === "batch"
                ? "bg-white text-slate-800 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4 text-teal-600" />
            <span>Classroom Batch (All-vs-All)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-50 text-teal-700 border border-teal-100 font-medium">
              Teacher
            </span>
          </button>
        </div>

        {comparisonMode === "pairwise" && (
          <div className="flex items-center space-x-2 text-xs font-normal text-slate-500">
            <span className="font-medium text-slate-600">Quick Samples:</span>
            <button
              type="button"
              onClick={() => loadPreset("text")}
              className="text-orange-700 hover:text-orange-800 underline underline-offset-2 transition-colors font-medium"
            >
              Text Sample
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => loadPreset("code")}
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors font-medium"
            >
              Code Sample
            </button>
          </div>
        )}
      </div>

      {comparisonMode === "batch" ? (
        batchResult ? (
          <ClassroomMatrixView
            data={batchResult}
            onReset={() => {
              setBatchResult(null);
              setBatchFiles([]);
            }}
          />
        ) : (
          <form onSubmit={handleBatchSubmit} className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-normal text-slate-800 tracking-tight">
                  Classroom Multi-File Cross-Examination
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-normal">
                  Upload all student assignments at once. The engine extracts embeddings in a single pass and computes an all-vs-all similarity matrix to uncover collusion rings and paraphrasing.
                </p>
              </div>

              {/* Quick Demo Class preset */}
              <button
                type="button"
                onClick={handleLoadDemoBatch}
                disabled={isBatchProcessing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-teal-700 bg-teal-50/80 hover:bg-teal-100 border border-teal-200/80 transition-all shadow-sm shrink-0 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Load 4-Student Demo Class</span>
              </button>
            </div>

            {/* Assignment Name & Modality */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assignment / Course Title
                </label>
                <input
                  type="text"
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  placeholder="e.g. CS201 - Algorithms Homework 3 (Section B)"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Submission Format
                </label>
                <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedModality("TEXT")}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedModality === "TEXT"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    PDF / Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModality("CODE")}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedModality === "CODE"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Code
                  </button>
                </div>
              </div>
            </div>

            {/* Multi-file dropzone */}
            <div
              onClick={() => batchFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleBatchFileAdd(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-teal-200/70 hover:border-teal-400/80 bg-teal-50/20 hover:bg-teal-50/40 p-8 rounded-2xl text-center cursor-pointer transition-all space-y-3"
            >
              <input
                ref={batchFileInputRef}
                type="file"
                multiple
                accept={getAcceptedExtensions()}
                onChange={(e) => handleBatchFileAdd(e.target.files)}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-100/70 flex items-center justify-center text-teal-600 shadow-sm">
                <FolderUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-700">
                  Drop student files here, or <span className="text-teal-600 underline">browse</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Select multiple {getModalityFilePlaceholder()} at once ({getAcceptedExtensions()})
                </div>
              </div>
            </div>

            {/* Selected Files List */}
            {batchFiles.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Selected Student Submissions ({batchFiles.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setBatchFiles([])}
                    className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {batchFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-400 font-medium shrink-0">#{idx + 1}</span>
                        <FileText className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        <span className="truncate text-slate-700 font-medium" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[11px] text-slate-400">{formatFileSize(file.size)}</span>
                        <button
                          type="button"
                          onClick={() => removeBatchFile(idx)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-teal-700 border-t border-slate-200/60 font-medium">
                  <span>
                    {batchFiles.length} students &rarr;{" "}
                    {Math.round((batchFiles.length * (batchFiles.length - 1)) / 2)} pairwise cross-checks will be computed
                  </span>
                  {batchFiles.length < 2 && (
                    <span className="text-rose-600">Please select at least 2 files</span>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500">
                {isBatchProcessing && (
                  <div className="flex items-center space-x-2.5 text-teal-700 font-medium animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>{batchProgressStep}</span>
                  </div>
                )}
              </div>

              <button
                type={user ? "submit" : "button"}
                onClick={!user ? openAuthModal : undefined}
                disabled={user ? (isBatchProcessing || batchFiles.length < 2) : false}
                className="primary-pill-btn text-sm font-medium tracking-wide inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!user ? (
                  <>
                    <Lock className="w-4 h-4 text-teal-200" />
                    <span>Sign In to Run Classroom Matrix</span>
                  </>
                ) : isBatchProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cross-Analyzing Classroom Batch...</span>
                  </>
                ) : (
                  <>
                    <span>
                      Run Classroom Cross-Examination ({batchFiles.length}{" "}
                      {batchFiles.length === 1 ? "File" : "Files"})
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )
      ) : (
        <>
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-slate-200/80 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-normal text-slate-800 mt-2 tracking-tight">
                Cross-Artifact Ingestion &amp; Similarity
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-normal">
                Upload files or paste text/code to project artifacts into the unified metric space and compute cross-modality congruence.
              </p>
            </div>

            {/* Modality Selector Pills (With Reference Site Accent Colors) */}
            <div className="flex items-center bg-slate-100/90 p-1.5 rounded-full border border-slate-200 self-start lg:self-auto shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedModality("TEXT");
                  setFileA(null);
                  setFileB(null);
                }}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedModality === "TEXT"
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25 border border-orange-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${selectedModality === "TEXT" ? "text-white" : "text-orange-600"}`} />
                <span>Text / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedModality("CODE");
                  setFileA(null);
                  setFileB(null);
                }}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedModality === "CODE"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 border border-emerald-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code2 className={`w-3.5 h-3.5 ${selectedModality === "CODE" ? "text-white" : "text-emerald-600"}`} />
                <span>Source Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedModality("IMAGE");
                  setInputModeA("upload");
                  setInputModeB("upload");
                  setFileA(null);
                  setFileB(null);
                }}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedModality === "IMAGE"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25 border border-blue-700"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ImageIcon className={`w-3.5 h-3.5 ${selectedModality === "IMAGE" ? "text-white" : "text-blue-600"}`} />
                <span>Visual / Image</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleUploadAndCompare} className="space-y-6">
        {/* Title Input & Language Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-normal uppercase tracking-wider text-slate-500 mb-1.5">
              Comparison Title / Assignment Label
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Experiment 1: Academic Paper vs Paraphrased Summary"
              className="w-full px-4 py-3 text-sm bg-white/95 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-normal"
            />
          </div>

          {selectedModality === "CODE" ? (
            <div>
              <label className="block text-xs font-normal uppercase tracking-wider text-slate-500 mb-1.5">
                Target Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white/95 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 transition-all font-normal"
              >
                <option value="python">Python (.py)</option>
                <option value="javascript">JavaScript (.js)</option>
                <option value="typescript">TypeScript (.ts)</option>
                <option value="cpp">C++ (.cpp, .cc)</option>
                <option value="java">Java (.java)</option>
                <option value="go">Go (.go)</option>
                <option value="generic">Other / Generic AST</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-normal uppercase tracking-wider text-slate-500 mb-1.5">
                Inference Vector Space
              </label>
              <div className="px-4 py-3 text-xs font-normal text-slate-600 bg-white/80 border border-slate-200 rounded-2xl flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>
                  {selectedModality === "IMAGE" ? "CLIP ViT-B/32 (Vision)" : "Sentence-BERT (MiniLM-L6)"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dual Artifact Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ==================== ARTIFACT A ==================== */}
          <div className="border border-blue-200/80 rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-blue-50/40 via-white/80 to-white/95 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-2xs">
            {/* Header with Title & Mode Switcher */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-100/60">
              <span className="text-xs font-medium uppercase tracking-wider text-blue-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Artifact A (Reference Source)</span>
              </span>

              {/* Input Mode Selector for Text & Code */}
              {selectedModality !== "IMAGE" ? (
                <div className="flex items-center bg-blue-100/60 p-0.5 rounded-lg border border-blue-200/80 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setInputModeA("upload")}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                      inputModeA === "upload"
                        ? "bg-white text-blue-800 shadow-2xs"
                        : "text-blue-600 hover:text-blue-900"
                    }`}
                  >
                    <FileUp className="w-3 h-3" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputModeA("paste")}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                      inputModeA === "paste"
                        ? "bg-white text-blue-800 shadow-2xs"
                        : "text-blue-600 hover:text-blue-900"
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Direct Paste</span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  Image File
                </span>
              )}
            </div>

            {/* Input Content: Upload Mode OR Paste Mode */}
            {selectedModality === "IMAGE" || inputModeA === "upload" ? (
              <div className="space-y-3">
                {/* Drag & Drop File Zone */}
                <div
                  onClick={() => fileInputRefA.current?.click()}
                  className="flex flex-col items-center justify-center p-6 sm:p-7 border-2 border-dashed border-blue-200 rounded-xl bg-white/80 hover:bg-blue-50/40 hover:border-blue-400 transition-all cursor-pointer group"
                >
                  <input
                    ref={fileInputRefA}
                    type="file"
                    accept={getAcceptedExtensions()}
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, "A")}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-blue-900 text-center">
                    Click to browse or drop {selectedModality === "TEXT" ? "PDF / text" : selectedModality === "CODE" ? "source code" : "image"} file
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 font-mono text-center">
                    Accepted: {getAcceptedExtensions()}
                  </span>
                </div>

                {/* Selected File Banner */}
                {fileA && (
                  <div className="flex items-center justify-between bg-blue-50/90 border border-blue-200/90 rounded-xl px-3.5 py-2.5 text-xs">
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                        {selectedModality === "CODE" ? (
                          <FileCode className="w-4 h-4" />
                        ) : selectedModality === "IMAGE" ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-blue-950 truncate">{fileA.name}</div>
                        <div className="text-[10px] text-blue-700 font-mono">{formatFileSize(fileA.size)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFileA(null);
                        if (fileInputRefA.current) fileInputRefA.current.value = "";
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* For text/code, show optional loaded preview */}
                {selectedModality !== "IMAGE" && fileA && textA && (
                  <div className="mt-2">
                    <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                      <span>Loaded Content Preview ({textA.split("\n").length} lines):</span>
                    </div>
                    <textarea
                      rows={5}
                      value={textA}
                      onChange={(e) => setTextA(e.target.value)}
                      className="w-full p-3 font-mono text-xs bg-white/95 border border-blue-100/90 rounded-xl text-slate-800 focus:outline-none focus:border-blue-400 transition-all resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  rows={8}
                  value={textA}
                  onChange={(e) => setTextA(e.target.value)}
                  placeholder={
                    selectedModality === "CODE"
                      ? "# Paste original source code implementation here..."
                      : "Paste original text / academic paper content here..."
                  }
                  className="w-full p-4 font-mono text-xs bg-white/95 border border-blue-100/90 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-all resize-none leading-relaxed"
                />
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{textA.length > 0 ? `${textA.split("\n").length} lines · ${textA.length} chars` : "Direct editor input"}</span>
                  <button
                    type="button"
                    onClick={() => setInputModeA("upload")}
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
                  >
                    Or upload a file instead &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ==================== ARTIFACT B ==================== */}
          <div className="border border-teal-200/80 rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-teal-50/40 via-white/80 to-white/95 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100 transition-all shadow-2xs">
            {/* Header with Title & Mode Switcher */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-teal-100/60">
              <span className="text-xs font-medium uppercase tracking-wider text-teal-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Artifact B (Suspect Derivative)</span>
              </span>

              {/* Input Mode Selector for Text & Code */}
              {selectedModality !== "IMAGE" ? (
                <div className="flex items-center bg-teal-100/60 p-0.5 rounded-lg border border-teal-200/80 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setInputModeB("upload")}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                      inputModeB === "upload"
                        ? "bg-white text-teal-800 shadow-2xs"
                        : "text-teal-600 hover:text-teal-900"
                    }`}
                  >
                    <FileUp className="w-3 h-3" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputModeB("paste")}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all font-medium ${
                      inputModeB === "paste"
                        ? "bg-white text-teal-800 shadow-2xs"
                        : "text-teal-600 hover:text-teal-900"
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Direct Paste</span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-teal-600 font-mono bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                  Image File
                </span>
              )}
            </div>

            {/* Input Content: Upload Mode OR Paste Mode */}
            {selectedModality === "IMAGE" || inputModeB === "upload" ? (
              <div className="space-y-3">
                {/* Drag & Drop File Zone */}
                <div
                  onClick={() => fileInputRefB.current?.click()}
                  className="flex flex-col items-center justify-center p-6 sm:p-7 border-2 border-dashed border-teal-200 rounded-xl bg-white/80 hover:bg-teal-50/40 hover:border-teal-400 transition-all cursor-pointer group"
                >
                  <input
                    ref={fileInputRefB}
                    type="file"
                    accept={getAcceptedExtensions()}
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, "B")}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-teal-900 text-center">
                    Click to browse or drop {selectedModality === "TEXT" ? "PDF / text" : selectedModality === "CODE" ? "source code" : "image"} file
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 font-mono text-center">
                    Accepted: {getAcceptedExtensions()}
                  </span>
                </div>

                {/* Selected File Banner */}
                {fileB && (
                  <div className="flex items-center justify-between bg-teal-50/90 border border-teal-200/90 rounded-xl px-3.5 py-2.5 text-xs">
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0">
                        {selectedModality === "CODE" ? (
                          <FileCode className="w-4 h-4" />
                        ) : selectedModality === "IMAGE" ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-teal-950 truncate">{fileB.name}</div>
                        <div className="text-[10px] text-teal-700 font-mono">{formatFileSize(fileB.size)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFileB(null);
                        if (fileInputRefB.current) fileInputRefB.current.value = "";
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* For text/code, show optional loaded preview */}
                {selectedModality !== "IMAGE" && fileB && textB && (
                  <div className="mt-2">
                    <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                      <span>Loaded Content Preview ({textB.split("\n").length} lines):</span>
                    </div>
                    <textarea
                      rows={5}
                      value={textB}
                      onChange={(e) => setTextB(e.target.value)}
                      className="w-full p-3 font-mono text-xs bg-white/95 border border-teal-100/90 rounded-xl text-slate-800 focus:outline-none focus:border-teal-400 transition-all resize-none leading-relaxed"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  rows={8}
                  value={textB}
                  onChange={(e) => setTextB(e.target.value)}
                  placeholder={
                    selectedModality === "CODE"
                      ? "# Paste suspect or refactored implementation code here..."
                      : "Paste suspect or student paper content here..."
                  }
                  className="w-full p-4 font-mono text-xs bg-white/95 border border-teal-100/90 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-all resize-none leading-relaxed"
                />
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{textB.length > 0 ? `${textB.split("\n").length} lines · ${textB.length} chars` : "Direct editor input"}</span>
                  <button
                    type="button"
                    onClick={() => setInputModeB("upload")}
                    className="text-teal-600 hover:text-teal-800 underline underline-offset-2 transition-colors"
                  >
                    Or upload a file instead &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {isProcessing && (
              <div className="flex items-center space-x-2.5 text-teal-700 font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span>{progressStep}</span>
              </div>
            )}
          </div>

          <button
            type={user ? "submit" : "button"}
            onClick={!user ? openAuthModal : undefined}
            disabled={user ? !isReadyToSubmit : false}
            className="primary-pill-btn text-sm font-medium tracking-wide inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-700 hover:to-teal-700 text-white border-0 shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!user ? (
              <>
                <Lock className="w-4 h-4 text-teal-200" />
                <span>Sign In to Run Similarity Analysis</span>
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Similarity Pipeline...</span>
              </>
            ) : (
              <>
                <span>Run Similarity Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )}
</div>
);
}
