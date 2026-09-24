"use client";

import { useEffect, useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import StatCards from "@/components/StatCards";
import UploadDashboard from "@/components/UploadDashboard";
import RecentJobsTable, { ClassroomBatchSummary } from "@/components/RecentJobsTable";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [batches, setBatches] = useState<ClassroomBatchSummary[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalSubmissions: 0,
    totalComparisons: 0,
    highSimilarityCount: 0,
    modalityCount: { TEXT: 0, CODE: 0, IMAGE: 0 },
    avgLatencyMs: 180,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchJobsAndMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
        setBatches(data.batches || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndMetrics();
  }, []);

  const handleSelectBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    const element = document.getElementById("upload-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/demo/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchJobsAndMetrics();
      } else {
        alert(data.error || "Failed to seed demo data.");
      }
    } catch (err: any) {
      alert("Error seeding benchmark pairs: " + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 10% Vibrant Emerald Hero Welcome Banner */}
      <HeroBanner onSeedDemo={handleSeedDemo} isSeeding={isSeeding} />

      {/* Monochromatic-Tint Metric Stat Cards */}
      <StatCards metrics={metrics} />

      {/* Dual Multi-Modal Upload Engine */}
      <UploadDashboard
        onJobCreated={fetchJobsAndMetrics}
        loadBatchId={selectedBatchId}
        onBatchLoaded={() => setSelectedBatchId(null)}
      />

      {/* Audit History & Comparison Logs */}
      <RecentJobsTable
        jobs={jobs}
        batches={batches}
        isLoading={isLoading}
        onRefresh={fetchJobsAndMetrics}
        onSelectBatch={handleSelectBatch}
      />
    </div>
  );
}

