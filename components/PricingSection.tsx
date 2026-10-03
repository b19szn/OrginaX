"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ShieldCheck,
  Mail,
  Users,
  Building2,
  ArrowRight,
  ExternalLink,
  Copy,
  CheckCheck,
  X,
  CreditCard,
} from "lucide-react";

import CheckoutModal from "./CheckoutModal";

interface Plan {
  id: string;
  code: string;
  name: string;
  price: string;
  period: string;
  allowance: string;
  seats?: number | string;
  badge?: string;
  highlight?: boolean;
  ctaText: string;
  ctaHref?: string;
  ctaEmail?: string;
  features: string[];
}

export default function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: "free",
      code: "FREE",
      name: "Free Plan",
      price: "$0",
      period: "forever",
      allowance: "10 checks free",
      seats: 1,
      badge: "Starter",
      highlight: false,
      ctaText: "Get Started Free",
      ctaHref: "/dashboard",
      features: [
        "10 Free Checks Included",
        "Natural Text & PDF Document Extraction",
        "Basic Source Code AST Analysis",
        "Local Zero-Knowledge Privacy Engine",
        "Instant Overlap Detection",
      ],
    },
    {
      id: "pro",
      code: "PRO",
      name: "Pro Plan",
      price: "$20",
      period: "per month",
      allowance: "500 scans/mo",
      seats: 1,
      badge: "Most Popular",
      highlight: true,
      ctaText: "Upgrade to Pro",
      ctaHref: "/signup?plan=pro",
      features: [
        "$20 / Month Active Access",
        "500 Multi-Modal Scans Monthly",
        "Full Code AST Identifier Anonymizer",
        "Deep Semantic Vector Projections",
        "Synchronized Split/Unified Diff Inspector",
        "Priority AI Inference Gateway",
      ],
    },
    {
      id: "team",
      code: "TEAM",
      name: "Team Plan",
      price: "$60",
      period: "per month",
      allowance: "2,500 scans/mo · 5 Seats",
      seats: 5,
      badge: "Collaboration",
      highlight: false,
      ctaText: "Get Team Plan",
      ctaHref: "/signup?plan=team",
      features: [
        "5 Team Seats Included",
        "Cohort N x N Collusion Heatmap Matrix",
        "Cross-Assignment Batch Comparison",
        "Shared Team Folders & Assignment Pools",
        "Team Activity Logs & Exportable Audit Trail",
        "Expedited Priority Queue",
      ],
    },
    {
      id: "enterprise",
      code: "ENTERPRISE",
      name: "Enterprise Plan",
      price: "Custom",
      period: "annual / institutional",
      allowance: "Unlimited scans & custom seats",
      seats: "Unlimited",
      badge: "Institutional",
      highlight: false,
      ctaText: "Contact for Custom Plan",
      ctaEmail: "contact@originax.online",
      features: [
        "Custom Seat & Scan Volume",
        "Direct Contact: contact@originax.online",
        "LMS Integration (Canvas, Moodle, Blackboard)",
        "Dedicated On-Premise Vectorizer Appliance",
        "Zero-Knowledge FERPA/HIPAA Compliance SLA",
        "Dedicated Account Executive & 24/7 SLA",
      ],
    },
  ]);

  const [enterpriseEmail, setEnterpriseEmail] = useState("contact@originax.online");
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.pricing) {
          if (data.pricing.plans && data.pricing.plans.length > 0) {
            setPlans(data.pricing.plans);
          }
          if (data.pricing.enterpriseContactEmail) {
            setEnterpriseEmail(data.pricing.enterpriseContactEmail);
          }
        }
      })
      .catch((err) => console.error("Could not fetch latest pricing:", err));
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(enterpriseEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fafbfc] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mb-3">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transparent Academic &amp; Institutional Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-normal text-slate-900 tracking-tight">
            Flexible Subscription Plans
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal">
            Start with our 10-check free sandbox, upgrade to full multi-modal Pro, or equip your department with collaborative team seats and enterprise custom integrations.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id || plan.code}
              className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 ${
                plan.highlight
                  ? "bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-500/10 lg:-translate-y-2"
                  : "bg-white border border-slate-200/90 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Highlight ribbon / Badge */}
              {plan.badge && (
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      plan.highlight
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {plan.badge}
                  </span>
                  {plan.seats && (
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{typeof plan.seats === "number" ? `${plan.seats} Seats` : plan.seats}</span>
                    </span>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {plan.allowance}
                </p>

                {/* Price Display */}
                <div className="mt-5 mb-6 flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && plan.price !== "Custom" && (
                    <span className="ml-1.5 text-xs text-slate-500 font-normal">
                      /{plan.period.replace("per ", "")}
                    </span>
                  )}
                </div>

                {/* Features divider */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    What&apos;s Included:
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600 leading-snug">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-100">
                {plan.code === "ENTERPRISE" ? (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl font-medium text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 shadow-xs group cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-slate-300 group-hover:scale-105 transition-transform" />
                    <span>{plan.ctaText || "Contact for Custom Plan"}</span>
                  </button>
                ) : plan.price === "$0" || plan.code === "FREE" ? (
                  <Link
                    href={plan.ctaHref || "/dashboard"}
                    className="w-full py-3 px-4 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-xs bg-slate-100 hover:bg-slate-200 text-slate-800"
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setCheckoutPlan(plan);
                      setCheckoutModalOpen(true);
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer ${
                      plan.highlight
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Notice Footnote */}
        <div className="mt-12 p-6 rounded-3xl bg-white border border-slate-200/90 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900">
                Need a custom institutional deployment for your university?
              </div>
              <p className="text-xs text-slate-500">
                We provide custom on-premise vectorizers, Canvas/Moodle LTI integration, and departmental volume billing.
              </p>
            </div>
          </div>

          <a
            href={`mailto:${enterpriseEmail}?subject=OriginaX%20Enterprise%20Custom%20Plan%20Inquiry`}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all inline-flex items-center space-x-2"
          >
            <Mail className="w-3.5 h-3.5 text-slate-300" />
            <span>Email: {enterpriseEmail}</span>
          </a>
        </div>
      </div>

      {/* Enterprise Contact Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-7 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Contact for Enterprise Custom Plan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct access to our institutional solutions engineering team
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                For custom departmental seats, campus-wide LMS integration (Canvas, Moodle, Blackboard), or on-premise dedicated vectorizer appliances, please reach out to our institutional team at:
              </p>

              {/* Email Copier Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 truncate">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {enterpriseEmail}
                  </span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-medium text-slate-700 flex items-center space-x-1.5 transition-all shadow-2xs"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Custom seat allowance</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>FERPA/HIPAA Zero-Knowledge SLA</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dedicated On-Premise Gateway</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Guaranteed 24/7 SLA Response</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Close
              </button>
              <a
                href={`mailto:${enterpriseEmail}?subject=OriginaX%20Enterprise%20Custom%20Plan%20Inquiry`}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl shadow-xs transition-all flex items-center space-x-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open in Email App</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && checkoutPlan && (
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          initialPlan={{
            code: checkoutPlan.code,
            name: checkoutPlan.name,
            price: checkoutPlan.price,
            period: checkoutPlan.period,
          }}
        />
      )}
    </section>
  );
}
