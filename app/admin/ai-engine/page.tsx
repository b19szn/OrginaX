"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Sliders,
  Save,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface ScoringFormula {
  textWeight: number;
  codeWeight: number;
  diagramWeight: number;
  similarityThreshold: number;
  strictMode: boolean;
}

export default function AIEngineCalibratorPage() {
  const [scoringFormula, setScoringFormula] = useState<ScoringFormula>({
    textWeight: 0.40,
    codeWeight: 0.35,
    diagramWeight: 0.25,
    similarityThreshold: 75.0,
    strictMode: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightSaveSuccess, setWeightSaveSuccess] = useState(false);

  const fetchFormula = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ai-models");
      const json = await res.json();
      if (json.success && json.scoringFormula) {
        setScoringFormula({
          textWeight: json.scoringFormula.textWeight,
          codeWeight: json.scoringFormula.codeWeight,
          diagramWeight: json.scoringFormula.diagramWeight,
          similarityThreshold: json.scoringFormula.similarityThreshold,
          strictMode: json.scoringFormula.strictMode,
        });
      }
    } catch (e) {
      console.error("Failed to load formula", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormula();
  }, []);

  const handleSaveWeights = async () => {
    try {
      setSavingWeights(true);
      setWeightSaveSuccess(false);

      const res = await fetch("/api/admin/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SCORING_FORMULA",
          ...scoringFormula,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setWeightSaveSuccess(true);
        setTimeout(() => setWeightSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Save weights failed", e);
    } finally {
      setSavingWeights(false);
    }
  };

  const totalWeightPercent = Math.round(
    (scoringFormula.textWeight + scoringFormula.codeWeight + scoringFormula.diagramWeight) * 100
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            AI Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Multimodal similarity scoring formula calibration and collusion thresholds.
          </p>
        </div>

        <button
          onClick={handleSaveWeights}
          disabled={savingWeights || totalWeightPercent !== 100}
          className="self-start sm:self-auto flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-xs transition disabled:opacity-50"
        >
          {weightSaveSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Calibrated & Active</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{savingWeights ? "Calibrating..." : "Calibrate Engine"}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Calibrator Card */}
      <div className="p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Similarity Coefficient Allocation</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Weights must total exactly 100% across all three primary artifact domains.
            </p>
          </div>
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
            totalWeightPercent === 100
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            Total Allocation: {totalWeightPercent}%
          </span>
        </div>

        {/* 3 Slider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Text Weight */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Text Document Weight (W_text)
              </span>
              <span className="font-mono text-blue-600 text-sm">
                {Math.round(scoringFormula.textWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={scoringFormula.textWeight}
              onChange={(e) => setScoringFormula({ ...scoringFormula, textWeight: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Weights natural language n-grams, dual-engine PDF text streams, and semantic embeddings.
            </div>
          </div>

          {/* Code Weight */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Source Code AST Weight (W_code)
              </span>
              <span className="font-mono text-emerald-700 text-sm">
                {Math.round(scoringFormula.codeWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={scoringFormula.codeWeight}
              onChange={(e) => setScoringFormula({ ...scoringFormula, codeWeight: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Weights syntax canonicalization, token stripping (&lt;ID&gt;, &lt;NUM&gt;), and control flow graphs.
            </div>
          </div>

          {/* Diagram Weight */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Diagram & Figure Weight (W_diag)
              </span>
              <span className="font-mono text-amber-700 text-sm">
                {Math.round(scoringFormula.diagramWeight * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={scoringFormula.diagramWeight}
              onChange={(e) => setScoringFormula({ ...scoringFormula, diagramWeight: parseFloat(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Weights perceptual hashes, visual layout matrices, and spatial geometry alignment.
            </div>
          </div>
        </div>

        {/* Threshold Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-800 block">
              Severe Collusion Alert Threshold: <strong className="font-mono text-indigo-700">{scoringFormula.similarityThreshold}%</strong>
            </span>
            <span className="text-[11px] text-slate-500 block">
              Pairwise comparisons exceeding this composite score trigger immediate peer collusion warnings.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={scoringFormula.similarityThreshold}
              onChange={(e) => setScoringFormula({ ...scoringFormula, similarityThreshold: parseFloat(e.target.value) })}
              className="w-44 accent-indigo-600 cursor-pointer"
            />

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={scoringFormula.strictMode}
                onChange={(e) => setScoringFormula({ ...scoringFormula, strictMode: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span className="font-medium text-slate-700 text-xs">Strict Mode (Penalize partial matches)</span>
            </label>
          </div>
        </div>

        {/* Formula Math Box */}
        <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-2xl border border-slate-800 flex items-center justify-between overflow-x-auto shadow-2xs">
          <div>
            <span className="text-slate-400">Composite_Score = </span>
            <span className="text-blue-400">({scoringFormula.textWeight.toFixed(2)} × S_text)</span>
            <span className="text-slate-400"> + </span>
            <span className="text-emerald-400">({scoringFormula.codeWeight.toFixed(2)} × S_code)</span>
            <span className="text-slate-400"> + </span>
            <span className="text-amber-400">({scoringFormula.diagramWeight.toFixed(2)} × S_diag)</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Live Evaluation Rule</span>
        </div>
      </div>
    </div>
  );
}
