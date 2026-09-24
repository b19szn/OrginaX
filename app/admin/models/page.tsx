"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";

interface ModelRecord {
  id: string;
  name: string;
  provider: string;
  category: "EMBEDDING" | "REASONING" | "AST_CODE" | "VISION";
  modelId: string;
  maxTokens: number;
  temperature: number;
  isEnabled: boolean;
}

export default function ModelsCatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("ALL");

  const [models, setModels] = useState<ModelRecord[]>([
    { id: "m1", name: "Text-Embedding-3-Large", provider: "OpenAI", category: "EMBEDDING", modelId: "text-embedding-3-large", maxTokens: 8192, temperature: 0.0, isEnabled: true },
    { id: "m2", name: "GPT-4o Multimodal Analyzer", provider: "OpenAI", category: "REASONING", modelId: "gpt-4o", maxTokens: 4096, temperature: 0.1, isEnabled: true },
    { id: "m3", name: "Claude 3.5 Sonnet", provider: "Anthropic", category: "REASONING", modelId: "claude-3-5-sonnet-20241022", maxTokens: 8192, temperature: 0.1, isEnabled: true },
    { id: "m4", name: "Gemini 1.5 Pro", provider: "Google", category: "REASONING", modelId: "gemini-1.5-pro", maxTokens: 8192, temperature: 0.1, isEnabled: true },
    { id: "m5", name: "DeepSeek Coder 33B", provider: "DeepSeek", category: "AST_CODE", modelId: "deepseek-coder-33b-instruct", maxTokens: 4096, temperature: 0.1, isEnabled: true },
    { id: "m6", name: "Sentence-MiniLM-L6-v2", provider: "HuggingFace", category: "EMBEDDING", modelId: "all-MiniLM-L6-v2", maxTokens: 512, temperature: 0.0, isEnabled: true },
    { id: "m7", name: "CodeBERT Base Canonicalizer", provider: "HuggingFace", category: "AST_CODE", modelId: "microsoft/codebert-base", maxTokens: 512, temperature: 0.0, isEnabled: true },
    { id: "m8", name: "CLIP ViT-B/32 Perceptual Vision", provider: "HuggingFace", category: "VISION", modelId: "openai/clip-vit-base-patch32", maxTokens: 0, temperature: 0.0, isEnabled: true },
    { id: "m9", name: "Local TF-IDF & AST Engine v2", provider: "Local Zero-Config", category: "AST_CODE", modelId: "local-ast-tfidf-v2", maxTokens: 16384, temperature: 0.0, isEnabled: true },
  ]);

  const handleToggle = (id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isEnabled: !m.isEnabled } : m))
    );
  };

  const filtered = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.modelId.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = selectedProvider === "ALL" || m.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const enabledCount = models.filter((m) => m.isEnabled).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Models
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Active foundational models and embedding pipelines ({enabledCount}/{models.length} active).
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search models by name or identifier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white/90 border border-slate-200/80 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="px-4 py-2.5 text-xs rounded-2xl bg-white/90 border border-slate-200/80 text-slate-700 focus:outline-hidden shadow-2xs"
        >
          <option value="ALL">All Providers</option>
          <option value="OpenAI">OpenAI</option>
          <option value="Anthropic">Anthropic</option>
          <option value="Google">Google</option>
          <option value="DeepSeek">DeepSeek</option>
          <option value="HuggingFace">HuggingFace</option>
          <option value="Local Zero-Config">Local Zero-Config</option>
        </select>
      </div>

      {/* Models Table Card */}
      <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs space-y-4">
        <div className="overflow-x-auto border border-slate-200/70 rounded-2xl">
          <table className="w-full text-left text-xs text-slate-600 font-mono">
            <thead className="bg-slate-50/80 text-[11px] uppercase text-slate-400 border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-4 font-semibold">Model Name & ID</th>
                <th className="py-3 px-4 font-semibold">Provider</th>
                <th className="py-3 px-4 font-semibold">Modality Category</th>
                <th className="py-3 px-4 font-semibold">Max Tokens</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Enabled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{m.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{m.modelId}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{m.provider}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {m.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {m.maxTokens > 0 ? m.maxTokens.toLocaleString() : "Visual"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggle(m.id)}
                      aria-label="Toggle model"
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        m.isEnabled ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          m.isEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
