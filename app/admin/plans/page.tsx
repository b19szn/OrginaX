"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Mail,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  Building2,
} from "lucide-react";

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

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [enterpriseContactEmail, setEnterpriseContactEmail] = useState("contact@originax.online");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pricing");
      const data = await res.json();
      if (data.success && data.pricing) {
        setPlans(data.pricing.plans || []);
        if (data.pricing.enterpriseContactEmail) {
          setEnterpriseContactEmail(data.pricing.enterpriseContactEmail);
        }
      }
    } catch (e: any) {
      setErrorMessage("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleUpdatePlan = (index: number, field: keyof Plan, value: any) => {
    setPlans((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddFeature = (planIndex: number) => {
    setPlans((prev) => {
      const copy = [...prev];
      copy[planIndex] = {
        ...copy[planIndex],
        features: [...copy[planIndex].features, "New feature inclusion"],
      };
      return copy;
    });
  };

  const handleUpdateFeature = (planIndex: number, featureIndex: number, text: string) => {
    setPlans((prev) => {
      const copy = [...prev];
      const newFeatures = [...copy[planIndex].features];
      newFeatures[featureIndex] = text;
      copy[planIndex] = { ...copy[planIndex], features: newFeatures };
      return copy;
    });
  };

  const handleRemoveFeature = (planIndex: number, featureIndex: number) => {
    setPlans((prev) => {
      const copy = [...prev];
      copy[planIndex] = {
        ...copy[planIndex],
        features: copy[planIndex].features.filter((_, i) => i !== featureIndex),
      };
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_ALL_PLANS",
          enterpriseContactEmail,
          pricingData: { plans },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setErrorMessage(data.error || "Failed to save plans");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center space-x-3 text-slate-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading subscription plans &amp; pricing configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Monetization &amp; Subscription Control</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Subscription Plans Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure pricing tiers, free scan quotas, team seat allowances, and enterprise custom inquiry routing. Changes reflect immediately on the frontend public page.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/#pricing"
            target="_blank"
            className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center space-x-1.5"
          >
            <span>View Live on Frontend</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center space-x-2 disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Publishing..." : "Save & Publish Changes"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center space-x-3 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Subscription plans, quotas, and enterprise routing updated and published live to frontend!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center space-x-3 text-rose-800 dark:text-rose-200 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Enterprise Contact Routing Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Enterprise Inquiry Routing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inquiries for custom high-volume quotas, on-premise appliances, or campus licenses route directly to this address.
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Enterprise Inquiries Contact Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={enterpriseContactEmail}
              onChange={(e) => setEnterpriseContactEmail(e.target.value)}
              placeholder="contact@originax.online"
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, planIdx) => (
          <div
            key={plan.id || plan.code || planIdx}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
              plan.highlight
                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 shadow-sm ring-1 ring-emerald-500/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
            }`}
          >
            <div className="space-y-4">
              {/* Badge & Highlight Toggle */}
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={plan.badge || ""}
                  onChange={(e) => handleUpdatePlan(planIdx, "badge", e.target.value)}
                  placeholder="Badge (e.g. Most Popular)"
                  className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 max-w-[130px]"
                />

                <label className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.highlight || false}
                    onChange={(e) => handleUpdatePlan(planIdx, "highlight", e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Featured</span>
                </label>
              </div>

              {/* Plan Name */}
              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => handleUpdatePlan(planIdx, "name", e.target.value)}
                  className="w-full text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 pb-1"
                />
              </div>

              {/* Price & Period */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Price
                  </label>
                  <input
                    type="text"
                    value={plan.price}
                    onChange={(e) => handleUpdatePlan(planIdx, "price", e.target.value)}
                    placeholder="$20 or Custom"
                    className="w-full text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Billing Period
                  </label>
                  <input
                    type="text"
                    value={plan.period}
                    onChange={(e) => handleUpdatePlan(planIdx, "period", e.target.value)}
                    placeholder="per month"
                    className="w-full text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Allowance / Checks / Seats */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Quota / Allowance Summary
                  </label>
                  <input
                    type="text"
                    value={plan.allowance}
                    onChange={(e) => handleUpdatePlan(planIdx, "allowance", e.target.value)}
                    placeholder="e.g. 10 checks free"
                    className="w-full text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {plan.seats !== undefined && (
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Seats Included
                    </label>
                    <input
                      type="text"
                      value={plan.seats}
                      onChange={(e) => handleUpdatePlan(planIdx, "seats", e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    Feature Inclusions
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddFeature(planIdx)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleUpdateFeature(planIdx, fIdx, e.target.value)}
                        className="w-full text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(planIdx, fIdx)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button Label */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={plan.ctaText}
                onChange={(e) => handleUpdatePlan(planIdx, "ctaText", e.target.value)}
                placeholder="Get Started"
                className="w-full text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
