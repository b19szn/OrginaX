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
  Plus,
  Trash2,
  Code,
  Globe,
  X,
  ExternalLink,
  CheckCircle2,
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
  const [nodeDrafts, setNodeDrafts] = useState<Record<string, { title: string; contentJson: string; isPublished: boolean }>>({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSuccessKey, setSavedSuccessKey] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [previewNode, setPreviewNode] = useState<CmsNode | null>(null);

  // New Node Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState('{\n  "message": "Custom block content"\n}');
  const [isAdding, setIsAdding] = useState(false);

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms");
      const json = await res.json();
      if (json.success) {
        setNodes(json.nodes);
        const drafts: Record<string, { title: string; contentJson: string; isPublished: boolean }> = {};
        json.nodes.forEach((n: CmsNode) => {
          drafts[n.key] = {
            title: n.title,
            contentJson: n.contentJson,
            isPublished: n.isPublished,
          };
        });
        setNodeDrafts(drafts);
        setMaintenanceMode(json.maintenanceMode);

        const annNode = json.nodes.find((n: CmsNode) => n.key === "announcement_bar");
        if (annNode) {
          try {
            const parsed = JSON.parse(annNode.contentJson);
            setAnnouncementText(parsed.message || "");
            setAnnouncementActive(parsed.isActive || false);
          } catch {
            setAnnouncementText(annNode.contentJson);
            setAnnouncementActive(annNode.isPublished);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load CMS nodes", e);
      showError("Failed to fetch CMS data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  const handleToggleMaintenance = async () => {
    try {
      const next = !maintenanceMode;
      setMaintenanceMode(next);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_MAINTENANCE", enabled: next }),
      });
      const data = await res.json();
      if (!data.success) {
        setMaintenanceMode(!next);
        showError(data.error || "Failed to update maintenance mode");
      }
    } catch (e) {
      console.error("Toggle maintenance failed", e);
      showError("Network error toggling maintenance mode");
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      setSavingKey("announcement_bar");
      const res = await fetch("/api/admin/cms", {
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
          isPublished: announcementActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccessKey("announcement_bar");
        setTimeout(() => setSavedSuccessKey(null), 2500);
        await fetchCmsData();
      } else {
        showError(data.error || "Failed to publish announcement");
      }
    } catch (e) {
      console.error("Save announcement failed", e);
      showError("Network error publishing announcement");
    } finally {
      setSavingKey(null);
    }
  };

  const handleUpdateDraft = (key: string, field: "title" | "contentJson" | "isPublished", value: any) => {
    setNodeDrafts((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { title: "", contentJson: "", isPublished: true }),
        [field]: value,
      },
    }));
  };

  const handleFormatJson = (key: string) => {
    const draft = nodeDrafts[key];
    if (!draft) return;
    try {
      const parsed = JSON.parse(draft.contentJson);
      const formatted = JSON.stringify(parsed, null, 2);
      handleUpdateDraft(key, "contentJson", formatted);
    } catch (err: any) {
      showError(`Invalid JSON in node "${key}": ${err.message}`);
    }
  };

  const handleSaveNode = async (key: string) => {
    const draft = nodeDrafts[key];
    if (!draft) return;

    try {
      setSavingKey(key);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_NODE",
          key,
          title: draft.title,
          contentJson: draft.contentJson,
          isPublished: draft.isPublished,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccessKey(key);
        setTimeout(() => setSavedSuccessKey(null), 2500);
        await fetchCmsData();
      } else {
        showError(data.error || "Failed to update node schema");
      }
    } catch (e) {
      console.error("Save node failed", e);
      showError("Network error saving node");
    } finally {
      setSavingKey(null);
    }
  };

  const handleDeleteNode = async (key: string) => {
    if (!confirm(`Are you sure you want to permanently delete CMS node "${key}"?`)) {
      return;
    }

    try {
      setSavingKey(key);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_NODE", key }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCmsData();
      } else {
        showError(data.error || "Failed to delete node");
      }
    } catch (e) {
      console.error("Delete node failed", e);
      showError("Network error deleting node");
    } finally {
      setSavingKey(null);
    }
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newTitle.trim()) {
      showError("Node key and title are required");
      return;
    }

    const cleanKey = newKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

    try {
      setIsAdding(true);
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_NODE",
          key: cleanKey,
          title: newTitle.trim(),
          contentJson: newContent,
          isPublished: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewKey("");
        setNewTitle("");
        setNewContent('{\n  "message": "Custom block content"\n}');
        await fetchCmsData();
      } else {
        showError(data.error || "Failed to create node");
      }
    } catch (e) {
      console.error("Create node failed", e);
      showError("Network error creating node");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {errorToast && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Frontend Content Management System (Headless CMS)
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
              Live Edge Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage public landing page copy, broadcast announcement banners, and scheduled maintenance lockouts in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add CMS Node</span>
          </button>

          <button
            onClick={fetchCmsData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Refresh Content</span>
          </button>
        </div>
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
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Display Banner</span>
            </label>
          </div>

          <textarea
            rows={3}
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Type alert banner message..."
            className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400">
              Status: {announcementActive ? "Active on Public Navbar" : "Hidden"}
            </span>
            <button
              onClick={handleSaveAnnouncement}
              disabled={savingKey === "announcement_bar"}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer disabled:opacity-50"
            >
              {savedSuccessKey === "announcement_bar" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Published to Edge</span>
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                maintenanceMode
                  ? "bg-sky-600 hover:bg-sky-700 text-white"
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Landing Page &amp; Policy Content Nodes</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                {nodes.filter((n) => n.key !== "announcement_bar").length} Nodes
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Structured copy schemas for hero banners, pricing blocks, and academic integrity policies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {nodes
            .filter((n) => n.key !== "announcement_bar")
            .map((node) => {
              const draft = nodeDrafts[node.key] || {
                title: node.title,
                contentJson: node.contentJson,
                isPublished: node.isPublished,
              };
              const isSaving = savingKey === node.key;
              const isSaved = savedSuccessKey === node.key;

              return (
                <div
                  key={node.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Node Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) => handleUpdateDraft(node.key, "title", e.target.value)}
                          className="font-semibold text-sm text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none w-full transition"
                          placeholder="Node Title..."
                        />
                        <span className="font-mono text-[10px] text-slate-400">
                          Key: <code className="text-slate-600 dark:text-slate-300">{node.key}</code> (v{node.version})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-medium text-slate-500">
                          <input
                            type="checkbox"
                            checked={draft.isPublished}
                            onChange={(e) => handleUpdateDraft(node.key, "isPublished", e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-600"
                          />
                          <span>{draft.isPublished ? "PUBLISHED" : "DRAFT"}</span>
                        </label>

                        <button
                          onClick={() => setPreviewNode({ ...node, ...draft })}
                          title="Preview Formatted JSON"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteNode(node.key)}
                          title="Delete Node"
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content Editor */}
                    <div className="relative">
                      <textarea
                        rows={6}
                        value={draft.contentJson}
                        onChange={(e) => handleUpdateDraft(node.key, "contentJson", e.target.value)}
                        className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                      />
                      <button
                        onClick={() => handleFormatJson(node.key)}
                        title="Format JSON"
                        className="absolute right-2.5 bottom-3.5 px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-2xs"
                      >
                        Format JSON
                      </button>
                    </div>
                  </div>

                  {/* Node Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      Modified: {new Date(node.updatedAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => handleSaveNode(node.key)}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                          <span>Saved to Database</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? "Saving..." : "Update Schema"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* New Node Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Create New Headless CMS Node</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Unique Node Key (e.g., <code className="text-emerald-600">footer_compliance</code>)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hero_cta_banner"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Display Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hero Call to Action"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Initial Content JSON or Text Schema
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                >
                  {isAdding ? "Creating Node..." : "Create Node"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{previewNode.title}</h3>
                <span className="text-[10px] font-mono text-slate-400">Key: {previewNode.key}</span>
              </div>
              <button
                onClick={() => setPreviewNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-3.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed border border-slate-800">
              <pre className="whitespace-pre-wrap">{previewNode.contentJson}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewNode(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
