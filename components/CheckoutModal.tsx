"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { PaymentGatewayType, BillingPeriod } from "@/lib/payment/types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: {
    code: string;
    name: string;
    price: string;
    period?: string;
  };
}

export default function CheckoutModal({ isOpen, onClose, initialPlan }: CheckoutModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  const planCode = initialPlan?.code || "PRO";
  const planName = initialPlan?.name || "Pro Plan";

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>("STRIPE");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate pricing
  const baseMonthlyPrice = planCode === "TEAM" ? 60 : planCode === "ENTERPRISE" ? 199 : 20;
  const totalPrice = billingPeriod === "yearly"
    ? Math.round(baseMonthlyPrice * 12 * 0.8)
    : baseMonthlyPrice;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const emailToUse = customerEmail.trim() || user?.email || "customer@campus.edu";
      const nameToUse = customerName.trim() || user?.name || "OriginaX Customer";

      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          billingPeriod,
          gatewayChoice: selectedGateway,
          userId: user?.id,
          userEmail: emailToUse,
          userName: nameToUse,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to initialize payment session.");
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe, Lemon Squeezy, SSLCommerz, or Sandbox Simulator
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No payment checkout URL returned from processor.");
      }
    } catch (err: any) {
      console.error("Checkout initiation failed:", err);
      setErrorMessage(err.message || "Checkout could not be started. Please try another gateway.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-linear-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Upgrade to {planName}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  Instant Access
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Multi-Modal Plagiarism Detection Platform Subscription
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleCheckout} className="p-6 space-y-6 text-xs text-slate-700">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Billing Frequency Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Billing Frequency
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBillingPeriod("monthly")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  billingPeriod === "monthly"
                    ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 text-slate-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Monthly Billing</span>
                  {billingPeriod === "monthly" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2 text-sm font-extrabold text-slate-900">
                  ${baseMonthlyPrice} <span className="text-[11px] font-normal text-slate-500">/ month</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBillingPeriod("yearly")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                  billingPeriod === "yearly"
                    ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 text-slate-900"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                <span className="absolute top-2 right-2 text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded-full shadow-2xs">
                  Save 20%
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Annual Billing</span>
                  {billingPeriod === "yearly" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2 text-sm font-extrabold text-slate-900">
                  ${totalPrice} <span className="text-[11px] font-normal text-slate-500">/ year</span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Customer Email & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="investigator@campus.edu"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Dr. Alex Rivera"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* 3. Payment Gateway Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Payment Method &amp; Gateway
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Stripe */}
              <button
                type="button"
                onClick={() => setSelectedGateway("STRIPE")}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  selectedGateway === "STRIPE"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900">Stripe Billing</div>
                    <div className="text-[10px] text-slate-500">Cards, Apple Pay, GPay</div>
                  </div>
                </div>
                {selectedGateway === "STRIPE" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>

              {/* Lemon Squeezy */}
              <button
                type="button"
                onClick={() => setSelectedGateway("LEMON_SQUEEZY")}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  selectedGateway === "LEMON_SQUEEZY"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold text-xs">
                    🍋
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900">Lemon Squeezy</div>
                    <div className="text-[10px] text-slate-500">Merchant of Record</div>
                  </div>
                </div>
                {selectedGateway === "LEMON_SQUEEZY" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>

              {/* SSLCommerz */}
              <button
                type="button"
                onClick={() => setSelectedGateway("SSLCOMMERZ")}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  selectedGateway === "SSLCOMMERZ"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 font-bold text-xs">
                    🌐
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900">SSLCommerz</div>
                    <div className="text-[10px] text-slate-500">Regional &amp; Wallets</div>
                  </div>
                </div>
                {selectedGateway === "SSLCOMMERZ" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>

              {/* Sandbox Test Simulator */}
              <button
                type="button"
                onClick={() => setSelectedGateway("SANDBOX")}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                  selectedGateway === "SANDBOX"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                    🧪
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900">Developer Sandbox</div>
                    <div className="text-[10px] text-slate-500">Instant test simulation</div>
                  </div>
                </div>
                {selectedGateway === "SANDBOX" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            </div>
          </div>

          {/* 4. Order Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>{planName} ({billingPeriod === "yearly" ? "Annual" : "Monthly"})</span>
              <span className="font-mono">${totalPrice}.00</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Tax / VAT (Academic Zero-Rating)</span>
              <span className="font-mono">$0.00</span>
            </div>
            <div className="pt-2 border-t border-slate-200/80 flex justify-between items-baseline font-bold text-slate-900">
              <span className="text-xs">Due Today</span>
              <span className="text-base font-extrabold text-emerald-600 font-mono">
                ${totalPrice}.00 USD
              </span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              256-Bit Encrypted
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Zero-Knowledge Vault
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Instant Plan Activation
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center space-x-2 shadow-md shadow-emerald-600/20 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Gateway...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment (${totalPrice}.00)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
