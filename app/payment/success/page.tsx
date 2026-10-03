"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Download,
  Printer,
  ArrowRight,
  Sparkles,
  Zap,
  Check,
  CreditCard,
  Building2,
  Lock,
  Layers,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const invoiceId = searchParams.get("invoiceId") || "INV-2026-CONFIRMED";
  const gateway = searchParams.get("gateway") || "STRIPE";
  const sessionId = searchParams.get("session_id");
  const valId = searchParams.get("val_id");

  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Call verification endpoint to ensure database ledger and user tier are updated
    const verify = async () => {
      try {
        const query = new URLSearchParams({
          invoiceId,
          gateway,
          ...(sessionId ? { session_id: sessionId } : {}),
          ...(valId ? { val_id: valId } : {}),
        });

        const res = await fetch(`/api/payment/verify?${query.toString()}`);
        const data = await res.json();
        if (data.success) {
          setPaymentDetails(data);
        }
      } catch (err) {
        console.error("Verification callback failed:", err);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [invoiceId, gateway, sessionId, valId]);

  const handlePrint = () => {
    window.print();
  };

  const amountDollars = paymentDetails?.amountCents
    ? (paymentDetails.amountCents / 100).toFixed(2)
    : "20.00";

  return (
    <div className="min-h-screen bg-[#fafbfc] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      {/* Printable Receipt Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-2xl shadow-slate-200/40 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Top Verified Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 mb-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Payment Authorized &amp; Active</span>
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Subscription Activated
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-mono">Invoice Reference</span>
            <span className="text-sm font-mono font-bold text-slate-800">{invoiceId}</span>
          </div>
        </div>

        {/* Receipt Line Items & Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/60 font-semibold text-slate-500 uppercase tracking-wider">
            <span>Description</span>
            <span>Amount</span>
          </div>

          <div className="flex justify-between items-start text-xs sm:text-sm">
            <div>
              <strong className="text-slate-900 font-semibold">
                OriginaX {paymentDetails?.planCode || "PRO"} Plan License
              </strong>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly Multi-Modal Scanning Allowance &amp; AST Vectorizer Engine
              </p>
            </div>
            <span className="font-mono font-bold text-slate-900">${amountDollars} USD</span>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex justify-between items-baseline">
            <div>
              <div className="text-xs font-semibold text-slate-700">Total Paid (Zero Tax SLA)</div>
              <span className="text-[11px] text-slate-400 font-mono">
                Processed via {gateway} · Ref: {invoiceId}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              ${amountDollars} USD
            </div>
          </div>
        </div>

        {/* Activated Benefits Checklist */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Unlocked Enterprise Benefits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>500+ Multi-Modal Scan Quota</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full Code AST Structural Tokenizer</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Synchronized Split/Unified Diff Viewer</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Priority AI Inference Acceleration</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition flex items-center justify-center space-x-2 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Official Receipt</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition flex items-center justify-center space-x-2 shadow-xs"
            >
              <span>Detection Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/instructor"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition flex items-center justify-center space-x-2 shadow-xs shadow-emerald-600/20"
            >
              <span>Instructor Suite</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Confirming Payment...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
