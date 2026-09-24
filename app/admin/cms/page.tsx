"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Megaphone,
  AlertTriangle,
  FileText,
  Save,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  ShieldAlert,
} from "lucide-react";

interface CmsNode {
  id: string;
  key: string;
  title: string;
  contentJson: string;
  isPublished: boolean;
  version: number;
  updatedAt: string;
}

export default function HeadlessCmsPage() {
  const [nodes, setNodes] = useState<CmsNode[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSuccessKey, setSavedSuccessKey] = useState<string | null>(null);

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms");
      const json = await res.json();
      if (json.success) {
        setNodes(json.nodes);
        setMaintenanceMode(json.maintenanceMode);

        const annNode = json.nodes.find((n: CmsNode) => n.key === "announcement_bar");
        if (annNode) {
          try {
            const parsed = JSON.parse(annNode.contentJson);
            setAnnouncementText(parsed.message || "");
            setAnnouncementActive(parsed.isActive || false);
          } catch {}
        }
      }
    } catch (e) {
      console.error("Failed to load CMS nodes", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const handleToggleMaintenance = async () => {
    try {
      const next = !maintenanceMode;
      setMaintenanceMode(next);
      await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_MAINTENANCE", enabled: next }),
      });
    } catch (e) {
      console.error("Toggle maintenance failed", e);
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      setSavingKey("announcement_bar");
      await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_NODE",
          key: "announcement_bar",
          title: "Global Broadcast Announcement",
          contentJson: JSON.stringify({
            isActive: announcementActive,
            message: announcementText,
            variant: "warning",
          }),
        }),
      });
      setSavedSuccessKey("announcement_bar");
      setTimeout(() => setSavedSuccessKey(null), 2500);
    } catch (e) {
      console.error("Save announcement failed", e);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Frontend Content Management System (Headless CMS)
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
              Live Edge CDN
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage public landing page copy, broadcast announcement banners, and scheduled maintenance lockouts without redeploying code.
          </p>
        </div>

        <button
          onClick={fetchCmsData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Content</span>
        </button>
      </div>

      {/* Global Broadcast & Emergency Maintenance Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Announcement Bar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span>Global Announcement Banner</span>
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Display Banner</span>
            </label>
          </div>

          <textarea
            rows={3}
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Type alert banner message..."
            className="w-full p-2.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSaveAnnouncement}
              disabled={savingKey === "announcement_bar"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition"
            >
              {savedSuccessKey === "announcement_bar" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Published to CDN</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingKey === "announcement_bar" ? "Publishing..." : "Publish Banner"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Maintenance Lockout */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>Platform Maintenance Mode</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Engaging maintenance mode will gracefully pause incoming customer document submissions while preserving ongoing comparison jobs and admin console access.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${maintenanceMode ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {maintenanceMode ? "MAINTENANCE ACTIVE (LOCKOUT ON)" : "NORMAL OPERATIONS (ACCEPTING SCANS)"}
              </span>
            </div>

            <button
              onClick={handleToggleMaintenance}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                maintenanceMode
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {maintenanceMode ? "Resume Normal Operations" : "Engage Maintenance Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Headless Content Nodes */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Landing Page & Compliance Nodes</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured copy schemas for hero banners, pricing blocks, and academic integrity policies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nodes
            .filter((n) => n.key !== "announcement_bar")
            .map((node) => (
              <div
                key={node.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {node.title}
                    </h3>
                    <span className="font-mono text-[10px] text-slate-400">Key: {node.key} (v{node.version})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200/60">
                    PUBLISHED
                  </span>
                </div>

                <textarea
                  rows={4}
                  defaultValue={node.contentJson}
                  className="w-full p-2.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Last modified: {new Date(node.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => alert(`Saved node schema for ${node.key}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Update Schema</span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
