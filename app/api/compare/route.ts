import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runComparisonJob } from "@/lib/queue/jobRunner";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, artifactAId, artifactBId } = body;

    if (!artifactAId || !artifactBId) {
      return NextResponse.json(
        { error: "Both artifactAId and artifactBId are required." },
        { status: 400 }
      );
    }

    const artifactA = await prisma.artifact.findUnique({
      where: { id: artifactAId },
    });
    const artifactB = await prisma.artifact.findUnique({
      where: { id: artifactBId },
    });

    if (!artifactA || !artifactB) {
      return NextResponse.json(
        { error: "One or both artifacts could not be found." },
        { status: 404 }
      );
    }

    // Determine target submission
    let targetSubId = submissionId || artifactA.submissionId;

    // Create ComparisonJob
    const job = await prisma.comparisonJob.create({
      data: {
        submissionId: targetSubId,
        artifactAId,
        artifactBId,
        status: "PENDING",
      },
    });

    // Execute job asynchronously without blocking HTTP response or synchronously for quick response
    await runComparisonJob(job.id);

    const completedJob = await prisma.comparisonJob.findUnique({
      where: { id: job.id },
      include: {
        artifactA: true,
        artifactB: true,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      job: completedJob,
    });
  } catch (err: any) {
    console.error("Comparison dispatch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to initiate comparison." },
      { status: 500 }
    );
  }
}
