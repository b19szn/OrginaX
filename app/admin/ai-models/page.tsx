"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sliders,
  RefreshCw,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Server,
  Database,
  Radio,
  Save,
  Check,
} from "lucide-react";

interface AIProvider {
  id: string;
  provider: string;
  name: string;
  apiKeyMasked: string | null;
  endpointUrl: string | null;
  isEnabled: boolean;
  isFallback: boolean;
  modelId: string;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
  lastLatencyMs: number | null;
  status: string;
}

interface ScoringFormula {
  textWeight: number;
  codeWeight: number;
  diagramWeight: number;
  similarityThreshold: number;
  strictMode: boolean;
}

export default function AIModelOrchestrationPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [scoringFormula, setScoringFormula] = useState<ScoringFormula>({
    textWeight: 0.40,
    codeWeight: 0.35,
    diagramWeight: 0.25,
    similarityThreshold: 75.0,
    strictMode: true,
  });

  const [loading, setLoading] = useState(true);
  const [savingKeyId, setSavingKeyId] = useState<string | null>(null);
  const [inputKeys, setInputKeys] = useState<Record<string, string>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean } | null>(null);
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightSaveSuccess, setWeightSaveSuccess] = useState(false);

  const fetchAIConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ai-models");
      const json = await res.json();
      if (json.success) {
        setProviders(json.providers);
        if (json.scoringFormula) {
          setScoringFormula({
            textWeight: json.scoringFormula.textWeight,
            codeWeight: json.scoringFormula.codeWeight,
            diagramWeight: json.scoringFormula.diagramWeight,
            similarityThreshold: json.scoringFormula.similarityThreshold,
            strictMode: json.scoringFormula.strictMode,
          });
        }
      }
    } catch (e) {
      console.error("Failed to load AI config", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIConfig();
  }, []);

  const handleTestConnection = async (providerId: string) => {
    try {
      setTestingId(providerId);
      setTestResult(null);
      const res = await fetch("/api/admin/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TEST_CONNECTION", providerId }),
      });
      const json = await res.json();
      if (json.success) {
        setTestResult({ id: providerId, message: json.message, success: true });
        setProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, status: "HEALTHY", lastLatencyMs: json.provider.lastLatencyMs } : p))
        );
      } else {
        setTestResult({ id: providerId, message: json.error || "Connection failed", success: false });
      }
    } catch (e) {
      setTestResult({ id: providerId, message: "Network timeout or unreachable host", success: false });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleEnabled = async (provider: AIProvider) => {
    try {
      const nextState = !provider.isEnabled;
      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, isEnabled: nextState } : p))
      );

      await fetch("/api/admin/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROVIDER",
          providerId: provider.id,
          isEnabled: nextState,
        }),
      });
    } catch (e) {
      console.error("Toggle provider failed", e);
    }
  };

  const handleSetFallback = async (providerId: string) => {
    try {
      setProviders((prev) =>
        prev.map((p) => ({ ...p, isFallback: p.id === providerId }))
      );

      await fetch("/api/admin/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROVIDER",
          providerId,
          isFallback: true,
        }),
      });
    } catch (e) {
      console.error("Set fallback failed", e);
    }
  };

  const handleSaveApiKey = async (providerId: string) => {
    const rawKey = inputKeys[providerId];
    if (!rawKey || !rawKey.trim()) return;

    try {
      setSavingKeyId(providerId);
      const res = await fetch("/api/admin/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_PROVIDER",
          providerId,
          newApiKey: rawKey.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, apiKeyMasked: json.provider.apiKeyMasked, status: "HEALTHY" } : p))
        );
        setInputKeys((prev) => ({ ...prev, [providerId]: "" }));
      }
    } catch (e) {
      console.error("Save API key failed", e);
    } finally {
      setSavingKeyId(null);
    }
  };

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            AI Model & Provider Orchestration Engine
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
              Dynamic Vault
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage LLM inference gateways, vector indexes, encrypted credentials, and multimodal scoring weights.
          </p>
        </div>

        <button
          onClick={fetchAIConfig}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-slate-700 border border-slate-200/80 hover:bg-slate-50 transition shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          <span>Refresh Providers</span>
        </button>
      </div>

      {/* SECTION 1: DYNAMIC WEIGHT & SCORING TUNER */}
      <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Multimodal Similarity Scoring Calibrator</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                totalWeightPercent === 100
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                Total: {totalWeightPercent}%
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Calibrate system-wide weighting coefficients across Text Documents, Source Code ASTs, and Diagram rasters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveWeights}
              disabled={savingWeights || totalWeightPercent !== 100}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        {/* 3 Slider Controls + Plagiarism Threshold */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Text Weight */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
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
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
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
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
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

        {/* Threshold & Strict Mode Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/60 text-xs">
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
              className="w-40 accent-indigo-600 cursor-pointer"
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

        {/* Live Mathematical Formula Preview */}
        <div className="p-3.5 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl border border-slate-800 flex items-center justify-between overflow-x-auto shadow-2xs">
          <div>
            <span className="text-slate-400">Composite_Score = </span>
            <span className="text-blue-400">({scoringFormula.textWeight.toFixed(2)} × S_text)</span>
            <span className="text-slate-400"> + </span>
            <span className="text-emerald-400">({scoringFormula.codeWeight.toFixed(2)} × S_code)</span>
            <span className="text-slate-400"> + </span>
            <span className="text-amber-400">({scoringFormula.diagramWeight.toFixed(2)} × S_diag)</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Live Evaluation Formula</span>
        </div>
      </div>

      {/* SECTION 2: API KEY & PROVIDER VAULT */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Provider Vault & Model Catalog</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {providers.length} Registered
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Store, rotate, and live-test credentials for OpenAI, Anthropic, Google Gemini, Grok, DeepSeek, HuggingFace, and Vector stores.
          </p>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {providers.map((p) => {
            const isLocal = p.provider === "LOCAL";
            const isVectorDB = p.provider === "QDRANT" || p.provider === "MILVUS";
            const isTesting = testingId === p.id;
            const hasTestMsg = testResult && testResult.id === p.id;

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl bg-white/85 backdrop-blur-md border transition-all duration-200 shadow-xs space-y-4 ${
                  p.isEnabled
                    ? "border-slate-300"
                    : "border-slate-200/70 opacity-90"
                }`}
              >
                {/* Header: Title, Status, Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs border ${
                      p.provider === "OPENAI"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : p.provider === "ANTHROPIC"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : p.provider === "GEMINI"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : p.provider === "DEEPSEEK"
                        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                        : p.provider === "GROK"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : isVectorDB
                        ? "bg-violet-50 text-violet-700 border-violet-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {p.provider.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">
                          {p.name}
                        </h3>
                        {p.isFallback && (
                          <span className="text-[10px] font-mono px-2 py-0.2 bg-amber-100 text-amber-800 rounded-full font-semibold border border-amber-200">
                            Primary Fallback
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        Model ID: {p.modelId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                      p.status === "HEALTHY"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === "HEALTHY" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                      {p.status}
                      {p.lastLatencyMs && ` (${p.lastLatencyMs}ms)`}
                    </span>

                    {/* Enable Toggle Switch */}
                    <button
                      onClick={() => handleToggleEnabled(p)}
                      aria-label="Toggle enable"
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        p.isEnabled ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          p.isEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* API Key Vault Masked Field */}
                {!isLocal && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        API Vault Key
                      </span>
                      {p.apiKeyMasked && (
                        <span className="font-mono text-[11px] text-slate-400 font-normal">
                          Current: {p.apiKeyMasked}
                        </span>
                      )}
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder={p.apiKeyMasked ? "Enter new key to rotate..." : "Enter provider secret key..."}
                        value={inputKeys[p.id] || ""}
                        onChange={(e) => setInputKeys({ ...inputKeys, [p.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleSaveApiKey(p.id)}
                        disabled={savingKeyId === p.id || !inputKeys[p.id]}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 transition disabled:opacity-40"
                      >
                        {savingKeyId === p.id ? "Saving..." : "Update Key"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Endpoint URL for Self-Hosted or Vector DBs */}
                {p.endpointUrl && (
                  <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-200/60 truncate">
                    Endpoint: {p.endpointUrl}
                  </div>
                )}

                {/* Parameters: Max Tokens, Temperature, Fallback status */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Max Tokens</span>
                    <span className="font-mono font-medium text-slate-700">
                      {p.maxTokens > 0 ? p.maxTokens : "Unlimited"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Temperature</span>
                    <span className="font-mono font-medium text-slate-700">
                      {p.temperature.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase">Timeout</span>
                    <span className="font-mono font-medium text-slate-700">
                      {p.timeoutMs / 1000}s
                    </span>
                  </div>
                </div>

                {/* Test Result Feedback */}
                {hasTestMsg && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    testResult.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                    <span>{testResult.message}</span>
                  </div>
                )}

                {/* Actions: Test Connection & Set Default Fallback */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleTestConnection(p.id)}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    <Radio className={`w-3 h-3 ${isTesting ? "animate-spin text-indigo-600" : ""}`} />
                    <span>{isTesting ? "Pinging..." : "Test Connection"}</span>
                  </button>

                  {!p.isFallback && (
                    <button
                      onClick={() => handleSetFallback(p.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                    >
                      Make Default Fallback
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
