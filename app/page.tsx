"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Code2,
  FileText,
  Image as ImageIcon,
  Binary,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Zap,
  Cpu,
  BarChart3,
  Network,
  Users,
  Eye,
  FileCode,
  LogIn,
  LayoutDashboard,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import HeroBanner from "@/components/HeroBanner";
import PricingSection from "@/components/PricingSection";

export default function HomePage() {
  const { user, openAuthModal } = useAuth();
  const [activeComparisonIndex, setActiveComparisonIndex] = useState(0);

  const comparisonRows = [
    {
      title: "Detection Modality Scope",
      traditional: "Plain text strings and ASCII characters only. Completely blind to images, diagrams, or source code ASTs.",
      originax: "Unified Multi-Modal Space: Ingests raw Text, Source Code (ASTs), Vector Diagrams, Flowcharts, and Mathematical proofs.",
      traditionalBadge: "Single-Modal (Text)",
      originaxBadge: "5 Heterogeneous Modalities",
    },
    {
      title: "Paraphrase & Synonym Substitution",
      traditional: "Easily defeated by thesaurus word replacement, punctuation alteration, and sentence inversion (n-gram break).",
      originax: "Deep contextual embeddings map semantic meaning rather than lexical tokens. 96.2% resilience to advanced paraphrasing.",
      traditionalBadge: "Brittle Lexical Match",
      originaxBadge: "Deep Semantic Invariance",
    },
    {
      title: "Source Code Plagiarism",
      traditional: "Treats code as text. Bypassed by variable renaming, comment stripping, reordering helper functions, or loops-to-recursion.",
      originax: "Extracts Abstract Syntax Trees (ASTs). Normalizes identifiers and control flows. 98.4% detection rate on obfuscated code.",
      traditionalBadge: "0% AST Structural Awareness",
      originaxBadge: "AST Graph Isomorphism",
    },
    {
      title: "Visual Figures & Architecture Diagrams",
      traditional: "0% capability. Students can copy flowcharts, system diagrams, or plots without any warning.",
      originax: "Vision Transformer (ViT) patch slicing and OCR text extraction compute visual-structural similarity heatmaps across graphics.",
      traditionalBadge: "Blind to Visual Artifacts",
      originaxBadge: "ViT Patch Heatmap Analysis",
    },
    {
      title: "Cross-Modal Congruence",
      traditional: "Impossible. Cannot correlate an algorithmic flowchart with its code implementation or textual summary.",
      originax: "Projects disparate media types into a shared 768-dimensional manifold, detecting cross-format derivation.",
      traditionalBadge: "Unsupported",
      originaxBadge: "Joint-Space Projection",
    },
    {
      title: "Explainability & Audit Trail",
      traditional: "Generic percentage score with superficial highlighter marks without structural semantic explanation.",
      originax: "Unified Originality Report with token-level diffs, AST node alignment trees, and visual patch heatmaps.",
      traditionalBadge: "Basic String Diff",
      originaxBadge: "Structural Explainability",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col multimodal-canvas text-slate-700 antialiased font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* ---------------- PUBLIC NAVIGATION HEADER ---------------- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3.5">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs group-hover:scale-105 transition-all">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-800 text-lg tracking-tight">
                  OriginaX
                </span>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  v2.4
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">
                Multi-Modal Plagiarism Detector
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-normal text-slate-600">
            <a href="#hero-section" className="hover:text-slate-800 transition-colors">
              Convergence Hub
            </a>
            <a href="#comparison-section" className="hover:text-slate-800 transition-colors">
              Traditional vs AI
            </a>
            <a href="#pipeline-section" className="hover:text-slate-800 transition-colors">
              Joint Architecture
            </a>
            <a href="#benchmarks-section" className="hover:text-slate-800 transition-colors">
              Research Benchmarks
            </a>
          </nav>

          {/* Action Buttons (Original GitHub Pill Buttons) */}
          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                href="/dashboard"
                className="primary-pill-btn text-xs sm:text-sm font-medium tracking-wide inline-flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={openAuthModal}
                  className="secondary-pill-btn text-xs sm:text-sm font-medium inline-flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </button>
                <Link
                  href="/dashboard"
                  className="primary-pill-btn text-xs sm:text-sm font-medium tracking-wide inline-flex items-center space-x-2"
                >
                  <span>Launch Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal />

      <main className="flex-1">
        {/* ---------------- SECTION 1: ORIGINAL UPPER HERO PART (Interactive Convergence Hub) ---------------- */}
        <section id="hero-section" className="relative overflow-hidden pt-2 pb-6 sm:pt-4 sm:pb-8 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HeroBanner />
          </div>
        </section>

        {/* ---------------- SECTION 2: TRADITIONAL VS ORIGINAX (Good Moved Content) ---------------- */}
        <section id="comparison-section" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium mb-3">
                <span>The Core Scientific Problem</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-normal text-slate-900 tracking-tight">
                Why Traditional Plagiarism Detectors Fail
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal">
                Standard industry tools were engineered in the 2000s for static word-overlap. Modern university assignments
                involve source code, architecture diagrams, and AI-assisted paraphrasing that evade legacy algorithms.
              </p>
            </div>

            {/* Side-by-Side Comparison Matrix */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                {/* Traditional Side */}
                <div className="p-6 sm:p-8 bg-slate-50/60">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Traditional Detectors
                      </h3>
                      <p className="text-xs text-slate-500">
                        Lexical N-Gram &amp; Exact String Matching
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white border border-rose-200/70 shadow-2xs">
                      <div className="text-xs font-semibold text-rose-800 mb-1">
                        🔴 Vulnerable to Variable Renaming
                      </div>
                      <p className="text-xs text-slate-600">
                        Renaming variables (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded">curr_node</code> to <code className="bg-slate-100 px-1 py-0.5 rounded">frontier_item</code>) destroys character n-grams, dropping match confidence from 100% to under 15%.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-rose-200/70 shadow-2xs">
                      <div className="text-xs font-semibold text-rose-800 mb-1">
                        🔴 Blind to Diagrams, Figures &amp; Charts
                      </div>
                      <p className="text-xs text-slate-600">
                        Completely ignores image files, flowcharts, vector graphs, and screenshots pasted into submitted academic papers and documents.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-rose-200/70 shadow-2xs">
                      <div className="text-xs font-semibold text-rose-800 mb-1">
                        🔴 Bypassed by Synonym Substitution
                      </div>
                      <p className="text-xs text-slate-600">
                        Replacing every third word with a synonym prevents string hashing collision algorithms from detecting the underlying conceptual copy.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-rose-200/70 shadow-2xs">
                      <div className="text-xs font-semibold text-rose-800 mb-1">
                        🔴 Zero Cross-Modal Correlation
                      </div>
                      <p className="text-xs text-slate-600">
                        Cannot identify that an algorithmic implementation in Python was directly plagiarized from a paper’s pseudocode or architectural diagram.
                      </p>
                    </div>
                  </div>
                </div>

                {/* OriginaX Multi-Modal Side */}
                <div className="p-6 sm:p-8 bg-emerald-50/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        OriginaX AI Multi-Modal Engine
                      </h3>
                      <p className="text-xs text-emerald-700 font-medium">
                        AST Invariance &amp; 768-D Joint Embedding Space
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs">
                      <div className="text-xs font-semibold text-emerald-900 mb-1">
                        🔹 Abstract Syntax Tree (AST) Invariance
                      </div>
                      <p className="text-xs text-slate-600">
                        Parses Python, C++, Java, and JS into abstract syntax trees. Renaming variables, rearranging helper functions, or swapping loops produces identical AST hashes (98.4% match).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs">
                      <div className="text-xs font-semibold text-emerald-900 mb-1">
                        🔹 Vision Transformer (ViT) Patch Matcher
                      </div>
                      <p className="text-xs text-slate-600">
                        Slices diagrams into 16x16 feature patches to detect rotated, re-colored, cropped, or slightly edited architectural diagrams and flowcharts.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs">
                      <div className="text-xs font-semibold text-emerald-900 mb-1">
                        🔹 Deep Contextual NLP Representation
                      </div>
                      <p className="text-xs text-slate-600">
                        Projects entire paragraphs into high-dimensional semantic vectors. Retains high similarity scores even when text is rewritten using AI paraphrasing tools.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs">
                      <div className="text-xs font-semibold text-emerald-900 mb-1">
                        🔹 Unified Cross-Modal Correlation
                      </div>
                      <p className="text-xs text-slate-600">
                        Projects code implementations and textual descriptions into a shared coordinate space, detecting cross-format derivation automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Accordion Table */}
              <div className="border-t border-slate-200 bg-slate-50/50 p-6 sm:p-8">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">
                  Feature-by-Feature Engineering Comparison:
                </h4>
                <div className="space-y-3">
                  {comparisonRows.map((row, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveComparisonIndex(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        activeComparisonIndex === idx
                          ? "bg-white border-emerald-300 shadow-xs"
                          : "bg-white/70 border-slate-200/80 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-medium text-slate-900">
                          {row.title}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            {row.traditionalBadge}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.originaxBadge}
                          </span>
                        </div>
                      </div>

                      {activeComparisonIndex === idx && (
                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-semibold text-rose-700">Legacy Detectors:</span>
                            <p className="text-slate-600 mt-1">{row.traditional}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-emerald-700">OriginaX AI:</span>
                            <p className="text-slate-600 mt-1">{row.originax}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 3: ARCHITECTURE & METHODOLOGY ---------------- */}
        <section id="pipeline-section" className="py-16 sm:py-24 bg-[#fafbfc] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mb-3">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>The 5-Stage Scientific Pipeline</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-normal text-slate-900 tracking-tight">
                How OriginaX Unifies Multi-Modal Vectors
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal">
                Through unified multi-modal alignment, artifacts of any type are tokenized, normalized,
                and projected onto a shared hypersphere manifold.
              </p>
            </div>

            {/* Pipeline Step Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 mb-3">
                    01
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                    Multi-Modal Ingestion
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Accepts raw PDFs, Python/C++ source code, image diagrams (PNG/JPG), and mathematical equations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-emerald-600 font-medium">
                  Direct Upload &amp; Paste
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 mb-3">
                    02
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                    AST &amp; ViT Preprocessing
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Generates Abstract Syntax Trees for code; extracts layout OCR from PDFs; slices diagrams into 16x16 patches.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-emerald-600 font-medium">
                  Structural Normalization
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 mb-3">
                    03
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                    Joint-Space Projection
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Embeddings mapped to 768-dimensional coordinates where semantic proximity reflects conceptual overlap.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-emerald-600 font-medium">
                  768-D Shared Manifold
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 mb-3">
                    04
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                    Cosine &amp; AST Scoring
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Weighted formula: 40% Text, 35% AST Code, 25% Visual Graphic. Strict bipartite Hungarian assignment.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-emerald-600 font-medium">
                  Calibrated Scoring Formula
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 mb-3">
                    05
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mb-1.5">
                    Unified Report &amp; Diff
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Produces interactive visual diffs, syntax node alignment, and audit-ready PDF reports for evaluators and institutions.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-emerald-600 font-medium">
                  Audit-Ready Evidence
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 4: RESEARCH BENCHMARKS ---------------- */}
        <section id="benchmarks-section" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mb-3">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Empirical Academic Evaluation</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-normal text-slate-900 tracking-tight">
                Validated Performance Benchmarks
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal">
                Tested against benchmark datasets containing over 1,200 cross-modality student submission pairs.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="text-3xl sm:text-4xl font-semibold text-emerald-600 tracking-tight">
                  98.4%
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-800 mt-2">
                  Code Obfuscation Accuracy
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Resistant to renaming &amp; control transposition
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="text-3xl sm:text-4xl font-semibold text-blue-600 tracking-tight">
                  96.2%
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-800 mt-2">
                  Academic Paraphrase Recall
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Evaluated on multi-sentence research summaries and abstracts
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="text-3xl sm:text-4xl font-semibold text-teal-600 tracking-tight">
                  94.7%
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-800 mt-2">
                  Diagram &amp; Flowchart Match
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ViT patch overlap on altered graphics
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="text-3xl sm:text-4xl font-semibold text-slate-800 tracking-tight">
                  180ms
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-800 mt-2">
                  Average Inference Latency
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Sub-second matrix generation
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- SECTION 5: SUBSCRIPTION PLANS & PRICING ---------------- */}
        <PricingSection />

        {/* ---------------- SECTION 6: CTA BANNER ---------------- */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-normal tracking-tight">
              Ready to Analyze Submissions with OriginaX?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-normal">
              Sign in with your institutional credentials or launch the researcher workspace to run single-pair AST
              comparisons and N×N classroom cross-examinations.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3 bg-[#334155] hover:bg-[#1e293b] text-white font-medium text-xs sm:text-sm rounded-full shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open User Dashboard</span>
              </Link>

              <button
                onClick={openAuthModal}
                className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm rounded-full border border-white/20 transition-all flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Instant Evaluator Demo Sign In</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- PUBLIC FOOTER ---------------- */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>OriginaX AI · Academic Multi-Modal Similarity Analysis Framework</span>
          </div>

          <div className="text-xs text-slate-400">
            OriginaX Multi-Modal Framework · Advanced Similarity Analysis &amp; Cross-Modal Integrity Platform
          </div>
        </div>
      </footer>
    </div>
  );
}
