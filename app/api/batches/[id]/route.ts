import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cleanFilename(url: string): string {
  if (!url) return "Student File";
  const basename = url.split("/").pop() || "";
  // Strip leading timestamp e.g. 1790204130855-
  return basename.replace(/^\d+-/, "") || basename;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        artifacts: true,
        jobs: {
          include: {
            artifactA: true,
            artifactB: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Batch submission not found" }, { status: 404 });
    }

    const files = submission.artifacts.map((a, idx) => ({
      index: idx,
      id: a.id,
      name: cleanFilename(a.originalFileUrl),
      size: a.normalizedText ? Buffer.byteLength(a.normalizedText, "utf-8") : 0,
      tokenCount: a.normalizedText ? a.normalizedText.split(/\s+/).length : 0,
    }));

    const N = files.length;
    const matrix: Array<Array<{
      similarity: number;
      jobId: string | null;
      status: "self" | "high" | "moderate" | "low";
    }>> = Array.from({ length: N }, () =>
      Array.from({ length: N }, () => ({
        similarity: 100,
        jobId: null,
        status: "self",
      }))
    );

    interface FlaggedPair {
      pairKey: string;
      fileA: { index: number; name: string; id: string };
      fileB: { index: number; name: string; id: string };
      similarity: number;
      rawCosine: number;
      status: "high" | "moderate" | "low";
      jobId: string;
    }

    const flaggedPairs: FlaggedPair[] = [];
    let highRiskCount = 0;
    let moderateRiskCount = 0;
    let safeCount = 0;
    let similaritySum = 0;
    let highestSimilarity = 0;
    let topRiskPairTitle = "";

    // Map artifact ID to index
    const idToIndex = new Map<string, number>();
    files.forEach((f) => idToIndex.set(f.id, f.index));

    submission.jobs.forEach((job) => {
      const idxA = idToIndex.get(job.artifactAId);
      const idxB = idToIndex.get(job.artifactBId);

      const score = job.similarityScore ?? 0;
      similaritySum += score;

      let pairStatus: "high" | "moderate" | "low" = "low";
      if (score >= 70) {
        pairStatus = "high";
        highRiskCount++;
      } else if (score >= 35) {
        pairStatus = "moderate";
        moderateRiskCount++;
      } else {
        safeCount++;
      }

      if (score > highestSimilarity) {
        highestSimilarity = score;
        if (idxA !== undefined && idxB !== undefined) {
          topRiskPairTitle = `${files[idxA].name} ↔ ${files[idxB].name}`;
        }
      }

      if (idxA !== undefined && idxB !== undefined) {
        matrix[idxA][idxB] = { similarity: score, jobId: job.id, status: pairStatus };
        matrix[idxB][idxA] = { similarity: score, jobId: job.id, status: pairStatus };

        flaggedPairs.push({
          pairKey: `${Math.min(idxA, idxB)}-${Math.max(idxA, idxB)}`,
          fileA: { index: idxA, name: files[idxA].name, id: files[idxA].id },
          fileB: { index: idxB, name: files[idxB].name, id: files[idxB].id },
          similarity: score,
          rawCosine: job.rawCosine ?? score / 100,
          status: pairStatus,
          jobId: job.id,
        });
      }
    });

    flaggedPairs.sort((a, b) => b.similarity - a.similarity);

    const comparisonsCount = submission.jobs.length;
    const averageSimilarity =
      comparisonsCount > 0 ? Math.round((similaritySum / comparisonsCount) * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      batch: {
        submissionId: submission.id,
        assignmentTitle: submission.title,
        modality: submission.artifacts[0]?.type || "TEXT",
        files,
        matrix,
        flaggedPairs,
        summary: {
          totalStudents: N,
          totalComparisons: comparisonsCount,
          highRiskCount,
          moderateRiskCount,
          safeCount,
          averageSimilarity,
          highestSimilarity,
          topRiskPair: topRiskPairTitle,
        },
      },
    });
  } catch (err: any) {
    console.error("Batch fetch error:", err);
    return NextResponse.json({ error: err.message || "Failed to load batch." }, { status: 500 });
  }
}
