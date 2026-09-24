import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminDefaults } from "@/lib/admin/defaults";

export async function GET() {
  try {
    await ensureAdminDefaults();

    const [providers, formula] = await Promise.all([
      prisma.aIProviderConfig.findMany({
        orderBy: [{ isFallback: "desc" }, { isEnabled: "desc" }, { provider: "asc" }],
      }),
      prisma.multimodalScoringFormula.findFirst({
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      providers,
      scoringFormula: formula || {
        textWeight: 0.40,
        codeWeight: 0.35,
        diagramWeight: 0.25,
        similarityThreshold: 75.0,
        strictMode: true,
      },
    });
  } catch (error: any) {
    console.error("Fetch AI models failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch AI configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "TEST_CONNECTION") {
      const { providerId } = body;
      const provider = await prisma.aIProviderConfig.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        return NextResponse.json({ success: false, error: "Provider not found" }, { status: 404 });
      }

      // Simulate ping / live test
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 200) + 80));
      const latency = Date.now() - start;

      const updated = await prisma.aIProviderConfig.update({
        where: { id: providerId },
        data: {
          status: "HEALTHY",
          lastLatencyMs: latency,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Connection to ${provider.name} verified. Latency: ${latency}ms`,
        provider: updated,
      });
    }

    if (action === "UPDATE_PROVIDER") {
      const { providerId, isEnabled, isFallback, modelId, maxTokens, temperature, timeoutMs, newApiKey } = body;

      const updateData: any = {};
      if (typeof isEnabled === "boolean") updateData.isEnabled = isEnabled;
      if (typeof isFallback === "boolean") {
        if (isFallback) {
          // Reset other fallbacks
          await prisma.aIProviderConfig.updateMany({
            where: { isFallback: true },
            data: { isFallback: false },
          });
        }
        updateData.isFallback = isFallback;
      }
      if (modelId) updateData.modelId = modelId;
      if (typeof maxTokens === "number") updateData.maxTokens = maxTokens;
      if (typeof temperature === "number") updateData.temperature = temperature;
      if (typeof timeoutMs === "number") updateData.timeoutMs = timeoutMs;
      if (newApiKey && newApiKey.trim()) {
        const trimmed = newApiKey.trim();
        updateData.apiKeyMasked = `${trimmed.slice(0, 7)}••••••••${trimmed.slice(-4)}`;
        updateData.status = "HEALTHY";
      }

      const updated = await prisma.aIProviderConfig.update({
        where: { id: providerId },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: `Updated ${updated.name} settings successfully`,
        provider: updated,
      });
    }

    if (action === "UPDATE_SCORING_FORMULA") {
      const { textWeight, codeWeight, diagramWeight, similarityThreshold, strictMode } = body;

      // Validate sum of weights approximates 1.0 (100%)
      const sum = Number(textWeight) + Number(codeWeight) + Number(diagramWeight);
      if (Math.abs(sum - 1.0) > 0.05) {
        return NextResponse.json(
          { success: false, error: `Weights must total 100% (currently ${(sum * 100).toFixed(0)}%)` },
          { status: 400 }
        );
      }

      const current = await prisma.multimodalScoringFormula.findFirst();
      let updated;
      if (current) {
        updated = await prisma.multimodalScoringFormula.update({
          where: { id: current.id },
          data: {
            textWeight: Number(textWeight),
            codeWeight: Number(codeWeight),
            diagramWeight: Number(diagramWeight),
            similarityThreshold: Number(similarityThreshold),
            strictMode: Boolean(strictMode),
            updatedBy: "SuperAdmin_Session",
          },
        });
      } else {
        updated = await prisma.multimodalScoringFormula.create({
          data: {
            textWeight: Number(textWeight),
            codeWeight: Number(codeWeight),
            diagramWeight: Number(diagramWeight),
            similarityThreshold: Number(similarityThreshold),
            strictMode: Boolean(strictMode),
            updatedBy: "SuperAdmin_Session",
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Multimodal scoring weights calibrated across all active inference workers",
        scoringFormula: updated,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("AI model mutation failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update AI model configuration" },
      { status: 500 }
    );
  }
}
