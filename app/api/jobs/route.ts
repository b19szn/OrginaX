import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.comparisonJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        artifactA: true,
        artifactB: true,
        submission: true,
      },
    });

    const artifacts = await prisma.artifact.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        submission: true,
      },
    });

    // Compute live metric summary for the clinical stat cards
    const totalJobs = jobs.length;
    const highSimilarityCount = jobs.filter(
      (j) => (j.similarityScore || 0) >= 85
    ).length;
    const modalityCount: Record<string, number> = { TEXT: 0, CODE: 0, IMAGE: 0 };
    artifacts.forEach((a) => {
      const type = a.type === "PDF" ? "TEXT" : a.type;
      modalityCount[type] = (modalityCount[type] || 0) + 1;
    });

    const completedJobsWithTime = jobs.filter(
      (j) => j.completedAt && j.createdAt
    );
    const avgLatencyMs =
      completedJobsWithTime.length > 0
        ? Math.round(
            completedJobsWithTime.reduce(
              (acc, j) =>
                acc +
                (new Date(j.completedAt!).getTime() -
                  new Date(j.createdAt).getTime()),
              0
            ) / completedJobsWithTime.length
          )
        : 180;

    // Fetch classroom batch submissions (submissions with multiple student artifacts and comparison jobs)
    const batchSubmissions = await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        artifacts: true,
        jobs: {
          orderBy: { similarityScore: "desc" },
        },
      },
    });

    const batches = batchSubmissions
      .filter((s) => s.artifacts.length >= 2 && s.jobs.length >= 1)
      .map((s) => {
        const studentCount = s.artifacts.length;
        const comparisonsCount = s.jobs.length;
        const scores = s.jobs.map((j) => j.similarityScore ?? 0);
        const sum = scores.reduce((a, b) => a + b, 0);
        const avg = scores.length > 0 ? Math.round((sum / scores.length) * 10) / 10 : 0;
        const max = scores.length > 0 ? Math.max(...scores) : 0;
        const highRiskCount = scores.filter((score) => score >= 70).length;
        const moderateRiskCount = scores.filter((score) => score >= 35 && score < 70).length;

        return {
          id: s.id,
          title: s.title,
          createdAt: s.createdAt,
          studentCount,
          comparisonsCount,
          modality: s.artifacts[0]?.type || "TEXT",
          averageSimilarity: avg,
          highestSimilarity: max,
          highRiskCount,
          moderateRiskCount,
          files: s.artifacts.map((a) => {
            const raw = a.originalFileUrl.split("/").pop() || "";
            return raw.replace(/^\d+-/, "");
          }),
        };
      });

    return NextResponse.json({
      success: true,
      jobs,
      batches,
      artifacts,
      metrics: {
        totalSubmissions: artifacts.length,
        totalComparisons: totalJobs,
        highSimilarityCount,
        modalityCount,
        avgLatencyMs,
      },
    });
  } catch (err: any) {
    console.error("Jobs fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list comparison jobs." },
      { status: 500 }
    );
  }
}
