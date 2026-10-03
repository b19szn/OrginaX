"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plug,
  Lock,
  Radio,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  ExternalLink,
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

export default function ProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean } | null>(null);
  const [inputKeys, setInputKeys] = useState<Record<string, string>>({});
  const [savingKeyId, setSavingKeyId] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ai-models");
      const json = await res.json();
      if (json.success) {
        setProviders(json.providers);
      }
    } catch (e) {
      console.error("Failed to load providers", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Providers
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure active multi-modal similarity inference engines and vector pipelines.
          </p>
        </div>

        <button
          onClick={fetchProviders}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {providers.map((p) => {
          const isLocal = p.provider === "LOCAL";
          const isTesting = testingId === p.id;
          const hasTestMsg = testResult && testResult.id === p.id;

          return (
            <div
              key={p.id}
              className={`p-6 rounded-3xl bg-white/90 backdrop-blur-md border transition-all duration-200 shadow-xs space-y-4 flex flex-col justify-between ${
                p.isEnabled ? "border-slate-300" : "border-slate-200/80 opacity-90"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shadow-2xs">
                      {p.provider.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
                        {p.name}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-400">
                        {p.modelId}
                      </div>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleEnabled(p)}
                    aria-label="Toggle enable"
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      p.isEnabled ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        p.isEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* API Key Vault Masked Field */}
                {!isLocal && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        API Key
                      </span>
                      {p.apiKeyMasked && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {p.apiKeyMasked}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder={p.apiKeyMasked ? "Rotate key..." : "Enter secret key..."}
                        value={inputKeys[p.id] || ""}
                        onChange={(e) => setInputKeys({ ...inputKeys, [p.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleSaveApiKey(p.id)}
                        disabled={savingKeyId === p.id || !inputKeys[p.id]}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 transition disabled:opacity-40"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {/* Test Feedback */}
                {hasTestMsg && (
                  <div className={`mt-3 p-2 rounded-xl text-xs flex items-center gap-2 ${
                    testResult.success ? "bg-sky-50 text-sky-800 border border-sky-200" : "bg-red-50 text-red-800 border border-red-200"
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                    <span className="text-[11px] truncate">{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold ${
                  p.status === "HEALTHY"
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.status === "HEALTHY" ? "bg-sky-500" : "bg-slate-400"}`}></span>
                  {p.status}
                  {p.lastLatencyMs && ` (${p.lastLatencyMs}ms)`}
                </span>

                <button
                  onClick={() => handleTestConnection(p.id)}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  <Radio className={`w-3 h-3 ${isTesting ? "animate-spin text-emerald-600" : ""}`} />
                  <span>{isTesting ? "Pinging..." : "Test"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
