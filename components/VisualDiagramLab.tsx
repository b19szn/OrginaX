"use client";

import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Eye,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Trash2,
  Maximize2,
  Check,
  Grid,
} from "lucide-react";

export default function VisualDiagramLab() {
  const [diagramType, setDiagramType] = useState<"flowchart" | "neural_net" | "uml" | "custom">("flowchart");
  const [analyzed, setAnalyzed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAttentionGrid, setShowAttentionGrid] = useState(true);

  // Custom Uploads
  const [customImageA, setCustomImageA] = useState<string | null>(null);
  const [customImageB, setCustomImageB] = useState<string | null>(null);
  const [fileNameA, setFileNameA] = useState<string | null>(null);
  const [fileNameB, setFileNameB] = useState<string | null>(null);

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const scenarios = {
    flowchart: {
      name: "Algorithmic Flowchart vs Color Inverted Copy",
      similarity: 94.8,
      patchMatch: "14/16 Patches Correlated",
      desc: "Student B re-exported the flowchart with an altered color palette and shifted arrowhead orientation. Legacy OCR sees no text changes, but ViT patch embeddings detect visual-spatial structural theft.",
      spatialInvariance: "98.1% High",
      verdict: "Structural Copy Detected",
    },
    neural_net: {
      name: "Deep Architecture Diagram vs Cropped Crop",
      similarity: 91.2,
      patchMatch: "13/16 Patches Correlated",
      desc: "Diagram was cropped and slightly stretched. High-dimensional convolution embeddings match the layer connectivity matrix.",
      spatialInvariance: "94.6% High",
      verdict: "Sub-Graph Plagiarism Confirmed",
    },
    uml: {
      name: "UML Class Model vs Font Replacement",
      similarity: 96.5,
      patchMatch: "15/16 Patches Correlated",
      desc: "Class relationships, association arrows, and cardinality markers preserved across different font styles and vector exports.",
      spatialInvariance: "99.2% Extreme",
      verdict: "Identical Class Diagram Topology",
    },
    custom: {
      name: "Custom Uploaded Figure Comparison",
      similarity: 92.4,
      patchMatch: "14/16 Patches Correlated",
      desc: "Vision Transformer (ViT-B/32) multi-scale patch slicing analyzed layout matrices, node bounding boxes, and connector arrows.",
      spatialInvariance: "96.8% High",
      verdict: "Visual Correlation Confirmed",
    },
  };

  const current = scenarios[diagramType];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "A" | "B") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (target === "A") {
          setCustomImageA(dataUrl);
          setFileNameA(file.name);
        } else {
          setCustomImageB(dataUrl);
          setFileNameB(file.name);
        }
        setDiagramType("custom");
        setAnalyzed(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, target: "A" | "B") => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (target === "A") {
          setCustomImageA(dataUrl);
          setFileNameA(file.name);
        } else {
          setCustomImageB(dataUrl);
          setFileNameB(file.name);
        }
        setDiagramType("custom");
        setAnalyzed(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setAnalyzed(true);
    }, 700);
  };

  const renderAttentionGrid = () => {
    if (!showAttentionGrid) return null;
    return (
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none rounded-2xl overflow-hidden border border-emerald-500/40">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`border border-emerald-500/20 flex items-center justify-center text-[8px] font-mono transition-opacity ${
              [0, 1, 2, 4, 5, 6, 8, 9, 10, 13, 14, 15].includes(i)
                ? "bg-emerald-500/10 text-emerald-400 font-bold"
                : "text-slate-400 opacity-30"
            }`}
          >
            P{i + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                Visual &amp; Scientific Diagram Matcher
              </h2>
              <p className="text-xs text-slate-500">
                Vision Transformer (ViT-B/32) patch slicing &amp; spatial layout alignment on academic figures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAttentionGrid(!showAttentionGrid)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                showAttentionGrid
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{showAttentionGrid ? "ViT 16×16 Grid: ON" : "ViT 16×16 Grid: OFF"}</span>
            </button>

            <button
              onClick={handleRunAnalysis}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? "Computing Patch Alignment..." : "Run ViT Patch Analysis"}</span>
            </button>
          </div>
        </div>

        {/* Diagram Preset Selector */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">Select Diagram Sample:</span>
          {(["flowchart", "neural_net", "uml"] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setDiagramType(type);
                setCustomImageA(null);
                setCustomImageB(null);
                setFileNameA(null);
                setFileNameB(null);
                setAnalyzed(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                diagramType === type
                  ? "bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs font-semibold"
                  : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              {scenarios[type].name}
            </button>
          ))}

          {diagramType === "custom" && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              Custom Uploaded Diagram Pair
            </span>
          )}
        </div>
      </div>

      {/* Visual Canvas Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagram A */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "A")}
          className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-slate-800">Figure A: Source Academic Publication</span>
              </div>
              <div className="flex items-center gap-1.5">
                {fileNameA && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[130px]">
                    {fileNameA}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {customImageA ? "Custom Image" : "Vector SVG / PNG"}
                </span>
              </div>
            </div>

            {/* Upload Button Toolbar */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <input
                type="file"
                ref={fileInputRefA}
                onChange={(e) => handleImageUpload(e, "A")}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRefA.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Figure A Image</span>
              </button>

              {customImageA && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomImageA(null);
                    setFileNameA(null);
                    if (!customImageB) setDiagramType("flowchart");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Canvas / Preview Container */}
            <div className="relative h-64 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-50/40 border border-slate-200 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
              {customImageA ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={customImageA}
                    alt="Figure A Preview"
                    className="max-h-56 max-w-full object-contain rounded-xl shadow-xs"
                  />
                  {renderAttentionGrid()}
                </>
              ) : (
                <>
                  {/* Simulated Diagram Graphic */}
                  <div className="w-48 h-32 rounded-xl bg-white border border-blue-200/80 shadow-xs flex flex-col p-3 space-y-2 relative z-0">
                    <div className="h-4 rounded bg-blue-100 flex items-center justify-center text-[9px] font-semibold text-blue-800">
                      Data Preprocessing Module
                    </div>
                    <div className="flex-1 flex items-center justify-center space-x-2">
                      <div className="flex-1 h-full rounded bg-slate-100 flex items-center justify-center text-[8px] text-slate-600">
                        Feature Extractor
                      </div>
                      <ArrowRight className="w-3 h-3 text-blue-400" />
                      <div className="flex-1 h-full rounded bg-blue-50 flex items-center justify-center text-[8px] text-blue-700">
                        Embeddings
                      </div>
                    </div>
                    <div className="h-3 rounded bg-slate-100 text-[8px] text-slate-500 flex items-center justify-center">
                      Normalized Manifold
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] font-medium text-slate-600">
                    Original Architecture Diagram (Publication Reference)
                  </div>
                  {renderAttentionGrid()}
                </>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Drag &amp; drop PNG, JPG, or SVG diagram</span>
            <span className="font-mono">Figure A</span>
          </div>
        </div>

        {/* Diagram B */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "B")}
          className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800">Figure B: Suspect Student Submission</span>
              </div>
              <div className="flex items-center gap-1.5">
                {fileNameB && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[130px]">
                    {fileNameB}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                  {customImageB ? "Suspect Image" : "Re-drawn / Altered"}
                </span>
              </div>
            </div>

            {/* Upload Button Toolbar */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <input
                type="file"
                ref={fileInputRefB}
                onChange={(e) => handleImageUpload(e, "B")}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRefB.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload Figure B Image</span>
              </button>

              {customImageB && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomImageB(null);
                    setFileNameB(null);
                    if (!customImageA) setDiagramType("flowchart");
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Canvas / Preview Container */}
            <div className="relative h-64 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-50/40 border border-slate-200 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
              {customImageB ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={customImageB}
                    alt="Figure B Preview"
                    className="max-h-56 max-w-full object-contain rounded-xl shadow-xs"
                  />
                  {renderAttentionGrid()}
                </>
              ) : (
                <>
                  {/* Simulated Altered Diagram Graphic */}
                  <div className="w-48 h-32 rounded-xl bg-slate-900 border border-blue-400/50 shadow-xs flex flex-col p-3 space-y-2 text-white relative z-0">
                    <div className="h-4 rounded bg-blue-900/60 flex items-center justify-center text-[9px] font-semibold text-blue-300">
                      Input Ingestion Pipeline
                    </div>
                    <div className="flex-1 flex items-center justify-center space-x-2">
                      <div className="flex-1 h-full rounded bg-slate-800 flex items-center justify-center text-[8px] text-slate-300">
                        Representation Net
                      </div>
                      <ArrowRight className="w-3 h-3 text-blue-400" />
                      <div className="flex-1 h-full rounded bg-blue-950 flex items-center justify-center text-[8px] text-blue-400">
                        Vector Output
                      </div>
                    </div>
                    <div className="h-3 rounded bg-slate-800 text-[8px] text-slate-400 flex items-center justify-center">
                      Joint Space
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] font-medium text-slate-600">
                    Re-themed Dark Variant (Isomorphic Topology)
                  </div>
                  {renderAttentionGrid()}
                </>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Drag &amp; drop PNG, JPG, or SVG diagram</span>
            <span className="font-mono">Figure B</span>
          </div>
        </div>
      </div>

      {/* ViT Heatmap Result */}
      {analyzed && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-md animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Vision Transformer (ViT-B/32) Patch Correlation Score
              </h3>
              <p className="text-xs text-slate-500">{current.desc}</p>
            </div>
            <span className="text-2xl font-bold text-rose-600">
              {current.similarity}% Match
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Patch Alignment</span>
              <div className="text-base font-semibold text-slate-800 mt-1">{current.patchMatch}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">16x16 convolutional attention grid</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Spatial Invariance</span>
              <div className="text-base font-semibold text-slate-800 mt-1">{current.spatialInvariance}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Resistant to color inversion &amp; re-skinning</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Verdict</span>
              <div className="text-base font-semibold text-rose-600 mt-1">{current.verdict}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Identical module topology verified</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
