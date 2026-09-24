"use client";

import React, { useState } from "react";
import {
  Palette,
  Sliders,
  Check,
  Save,
  Image as ImageIcon,
  Sparkles,
  Layers,
} from "lucide-react";

export default function ImageEnginePage() {
  const [algorithm, setAlgorithm] = useState("PHASH_DCT");
  const [resolution, setResolution] = useState("256");
  const [tolerance, setTolerance] = useState(12);
  const [ocrDiagrams, setOcrDiagrams] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Image Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Diagram, architectural blueprint, and visual similarity analysis settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="self-start sm:self-auto flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-xs transition"
        >
          {saved ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? "Saved" : saving ? "Saving..." : "Save Configuration"}</span>
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Perceptual Hash Algorithm */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Perceptual Hash Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-hidden"
            >
              <option value="PHASH_DCT">pHash (Discrete Cosine Transform) - Recommended</option>
              <option value="DHASH_DIFF">dHash (Gradient Difference Hash)</option>
              <option value="AHASH_AVG">aHash (Average Color Intensity)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              pHash resists compression, rotation up to 5°, and format transcoding.
            </p>
          </div>

          {/* Raster Normalization Resolution */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Normalization Grid Resolution
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-hidden"
            >
              <option value="128">128 × 128 (Ultra Fast)</option>
              <option value="256">256 × 256 (Balanced Standard)</option>
              <option value="512">512 × 512 (High Fidelity Schematics)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Downsamples incoming diagrams before spatial frequency extraction.
            </p>
          </div>
        </div>

        {/* Tolerance Slider */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Hamming Distance Match Tolerance</span>
            <span className="font-mono text-indigo-700 font-bold">{tolerance} bits</span>
          </div>
          <input
            type="range"
            min="2"
            max="24"
            step="1"
            value={tolerance}
            onChange={(e) => setTolerance(parseInt(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Strict (Exact matches only)</span>
            <span>Permissive (Detects heavy diagram paraphrasing)</span>
          </div>
        </div>

        {/* OCR Toggle */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200/60">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Extract Diagram Text Blocks via OCR</span>
            <span className="text-[11px] text-slate-500 block">Runs OCR on flowchart and diagram nodes to enable cross-modal text diffing.</span>
          </div>

          <label className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden bg-indigo-600">
            <input
              type="checkbox"
              checked={ocrDiagrams}
              onChange={(e) => setOcrDiagrams(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                ocrDiagrams ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
