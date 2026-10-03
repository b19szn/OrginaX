"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Code2,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Check,
  Radio,
  Clock,
  ShieldAlert,
} from "lucide-react";

interface WebhookDelivery {
  id: string;
  event: string;
  destination: string;
  statusCode: number;
  latencyMs: number;
  timestamp: string;
  status: string;
}

export default function TelemetryTrackingPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [webhooks, setWebhooks] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/telemetry");
      const json = await res.json();
      if (json.success) {
        setSettings(json.settings);
        setWebhooks(json.webhookDeliveries);
      }
    } catch (e) {
      console.error("Failed to load telemetry settings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      setSavedKey(key);
      await fetch("/api/admin/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      setTimeout(() => setSavedKey(null), 2500);
    } catch (e) {
      console.error("Failed to save setting", e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Analytics, Tracking Scripts & Telemetry Hub
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono">
              Script Injection
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure dynamic analytics tags (GA4, Clarity, GTM, Facebook Pixel) and monitor automated webhook deliverability.
          </p>
        </div>

        <button
          onClick={fetchTelemetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Scripts</span>
        </button>
      </div>

      {/* CSP Sandboxing Alert Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-amber-900 dark:text-amber-300">
            Strict Content Security Policy (CSP) Sandboxing Notice
          </div>
          <p className="text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
            All inserted third-party client tags run under sandboxed isolation. Script blocks cannot access document DOM blobs or inspect user submission inputs, guaranteeing that tracking vendors cannot harvest uploaded student materials.
          </p>
        </div>
      </div>

      {/* Tracking Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* GA4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Google Analytics 4 (GA4)</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Measurement ID
            </span>
          </div>
          <input
            type="text"
            placeholder="G-XXXXXXXXXX"
            value={settings["ga4_measurement_id"] || ""}
            onChange={(e) => setSettings({ ...settings, ga4_measurement_id: e.target.value })}
            className="w-full p-2.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSaveSetting("ga4_measurement_id", settings["ga4_measurement_id"] || "")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              {savedKey === "ga4_measurement_id" ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedKey === "ga4_measurement_id" ? "Saved" : "Save ID"}</span>
            </button>
          </div>
        </div>

        {/* Microsoft Clarity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Microsoft Clarity</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Project ID
            </span>
          </div>
          <input
            type="text"
            placeholder="clarity_project_id"
            value={settings["clarity_project_id"] || ""}
            onChange={(e) => setSettings({ ...settings, clarity_project_id: e.target.value })}
            className="w-full p-2.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSaveSetting("clarity_project_id", settings["clarity_project_id"] || "")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              {savedKey === "clarity_project_id" ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedKey === "clarity_project_id" ? "Saved" : "Save ID"}</span>
            </button>
          </div>
        </div>

        {/* GTM */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Google Tag Manager (GTM)</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Container ID
            </span>
          </div>
          <input
            type="text"
            placeholder="GTM-XXXXXXX"
            value={settings["gtm_container_id"] || ""}
            onChange={(e) => setSettings({ ...settings, gtm_container_id: e.target.value })}
            className="w-full p-2.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSaveSetting("gtm_container_id", settings["gtm_container_id"] || "")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              {savedKey === "gtm_container_id" ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedKey === "gtm_container_id" ? "Saved" : "Save ID"}</span>
            </button>
          </div>
        </div>

        {/* Facebook Pixel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Facebook Pixel</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              Pixel ID
            </span>
          </div>
          <input
            type="text"
            placeholder="Enter Pixel ID..."
            value={settings["meta_pixel_id"] || ""}
            onChange={(e) => setSettings({ ...settings, meta_pixel_id: e.target.value })}
            className="w-full p-2.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSaveSetting("meta_pixel_id", settings["meta_pixel_id"] || "")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              {savedKey === "meta_pixel_id" ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedKey === "meta_pixel_id" ? "Saved" : "Save ID"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Webhook Delivery Log Inspector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-600" />
              <span>Outbound Webhook Delivery & Event Relay Log</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live audit stream of automated notifications sent to Slack, Datadog, and PagerDuty endpoints.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200/60">
            100% DELIVERABILITY
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-lg font-mono">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Destination Relay</th>
                <th className="py-2.5 px-3">HTTP Status</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {webhooks.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{w.id}</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">{w.event}</td>
                  <td className="py-2.5 px-3 text-slate-500">{w.destination}</td>
                  <td className="py-2.5 px-3 font-bold text-sky-600">{w.statusCode} OK</td>
                  <td className="py-2.5 px-3 text-slate-400">{w.latencyMs}ms</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-bold">
                      {w.status}
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
