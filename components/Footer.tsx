import Link from "next/link";
import { ShieldCheck, Cpu, Layers, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white/70 backdrop-blur-md text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-800 text-lg tracking-tight">
                OriginaX
              </span>
              <span className="text-[10px] font-normal tracking-wider uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                Multi-Modal v2.4
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm font-normal">
              An automated cross-artifact similarity analysis framework designed to detect plagiarism beyond text by projecting natural language, source code ASTs, and visual raster diagrams into unified semantic metric spaces.
            </p>

            <div className="pt-2 text-slate-500 font-mono text-[11px] flex items-center space-x-2">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="w-2 h-2 rounded-full bg-teal-500" />
              </span>
              <span>Joint Manifold Topology · Originality Pipeline</span>
            </div>
          </div>

          {/* Col 2: Ingestion Modalities */}
          <div>
            <h4 className="font-medium text-slate-700 uppercase tracking-wider text-[11px] mb-3.5">
              Artifact Modalities
            </h4>
            <ul className="space-y-2.5 text-slate-500 font-normal">
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Text &amp; PDF (Sentence-BERT)
              </li>
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Source Code (CodeBERT AST)
              </li>
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Visual Diagrams (CLIP ViT)
              </li>
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Localized Patch Heatmap (4×4)
              </li>
            </ul>
          </div>

          {/* Col 3: Research & Metrics */}
          <div>
            <h4 className="font-medium text-slate-700 uppercase tracking-wider text-[11px] mb-3.5">
              Evaluation Metrics
            </h4>
            <ul className="space-y-2.5 text-slate-500 font-normal">
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Cosine Inner Product (0–100%)
              </li>
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Calibrated Thresholds (&gt;85%)
              </li>
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Token Jaccard &amp; AST Similarity
              </li>
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                End-to-End Latency Tracking
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Stack */}
          <div>
            <h4 className="font-medium text-slate-700 uppercase tracking-wider text-[11px] mb-3.5">
              System Architecture
            </h4>
            <ul className="space-y-2.5 text-slate-500 font-normal">
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Next.js App Router (TypeScript)
              </li>
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Prisma ORM (SQLite / MySQL)
              </li>
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                HuggingFace Inference Gateway
              </li>
              <li className="hover:text-slate-800 transition-colors cursor-pointer">
                Unified Originality Report Generator
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-footer */}
      <div className="border-t border-slate-200/60 bg-white/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <div className="font-normal">
            &copy; {new Date().getFullYear()} OriginaX · AI Tool to Detect Plagiarism Beyond Text. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-slate-500 font-normal">
            <Link href="/dashboard" className="hover:text-slate-800 transition-colors">
              Dashboard
            </Link>
            <a href="#upload-section" className="hover:text-slate-800 transition-colors">
              Ingestion Engine
            </a>
            <a href="#audit-section" className="hover:text-slate-800 transition-colors">
              Audit Trail
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
