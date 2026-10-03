"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const invoiceId = searchParams.get("invoiceId") || "INV-SIM-8910";
  const userEmail = searchParams.get("email") || "investigator@campus.edu";
  const planCode = searchParams.get("plan") || "PRO";
  const planName = searchParams.get("name") || "Pro Plan";
  const amountCents = parseInt(searchParams.get("amount") || "2000", 10);
  const gateway = searchParams.get("gateway") || "STRIPE";
  const returnUrl = searchParams.get("returnUrl") || "/payment/success";

  const amountDollars = (amountCents / 100).toFixed(2);

  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("392");
  const [cardHolder, setCardHolder] = useState("Dr. Alex Rivera");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFillPreset = (type: "VISA" | "MC" | "FAIL") => {
    if (type === "VISA") {
      setCardNumber("4242 4242 4242 4242");
      setCardExpiry("12/28");
      setCardCvc("424");
      setErrorMessage(null);
    } else if (type === "MC") {
      setCardNumber("5555 5555 5555 4444");
      setCardExpiry("10/29");
      setCardCvc("888");
      setErrorMessage(null);
    } else {
      setCardNumber("4000 0000 0000 0002");
      setCardExpiry("01/25");
      setCardCvc("999");
      setErrorMessage("Test card configured to test declined charge scenario.");
    }
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      setProcessingStep("Contacting payment gateway sandbox...");
      await new Promise((r) => setTimeout(r, 600));

      if (cardNumber.includes("0002")) {
        throw new Error("Your card was declined. (Simulated card error: Insufficient funds or expired card).");
      }

      setProcessingStep("Authorizing transaction and verifying 3D Secure...");
      await new Promise((r) => setTimeout(r, 700));

      setProcessingStep("Upgrading account tier and writing to transaction ledger...");
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          gateway,
          externalTransactionId: `SIM_${Date.now()}`,
          planCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Payment verification failed.");
      }

      setProcessingStep("Payment confirmed! Redirecting to confirmation...");
      await new Promise((r) => setTimeout(r, 500));

      router.push(`${returnUrl}?invoiceId=${encodeURIComponent(invoiceId)}&gateway=${encodeURIComponent(gateway)}&simulated=true`);
    } catch (err: any) {
      console.error("Simulation error:", err);
      setErrorMessage(err.message || "Payment simulation failed.");
      setIsProcessing(false);
      setProcessingStep(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Identity */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Developer Sandbox &amp; Test Checkout Simulator</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          OriginaX Payment Gateway Terminal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Zero-risk developer test environment simulating live gateway webhooks and automated tier upgrades.
        </p>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl p-7 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
        {/* Order Details Header */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Invoice Reference
            </span>
            <span className="text-sm font-mono font-bold text-slate-800">{invoiceId}</span>
            <div className="text-xs text-slate-500 mt-0.5">
              {planName} · Gateway: <strong className="text-slate-700">{gateway}</strong>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Total Amount</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              ${amountDollars}
            </span>
          </div>
        </div>

        {/* Quick-Fill Presets for Testing */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Quick-Fill Test Credentials
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFillPreset("VISA")}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-medium transition text-center"
            >
              Visa (Success)
            </button>
            <button
              type="button"
              onClick={() => handleFillPreset("MC")}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-medium transition text-center"
            >
              Mastercard (Success)
            </button>
            <button
              type="button"
              onClick={() => handleFillPreset("FAIL")}
              className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-slate-700 font-medium transition text-center"
            >
              Simulate Decline
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Card Form */}
        <form onSubmit={handleSimulatePayment} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Card Number
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiration (MM/YY)
              </label>
              <input
                type="text"
                required
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CVC / CVV
              </label>
              <input
                type="password"
                required
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              End-to-end Encrypted Sandbox
            </span>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center space-x-2 shadow-md shadow-emerald-600/20 disabled:opacity-60 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Authorize &amp; Pay ${amountDollars}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {isProcessing && processingStep && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
            <span className="font-medium">{processingStep}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Checkout Terminal...</div>}>
      <SimulatorContent />
    </Suspense>
  );
}
