"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Layers,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  Printer,
  RefreshCw,
  Sliders,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import CheckoutModal from "./CheckoutModal";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BillingModal({ isOpen, onClose }: BillingModalProps) {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<any>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const fetchBillingHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payment/history");
      const data = await res.json();
      if (data.success) {
        setBillingData(data);
      }
    } catch (err) {
      console.error("Failed to load billing profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBillingHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTier = billingData?.currentTier || {
    name: "Free Plan",
    code: "FREE",
    priceMonthlyCents: 0,
    monthlyScanAllowance: 10,
  };

  const usage = billingData?.usage || {
    scansUsed: 0,
    scansAllowance: 10,
    periodEnds: new Date().toISOString(),
  };

  const transactions = billingData?.transactions || [];
  const percentUsed = Math.min(100, Math.round((usage.scansUsed / Math.max(1, usage.scansAllowance)) * 100));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Subscription &amp; Billing History
                </h3>
                <p className="text-xs text-slate-300">
                  Manage scan quotas, view payment ledger invoices, and upgrade tiers.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
            {/* Active Plan Card */}
            <div className="p-5 rounded-2xl bg-linear-to-br from-emerald-50/60 to-slate-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Active Plan
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs">
                    {currentTier.code}
                  </span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1">
                  {currentTier.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Monthly Allowance: {currentTier.monthlyScanAllowance?.toLocaleString()} multi-modal checks
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center space-x-1.5 shadow-xs shadow-emerald-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade Plan</span>
                </button>
              </div>
            </div>

            {/* Scan Quota Progress */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Current Billing Cycle Usage</span>
                </span>
                <span className="font-mono text-slate-600">
                  {usage.scansUsed} / {usage.scansAllowance} scans ({percentUsed}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Cycles reset on {new Date(usage.periodEnds).toLocaleDateString()}</span>
                <span>Zero-Knowledge isolation enforced</span>
              </div>
            </div>

            {/* Invoices Ledger Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                  <span>Invoice &amp; Receipts Ledger</span>
                </h5>
                <button
                  onClick={fetchBillingHistory}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  <span>Sync</span>
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  No previous transaction records found. Upgrade to generate your first invoice receipt.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Invoice</th>
                        <th className="py-2.5 px-3">Gateway</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{t.invoiceId}</td>
                          <td className="py-2.5 px-3 text-slate-600">{t.gateway}</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">
                            ${(t.amountCents / 100).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              {t.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Link
                              href={`/payment/success?invoiceId=${encodeURIComponent(t.invoiceId)}&gateway=${encodeURIComponent(t.gateway)}`}
                              className="text-emerald-600 hover:text-emerald-700 hover:underline text-[11px] font-sans inline-flex items-center gap-1 font-medium"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {checkoutModalOpen && (
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => {
            setCheckoutModalOpen(false);
            fetchBillingHistory();
          }}
          initialPlan={{
            code: "PRO",
            name: "Pro Plan",
            price: "$20",
          }}
        />
      )}
    </>
  );
}
