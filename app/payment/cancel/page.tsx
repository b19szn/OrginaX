"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft, ShieldAlert } from "lucide-react";

function CancelContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  const gateway = searchParams.get("gateway") || "Gateway";

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-xs">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Checkout Incomplete
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your transaction with {gateway} was cancelled or interrupted. No funds have been deducted from your account.
          </p>
          {invoiceId && (
            <span className="inline-block mt-2 font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
              Reference: {invoiceId}
            </span>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-600 space-y-2">
          <div className="font-semibold text-slate-700">Need help completing checkout?</div>
          <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px]">
            <li>Try another payment method (e.g. Stripe card, Lemon Squeezy, or SSLCommerz).</li>
            <li>Use the Developer Sandbox option to verify platform features.</li>
            <li>Contact support at contact@originax.online for institutional POs.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/#pricing"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-xs shadow-emerald-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Select Another Plan</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <CancelContent />
    </Suspense>
  );
}
