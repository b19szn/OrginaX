"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Code2,
  Image as ImageIcon,
  Flame,
  Layers,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Play,
  Pause,
  Sparkles,
} from "lucide-react";

interface HeroBannerProps {
  onSeedDemo?: () => Promise<void>;
  isSeeding?: boolean;
}

type ModalityKey = "code" | "text" | "heatmap" | "image" | "cosine";

interface ModalityConfig {
  key: ModalityKey;
  label: string;
  sublabel: string;
  color: string;
  borderColor: string;
  bgLight: string;
  textColor: string;
  lineCoords: { x1: string; y1: string; x2: string; y2: string };
  badgeText: string;
  cardTitle: string;
}

// Green (AST), Orange (Text), Rose (Heatmap), Blue (Visual Graphic), Teal (Cosine Norm)
const MODALITIES: ModalityConfig[] = [
  {
    key: "code",
    label: "Source Code",
    sublabel: "CodeBERT AST",
    color: "#16a34a", // Green (like Depth in reference)
    borderColor: "border-green-300",
    bgLight: "bg-green-50",
    textColor: "text-green-700",
    lineCoords: { x1: "50%", y1: "18%", x2: "50%", y2: "35%" },
    badgeText: "Source Code · 82.5% Clone Flagged",
    cardTitle: "CodeBERT AST Structural Clone Detection",
  },
  {
    key: "text",
    label: "Text / PDF",
    sublabel: "Sentence-BERT",
    color: "#ea580c", // Orange (like Text in reference)
    borderColor: "border-orange-300",
    bgLight: "bg-orange-50",
    textColor: "text-orange-700",
    lineCoords: { x1: "18%", y1: "50%", x2: "34%", y2: "50%" },
    badgeText: "Text / PDF · 66.7% Paraphrase Detected",
    cardTitle: "Sentence-BERT Paraphrase Detection",
  },
  {
    key: "heatmap",
    label: "Heat Map",
    sublabel: "4×4 Patch Grid",
    color: "#e11d48", // Rose Red
    borderColor: "border-rose-300",
    bgLight: "bg-rose-50",
    textColor: "text-rose-700",
    lineCoords: { x1: "82%", y1: "50%", x2: "66%", y2: "50%" },
    badgeText: "Heat Map · 4/16 Patches Flagged",
    cardTitle: "4×4 Spatial Attention Patch Heatmap",
  },
  {
    key: "image",
    label: "Visual Graphic",
    sublabel: "CLIP ViT-B/32",
    color: "#2563eb", // Blue (like Audio in reference)
    borderColor: "border-blue-300",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    lineCoords: { x1: "26%", y1: "84%", x2: "42%", y2: "66%" },
    badgeText: "Visual Graphic · 87.8% High Similarity",
    cardTitle: "CLIP ViT-B/32 Visual Manifold Ingestion",
  },
  {
    key: "cosine",
    label: "Cosine Norm",
    sublabel: "Similarity cos(θ)",
    color: "#0d9488", // Teal / Cyan (like IMU in reference)
    borderColor: "border-teal-300",
    bgLight: "bg-teal-50",
    textColor: "text-teal-700",
    lineCoords: { x1: "74%", y1: "84%", x2: "58%", y2: "66%" },
    badgeText: "Cosine Norm · Joint Manifold Verified",
    cardTitle: "Unified Joint Metric Space Inner Product",
  },
];

export default function HeroBanner({ onSeedDemo, isSeeding }: HeroBannerProps) {
  const [activeModality, setActiveModality] = useState<ModalityKey>("code");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-play rotation every 3.5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveModality((current) => {
        const currentIndex = MODALITIES.findIndex((m) => m.key === current);
        const nextIndex = (currentIndex + 1) % MODALITIES.length;
        return MODALITIES[nextIndex].key;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentConfig = MODALITIES.find((m) => m.key === activeModality) || MODALITIES[0];

  return (
    <div className="py-6 sm:py-10 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Project Narrative */}
        <div className="lg:col-span-5 space-y-5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 border border-teal-200 text-teal-800 text-xs font-medium shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Multi-Modal Plagiarism Detection Framework</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-slate-800 leading-[1.18]">
            Multi-Modal Similarity Analysis Across Code, PDFs &amp; Visuals
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal max-w-xl">
            An automated cross-artifact similarity analysis framework uniting Sentence-BERT semantic vectors, CodeBERT AST embeddings, and CLIP visual patch heatmaps into a shared metric space. Detect unauthorized copying, semantic paraphrasing, and structural code refactoring without manual supervision.
          </p>

          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-normal">
            Select or hover any modality node to see how inputs project into the joint manifold and compute similarity in real time.
          </p>

          {/* Action Buttons: Minimalist Editorial Style */}
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <a
              href="#upload-section"
              className="primary-pill-btn text-xs sm:text-sm font-medium tracking-wide inline-flex items-center space-x-2 shadow-sm shadow-blue-500/10"
            >
              <span>Launch Ingestion</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onSeedDemo || (() => { window.location.href = "/dashboard"; })}
              disabled={isSeeding}
              className="secondary-pill-btn text-xs sm:text-sm font-medium inline-flex items-center space-x-2 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4 text-slate-500" />
              <span>{isSeeding ? "Seeding benchmark pairs..." : "Load benchmark pairs"}</span>
            </button>
          </div>

          {/* Modality feature pill indicators with exact reference colors */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-orange-50/90 border border-orange-200 text-orange-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>Sentence-BERT</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>CodeBERT AST</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50/90 border border-blue-200 text-blue-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>CLIP ViT-B/32</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50/90 border border-rose-200 text-rose-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Patch Heatmap</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-teal-50/90 border border-teal-200 text-teal-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <span>Joint Manifold</span>
            </span>
          </div>
        </div>

        {/* Right Column: Multi-Modal Interactive Convergence Hub */}
        <div className="lg:col-span-7">
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="multimodal-card p-3 sm:p-5 bg-white relative overflow-hidden flex flex-col items-center justify-between border border-slate-200 select-none shadow-sm"
          >
            {/* Diagram Space with Solid Reference-Colored Lines */}
            <div className="relative w-full h-[360px] sm:h-[380px] flex items-center justify-center">
              {/* Dynamic SVG Connecting Lines (Vibrant solid lines like the reference site!) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 5 Signature Solid Colored Lines matching the reference screenshot */}
                {MODALITIES.map((mod) => {
                  const isActive = mod.key === activeModality;
                  return (
                    <g key={`line-group-${mod.key}`}>
                      {/* Solid colored base line */}
                      <line
                        x1={mod.lineCoords.x1}
                        y1={mod.lineCoords.y1}
                        x2={mod.lineCoords.x2}
                        y2={mod.lineCoords.y2}
                        stroke={mod.color}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        strokeOpacity={isActive ? 1 : 0.75}
                        strokeLinecap="round"
                      />

                      {/* Animated laser pulse dash over the active line */}
                      {isActive && (
                        <line
                          x1={mod.lineCoords.x1}
                          y1={mod.lineCoords.y1}
                          x2={mod.lineCoords.x2}
                          y2={mod.lineCoords.y2}
                          stroke="#ffffff"
                          strokeWidth={2}
                          strokeDasharray="4 8"
                          className="laser-active-line"
                          strokeOpacity={0.9}
                          strokeLinecap="round"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* 1. TOP SATELLITE: SOURCE CODE (AST) - Green Theme */}
              <div
                onClick={() => setActiveModality("code")}
                onMouseEnter={() => setActiveModality("code")}
                className={`absolute top-1 sm:top-2 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer transition-all duration-300 ${
                  activeModality === "code" ? "scale-105" : "opacity-90 hover:opacity-100"
                }`}
              >
                <div
                  className={`border rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-2xs flex flex-col items-center transition-all ${
                    activeModality === "code"
                      ? "bg-green-50/95 border-green-500 ring-2 ring-green-100 shadow-sm"
                      : "bg-white/95 border-slate-200 hover:border-green-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-green-100/90 border border-green-300 flex items-center justify-center mb-0.5 shadow-2xs">
                    <Code2 className="w-3.5 h-3.5 text-green-700" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium transition-colors ${
                      activeModality === "code" ? "text-green-800" : "text-slate-700"
                    }`}
                  >
                    Source Code
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">CodeBERT AST</span>
                </div>
              </div>

              {/* 2. LEFT SATELLITE: TEXT / PDF - Orange Theme */}
              <div
                onClick={() => setActiveModality("text")}
                onMouseEnter={() => setActiveModality("text")}
                className={`absolute left-0.5 sm:left-2 top-1/2 transform -translate-y-1/2 z-20 cursor-pointer transition-all duration-300 ${
                  activeModality === "text" ? "scale-105" : "opacity-90 hover:opacity-100"
                }`}
              >
                <div
                  className={`border rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-2xs flex flex-col items-center transition-all ${
                    activeModality === "text"
                      ? "bg-orange-50/95 border-orange-500 ring-2 ring-orange-100 shadow-sm"
                      : "bg-white/95 border-slate-200 hover:border-orange-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-100/90 border border-orange-300 flex items-center justify-center mb-0.5 shadow-2xs">
                    <FileText className="w-3.5 h-3.5 text-orange-700" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium transition-colors ${
                      activeModality === "text" ? "text-orange-800" : "text-slate-700"
                    }`}
                  >
                    Text / PDF
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Sentence-BERT</span>
                </div>
              </div>

              {/* 3. RIGHT SATELLITE: HEAT MAP - Rose Theme */}
              <div
                onClick={() => setActiveModality("heatmap")}
                onMouseEnter={() => setActiveModality("heatmap")}
                className={`absolute right-0.5 sm:right-2 top-1/2 transform -translate-y-1/2 z-20 cursor-pointer transition-all duration-300 ${
                  activeModality === "heatmap" ? "scale-105" : "opacity-90 hover:opacity-100"
                }`}
              >
                <div
                  className={`border rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-2xs flex flex-col items-center transition-all ${
                    activeModality === "heatmap"
                      ? "bg-rose-50/95 border-rose-500 ring-2 ring-rose-100 shadow-sm"
                      : "bg-white/95 border-slate-200 hover:border-rose-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-100/90 border border-rose-300 flex items-center justify-center mb-0.5 shadow-2xs">
                    <Flame className="w-3.5 h-3.5 text-rose-700" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium transition-colors ${
                      activeModality === "heatmap" ? "text-rose-800" : "text-slate-700"
                    }`}
                  >
                    Heat Map
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">4×4 Patch Grid</span>
                </div>
              </div>

              {/* 4. BOTTOM-LEFT SATELLITE: VISUAL GRAPHIC - Blue Theme */}
              <div
                onClick={() => setActiveModality("image")}
                onMouseEnter={() => setActiveModality("image")}
                className={`absolute bottom-1 sm:bottom-2 left-4 sm:left-10 z-20 cursor-pointer transition-all duration-300 ${
                  activeModality === "image" ? "scale-105" : "opacity-90 hover:opacity-100"
                }`}
              >
                <div
                  className={`border rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-2xs flex flex-col items-center transition-all ${
                    activeModality === "image"
                      ? "bg-blue-50/95 border-blue-500 ring-2 ring-blue-100 shadow-sm"
                      : "bg-white/95 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100/90 border border-blue-300 flex items-center justify-center mb-0.5 shadow-2xs">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium transition-colors ${
                      activeModality === "image" ? "text-blue-800" : "text-slate-700"
                    }`}
                  >
                    Visual Graphic
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">CLIP ViT-B/32</span>
                </div>
              </div>

              {/* 5. BOTTOM-RIGHT SATELLITE: COSINE NORM - Teal / Cyan Theme */}
              <div
                onClick={() => setActiveModality("cosine")}
                onMouseEnter={() => setActiveModality("cosine")}
                className={`absolute bottom-1 sm:bottom-2 right-4 sm:right-10 z-20 cursor-pointer transition-all duration-300 ${
                  activeModality === "cosine" ? "scale-105" : "opacity-90 hover:opacity-100"
                }`}
              >
                <div
                  className={`border rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-2xs flex flex-col items-center transition-all ${
                    activeModality === "cosine"
                      ? "bg-teal-50/95 border-teal-500 ring-2 ring-teal-100 shadow-sm"
                      : "bg-white/95 border-slate-200 hover:border-teal-300"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100/90 border border-teal-300 flex items-center justify-center mb-0.5 shadow-2xs">
                    <Layers className="w-3.5 h-3.5 text-teal-700" />
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium transition-colors ${
                      activeModality === "cosine" ? "text-teal-800" : "text-slate-700"
                    }`}
                  >
                    Cosine Norm
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Similarity cos(θ)</span>
                </div>
              </div>

              {/* CENTRAL ANCHOR: COLORFUL HERO MEDIA MANIFOLD */}
              <div className="relative z-30 w-[240px] sm:w-[270px] h-[175px] sm:h-[185px]">
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 flex flex-col justify-between relative transition-all duration-300 bg-white">
                  {/* Dynamic Color Rich Visual Background corresponding to the active modality */}
                  {activeModality === "code" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-green-500/25 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-mono text-green-900">
                        <span className="flex items-center space-x-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
                          <span>CodeBERT AST</span>
                        </span>
                        <span className="bg-green-100 border border-green-300 text-green-800 px-2 py-0.5 rounded-full text-[9px] font-medium">82.5% Clone</span>
                      </div>

                      {/* Visual Syntax Demonstration in Dark Modern IDE Container */}
                      <div className="bg-slate-900 text-slate-100 border border-emerald-500/40 rounded-xl p-2 font-mono text-[9px] space-y-1 shadow-sm">
                        <div className="flex items-center justify-between text-slate-300">
                          <span><span className="text-emerald-400">def</span> <span className="text-cyan-300">shortest_path</span>(g):</span>
                          <span className="text-[8px] text-slate-400 font-mono">Ref</span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-300">
                          <span><span className="text-teal-400">def</span> <span className="text-amber-300">find_min_route</span>(a):</span>
                          <span className="text-[8px] text-emerald-400 font-mono">Clone</span>
                        </div>
                      </div>

                      <div className="text-[9px] text-green-800 flex items-center space-x-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span>AST Tree Structural Invariance Matched</span>
                      </div>
                    </div>
                  )}

                  {activeModality === "text" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-yellow-500/25 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-mono text-orange-900">
                        <span className="flex items-center space-x-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping inline-block" />
                          <span>Sentence-BERT</span>
                        </span>
                        <span className="bg-orange-100 border border-orange-300 text-orange-800 px-2 py-0.5 rounded-full text-[9px] font-medium">66.7% Match</span>
                      </div>

                      <div className="bg-white/95 border border-orange-200/90 rounded-xl p-2 text-[9px] space-y-1 shadow-xs">
                        <div className="text-slate-600 truncate flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                          <span className="truncate">&quot;Multimodal deep models revolutionized evaluation...&quot;</span>
                        </div>
                        <div className="text-orange-900 truncate font-medium flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                          <span className="truncate">&quot;Deep neural architectures transformed appraisal...&quot;</span>
                        </div>
                      </div>

                      <div className="text-[9px] text-orange-800 flex items-center space-x-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-orange-600" />
                        <span>Latent Semantic Paraphrase Flagged</span>
                      </div>
                    </div>
                  )}

                  {activeModality === "heatmap" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-amber-500/10 to-orange-500/25 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-mono text-rose-900">
                        <span className="flex items-center space-x-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                          <span>4×4 Spatial Attention</span>
                        </span>
                        <span className="bg-rose-100 border border-rose-300 text-rose-800 px-2 py-0.5 rounded-full text-[9px] font-medium">4 Hotspots</span>
                      </div>

                      {/* Rich vibrant 4x4 patch grid with hotspots */}
                      <div className="bg-white/95 border border-rose-200/90 rounded-xl p-1.5 shadow-xs">
                        <div className="grid grid-cols-8 gap-1">
                          {[
                            0.2, 0.45, 0.92, 0.96, 0.1, 0.2, 0.35, 0.89,
                            0.3, 0.94, 0.25, 0.1, 0.45, 0.2, 0.15, 0.3,
                          ].map((val, idx) => (
                            <div
                              key={`heat-patch-${idx}`}
                              className={`h-3 rounded-xs transition-all ${
                                val >= 0.88
                                  ? "bg-rose-600 animate-pulse shadow-xs"
                                  : val >= 0.4
                                  ? "bg-amber-400"
                                  : "bg-slate-100"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-[9px] text-rose-800 flex items-center space-x-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-rose-600" />
                        <span>Visual Sub-Patch Attention Pinpointed</span>
                      </div>
                    </div>
                  )}

                  {activeModality === "image" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-sky-500/10 to-blue-500/25 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-mono text-blue-900">
                        <span className="flex items-center space-x-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
                          <span>CLIP ViT-B/32</span>
                        </span>
                        <span className="bg-blue-100 border border-blue-300 text-blue-800 px-2 py-0.5 rounded-full text-[9px] font-medium">87.8% High</span>
                      </div>

                      {/* Visual Flowchart Representation */}
                      <div className="bg-white/95 border border-blue-200/90 rounded-xl p-1.5 flex items-center justify-around shadow-xs">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-300 flex items-center justify-center text-[9px] font-mono text-blue-700 font-medium">
                          p₁
                        </div>
                        <div className="h-0.5 w-6 bg-blue-500 laser-active-line" />
                        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[9px] font-mono font-medium shadow-xs">
                          p₂
                        </div>
                        <div className="h-0.5 w-6 bg-blue-500 laser-active-line" />
                        <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-300 flex items-center justify-center text-[9px] font-mono text-blue-700 font-medium">
                          p₃
                        </div>
                      </div>

                      <div className="text-[9px] text-blue-800 flex items-center space-x-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>System Architecture Diagram Matched</span>
                      </div>
                    </div>
                  )}

                  {activeModality === "cosine" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-emerald-500/25 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-mono text-teal-900">
                        <span className="flex items-center space-x-1.5 font-medium">
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping inline-block" />
                          <span>Unified Cosine Space</span>
                        </span>
                        <span className="bg-teal-100 border border-teal-300 text-teal-800 px-2 py-0.5 rounded-full text-[9px] font-medium">cos(θ) = 0.825</span>
                      </div>

                      <div className="bg-white/95 border border-teal-200/90 rounded-xl p-2 font-mono text-[9px] text-teal-900 text-center shadow-xs">
                        cos(θ) = (u · v) / (||u|| ||v||)
                      </div>

                      <div className="text-[9px] text-teal-800 flex items-center space-x-1 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        <span>Joint Metric Space Calibrated</span>
                      </div>
                    </div>
                  )}

                  {/* Translucent Dark Pill Overlay */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10 w-[90%] text-center">
                    <div className="bg-slate-900/85 backdrop-blur-md text-white py-1 px-3 rounded-full text-[10px] font-medium tracking-wide shadow-md truncate">
                      {currentConfig.badgeText}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Interactive Modality Scrubber Pills */}
            <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                {MODALITIES.map((mod) => {
                  const isActive = mod.key === activeModality;
                  return (
                    <button
                      key={`btn-${mod.key}`}
                      type="button"
                      onClick={() => setActiveModality(mod.key)}
                      style={{
                        backgroundColor: isActive ? mod.color : undefined,
                        borderColor: mod.color,
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap border ${
                        isActive
                          ? "text-white shadow-xs"
                          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {mod.label}
                    </button>
                  );
                })}
              </div>

              {/* Play / Pause Rotation Status */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md flex-shrink-0 flex items-center space-x-1 text-[11px]"
                title={isPaused ? "Play animation cycle" : "Pause animation cycle"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline text-[10px] font-mono">
                  {isPaused ? "Paused" : "Auto"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
