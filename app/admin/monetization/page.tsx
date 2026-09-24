"use client";

import React, { useState, useEffect } from "react";
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
      await fetch("/api/admin/monetization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_GATEWAY", gatewayId: gw.id, isEnabled: next }),
      });
    } catch (e) {
      console.error("Toggle gateway failed", e);
    }
  };

  const handleToggleLiveMode = async (gw: Gateway) => {
    try {
      const next = !gw.isLiveMode;
      setGateways((prev) => prev.map((g) => (g.id === gw.id ? { ...g, isLiveMode: next } : g)));
      await fetch("/api/admin/monetization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_GATEWAY", gatewayId: gw.id, isLiveMode: next }),
      });
    } catch (e) {
      console.error("Toggle live mode failed", e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Monetization & Payment Gateway Integration
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-mono">
              Multi-Gateway
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure global merchant gateways, calibrate subscription tiers and scan allowances, and monitor high-level transaction ledgers.
          </p>
        </div>

        <button
          onClick={fetchMonetization}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Gateways</span>
        </button>
      </div>

      {/* Gateway Connectors Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Merchant Connectors & Credentials</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Toggle sandbox vs. live production environments and inspect webhook secret associations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gateways.map((gw) => (
            <div
              key={gw.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-2xs space-y-4 ${
                gw.isEnabled ? "border-purple-300 dark:border-purple-800" : "border-slate-200 dark:border-slate-800 opacity-90"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{gw.name}</h3>
                  <span className="font-mono text-[10px] text-slate-400">Gateway: {gw.gateway}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleGateway(gw)}
                    aria-label="Toggle enable gateway"
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      gw.isEnabled ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        gw.isEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Live / Sandbox Mode Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Environment</span>
                <button
                  onClick={() => handleToggleLiveMode(gw)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                    gw.isLiveMode
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {gw.isLiveMode ? "LIVE PRODUCTION" : "SANDBOX TEST"}
                </button>
              </div>

              {/* Masked Credentials */}
              <div className="space-y-1.5 text-[11px] font-mono text-slate-500">
                <div className="flex justify-between truncate">
                  <span>Publishable:</span>
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{gw.publicKey || "Not Set"}</span>
                </div>
                <div className="flex justify-between truncate">
                  <span>Secret Key:</span>
                  <span className="text-slate-700 dark:text-slate-300">{gw.secretKeyMasked || "••••••••"}</span>
                </div>
                <div className="flex justify-between truncate">
                  <span>Webhook Secret:</span>
                  <span className="text-slate-700 dark:text-slate-300">{gw.webhookSecretMasked || "••••••••"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Tier Builder */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Subscription Tier Matrix & Quotas</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Calibrate pricing, monthly scan allowances, and per-minute rate limits for each customer tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{tier.name}</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                  ${(tier.priceMonthlyCents / 100).toFixed(0)}/mo
                </span>
              </div>

              <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Scan Allowance:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">{tier.monthlyScanAllowance.toLocaleString()} / mo</strong>
                </div>
                <div className="flex justify-between">
                  <span>Rate Limit:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">{tier.rateLimitPerMinute} req/min</strong>
                </div>
              </div>

              <button
                onClick={() => alert(`Saved quota updates for ${tier.name}`)}
                className="w-full py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Calibrate Quota
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>High-Level Transaction Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit logs of incoming recurring charges and manual invoices. Zero-knowledge customer email masking.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Invoice ID</th>
                <th className="py-2.5 px-3">Masked User</th>
                <th className="py-2.5 px-3">Gateway</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{t.invoiceId}</td>
                  <td className="py-2.5 px-3 text-slate-500">{t.userEmailMasked || "u***@domain"}</td>
                  <td className="py-2.5 px-3">{t.gateway}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                    ${(t.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => alert(`Issued receipt download for ${t.invoiceId}`)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Receipt
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
