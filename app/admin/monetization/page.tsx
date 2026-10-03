"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  Lock,
  RefreshCw,
  Sliders,
  ArrowRight,
  TrendingUp,
  Key,
  ShieldCheck,
  AlertCircle,
  X,
  Save,
  Loader2,
  Check,
  ExternalLink,
} from "lucide-react";

interface Gateway {
  id: string;
  gateway: string;
  name: string;
  publicKey: string | null;
  secretKeyMasked: string | null;
  webhookSecretMasked: string | null;
  isLiveMode: boolean;
  isEnabled: boolean;
}

interface Tier {
  id: string;
  code: string;
  name: string;
  priceMonthlyCents: number;
  monthlyScanAllowance: number;
  rateLimitPerMinute: number;
  isActive: boolean;
}

interface Transaction {
  id: string;
  invoiceId: string;
  userId: string;
  userEmailMasked: string | null;
  gateway: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function MonetizationPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Edit Gateway Modal State
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
  const [inputPublicKey, setInputPublicKey] = useState("");
  const [inputSecretKey, setInputSecretKey] = useState("");
  const [inputWebhookSecret, setInputWebhookSecret] = useState("");
  const [savingGateway, setSavingGateway] = useState(false);

  const fetchMonetization = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/monetization");
      const json = await res.json();
      if (json.success) {
        setGateways(json.gateways);
        setTiers(json.tiers);
        setTransactions(json.transactions);
      }
    } catch (e) {
      console.error("Failed to load monetization data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonetization();
  }, []);

  const handleToggleGateway = async (gw: Gateway) => {
    try {
      const next = !gw.isEnabled;
      setGateways((prev) => prev.map((g) => (g.id === gw.id ? { ...g, isEnabled: next } : g)));
      const res = await fetch("/api/admin/monetization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_GATEWAY", gatewayId: gw.id, isEnabled: next }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`${gw.name} is now ${next ? "ENABLED" : "DISABLED"}`);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error("Toggle gateway failed", e);
    }
  };

  const handleToggleLiveMode = async (gw: Gateway) => {
    try {
      const next = !gw.isLiveMode;
      setGateways((prev) => prev.map((g) => (g.id === gw.id ? { ...g, isLiveMode: next } : g)));
      const res = await fetch("/api/admin/monetization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_GATEWAY", gatewayId: gw.id, isLiveMode: next }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`${gw.name} set to ${next ? "LIVE PRODUCTION" : "SANDBOX TEST"}`);
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error("Toggle live mode failed", e);
    }
  };

  const openConfigModal = (gw: Gateway) => {
    setEditingGateway(gw);
    setInputPublicKey(gw.publicKey || "");
    setInputSecretKey("");
    setInputWebhookSecret("");
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGateway) return;

    try {
      setSavingGateway(true);
      const res = await fetch("/api/admin/monetization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_GATEWAY",
          gatewayId: editingGateway.id,
          publicKey: inputPublicKey,
          secretKey: inputSecretKey || undefined,
          webhookSecret: inputWebhookSecret || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingGateway(null);
        setStatusMessage(`Credentials updated for ${editingGateway.name}`);
        setTimeout(() => setStatusMessage(null), 3500);
        await fetchMonetization();
      }
    } catch (e) {
      console.error("Save credentials failed", e);
    } finally {
      setSavingGateway(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Payment Gateway Configuration
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono font-medium">
              Live &amp; Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure merchant gateway API keys, toggle live vs sandbox environments, manage webhook secrets, and audit transaction ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/plans"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Subscription Plans Matrix →</span>
          </Link>

          <button
            onClick={fetchMonetization}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Status</span>
          </button>
        </div>
      </div>

      {/* Global Status Toast Notification */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Gateway Connectors Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Merchant Connectors &amp; API Credentials</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active merchant processors handle customer subscriptions and token overage charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gateways.map((gw) => (
            <div
              key={gw.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-2xs space-y-4 ${
                gw.isEnabled
                  ? "border-emerald-300 dark:border-emerald-700/80 ring-1 ring-emerald-500/10"
                  : "border-slate-200 dark:border-slate-800 opacity-85"
              }`}
            >
              {/* Card Header & Master Toggle */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{gw.name}</h3>
                    {gw.isEnabled && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    Identifier: {gw.gateway}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleGateway(gw)}
                    aria-label={`Toggle ${gw.name}`}
                    title={gw.isEnabled ? "Click to disable gateway" : "Click to enable gateway"}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      gw.isEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        gw.isEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Live / Sandbox Mode Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Environment</span>
                <button
                  onClick={() => handleToggleLiveMode(gw)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition shadow-2xs ${
                    gw.isLiveMode
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {gw.isLiveMode ? "LIVE PRODUCTION" : "SANDBOX TEST"}
                </button>
              </div>

              {/* Masked Credentials Block */}
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <div className="flex justify-between items-center truncate">
                  <span className="text-slate-400 dark:text-slate-500 font-sans text-[10px]">Public Key:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px] font-mono">
                    {gw.publicKey || "Not Configured"}
                  </span>
                </div>
                <div className="flex justify-between items-center truncate">
                  <span className="text-slate-400 dark:text-slate-500 font-sans text-[10px]">Secret Key:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">
                    {gw.secretKeyMasked || "••••••••"}
                  </span>
                </div>
                <div className="flex justify-between items-center truncate">
                  <span className="text-slate-400 dark:text-slate-500 font-sans text-[10px]">Webhook Secret:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono">
                    {gw.webhookSecretMasked || "••••••••"}
                  </span>
                </div>
              </div>

              {/* Action Button: Open Configuration Modal */}
              <button
                type="button"
                onClick={() => openConfigModal(gw)}
                className="w-full py-2 px-3 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Key className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                <span>Configure API Keys</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Credentials Modal */}
      {editingGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Configure {editingGateway.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    Gateway: {editingGateway.gateway}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingGateway(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Public / Client Key
                </label>
                <input
                  type="text"
                  value={inputPublicKey}
                  onChange={(e) => setInputPublicKey(e.target.value)}
                  placeholder="e.g. pk_live_... or pk_test_..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Secret / Restricted API Key
                </label>
                <input
                  type="password"
                  value={inputSecretKey}
                  onChange={(e) => setInputSecretKey(e.target.value)}
                  placeholder="Enter new secret key to replace existing"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 transition"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Leave blank to retain current encrypted key ({editingGateway.secretKeyMasked || "None"})
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Webhook Signing Secret
                </label>
                <input
                  type="password"
                  value={inputWebhookSecret}
                  onChange={(e) => setInputWebhookSecret(e.target.value)}
                  placeholder="e.g. whsec_..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500 transition"
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                  Used to verify asynchronous webhook payment events from {editingGateway.name}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGateway(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGateway}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-60"
                >
                  {savingGateway ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Tier Overview Matrix */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Subscription Tier Quota Calibration</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live scan allowances and rate limits applied per billing cycle across customer accounts.
            </p>
          </div>

          <Link
            href="/admin/plans"
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Edit Full Pricing Plans</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{tier.name}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  ${(tier.priceMonthlyCents / 100).toFixed(0)}/mo
                </span>
              </div>

              <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Monthly Allowance:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">
                    {tier.monthlyScanAllowance.toLocaleString()} scans
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Rate Limit:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">
                    {tier.rateLimitPerMinute} req/min
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {tier.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>High-Level Transaction Audit Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit logs of incoming recurring charges and manual invoices. Zero-knowledge customer email masking enforced.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3.5">Invoice ID</th>
                <th className="py-2.5 px-3.5">Masked User</th>
                <th className="py-2.5 px-3.5">Gateway</th>
                <th className="py-2.5 px-3.5">Amount</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Date</th>
                <th className="py-2.5 px-3.5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-white">{t.invoiceId}</td>
                  <td className="py-2.5 px-3.5 text-slate-500">{t.userEmailMasked || "u***@domain"}</td>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-700 dark:text-slate-300">{t.gateway}</td>
                  <td className="py-2.5 px-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    ${(t.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Verified
                    </span>
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
