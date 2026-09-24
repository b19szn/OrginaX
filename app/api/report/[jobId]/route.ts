import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    const job = await prisma.comparisonJob.findUnique({
      where: { id: jobId },
      include: {
        artifactA: true,
        artifactB: true,
        submission: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Comparison job not found." },
        { status: 404 }
      );
    }

    let parsedReport = null;
    if (job.reportJson) {
      try {
        parsedReport = JSON.parse(job.reportJson);
      } catch {
        parsedReport = job.reportJson;
      }
    }

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        report: parsedReport,
      },
    });
  } catch (err: any) {
    console.error("Report fetch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load report." },
      { status: 500 }
    );
  }
}
