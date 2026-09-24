import { prisma } from "../prisma";
import { extractEmbedding } from "../ai-gateway";
import { cosineSimilarity } from "../similarity/cosine";
import { calculateConfidenceScore } from "../similarity/scoring";
import { generateTextDiff, generateCodeDiff, generateImageDiff } from "../similarity/diffMapping";
import { extractTextFromBuffer } from "../preprocessing/text";
import fs from "fs";
import path from "path";

export async function runComparisonJob(jobId: string): Promise<void> {
  const startTime = Date.now();

  try {
    // 1. Fetch Job and Artifacts
    const job = await prisma.comparisonJob.findUnique({
      where: { id: jobId },
      include: {
        artifactA: true,
        artifactB: true,
      },
    });

    if (!job) {
      throw new Error(`ComparisonJob ${jobId} not found.`);
    }

    // Update status to PREPROCESSING
    await prisma.comparisonJob.update({
      where: { id: jobId },
      data: { status: "PREPROCESSING" },
    });

    const { artifactA, artifactB } = job;
    const modality = artifactA.type;

    // Helper to resolve content
    const getContent = async (artifact: typeof artifactA): Promise<{ text: string; buffer: Buffer }> => {
      let text = artifact.normalizedText || "";
      let buffer = Buffer.from(text, "utf-8");

      if (artifact.originalFileUrl && artifact.originalFileUrl.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", artifact.originalFileUrl);
        if (fs.existsSync(filePath)) {
          buffer = fs.readFileSync(filePath);
          if (!text) {
            if (modality === "TEXT" || modality === "PDF") {
              text = await extractTextFromBuffer(buffer, artifact.originalFileUrl);
            } else if (modality === "CODE") {
              text = buffer.toString("utf-8");
            }
          }
        }
      }
      return { text, buffer };
    };

    const contentA = await getContent(artifactA);
    const contentB = await getContent(artifactB);

    // 2. Update status to EXTRACTING embeddings
    await prisma.comparisonJob.update({
      where: { id: jobId },
      data: { status: "EXTRACTING" },
    });

    const embeddingA = await extractEmbedding(
      artifactA.type as any,
      modality === "IMAGE" ? contentA.buffer : contentA.text,
      artifactA.language || undefined
    );

    const embeddingB = await extractEmbedding(
      artifactB.type as any,
      modality === "IMAGE" ? contentB.buffer : contentB.text,
      artifactB.language || undefined
    );

    // Update artifacts with embeddings
    await prisma.artifact.update({
      where: { id: artifactA.id },
      data: {
        embedding: JSON.stringify(embeddingA.vector),
        embeddingModel: embeddingA.model,
      },
    });

    await prisma.artifact.update({
      where: { id: artifactB.id },
      data: {
        embedding: JSON.stringify(embeddingB.vector),
        embeddingModel: embeddingB.model,
      },
    });

    // 3. Update status to COMPARING
    await prisma.comparisonJob.update({
      where: { id: jobId },
      data: { status: "COMPARING" },
    });

    // Calculate raw cosine similarity
    const rawCosine = cosineSimilarity(embeddingA.vector, embeddingB.vector);
    const confidence = calculateConfidenceScore(rawCosine);

    // Generate detailed diff mapping based on modality
    let reportData: any = {};
    if (modality === "TEXT" || modality === "PDF") {
      const diff = generateTextDiff(contentA.text, contentB.text);
      reportData = {
        modality: "TEXT",
        diff,
        summary: confidence,
        modelUsed: embeddingA.model,
        vectorDimensions: embeddingA.dimension,
      };
    } else if (modality === "CODE") {
      const diff = generateCodeDiff(contentA.text, contentB.text, artifactA.language || "generic");
      reportData = {
        modality: "CODE",
        diff,
        summary: confidence,
        modelUsed: embeddingA.model,
        language: artifactA.language || "code",
        vectorDimensions: embeddingA.dimension,
      };
    } else if (modality === "IMAGE") {
      const diff = generateImageDiff(contentA.buffer, contentB.buffer, 4);
      reportData = {
        modality: "IMAGE",
        diff,
        summary: confidence,
        modelUsed: embeddingA.model,
        vectorDimensions: embeddingA.dimension,
        imageAUrl: artifactA.originalFileUrl,
        imageBUrl: artifactB.originalFileUrl,
      };
    }

    const latencyMs = Date.now() - startTime;
    reportData.latencyMs = latencyMs;

    // 4. Mark COMPLETE
    await prisma.comparisonJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETE",
        similarityScore: confidence.confidenceScore,
        rawCosine: Math.round(rawCosine * 1000) / 1000,
        reportJson: JSON.stringify(reportData),
        completedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.error(`ComparisonJob ${jobId} failed:`, err);
    await prisma.comparisonJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: err.message || "Unknown error during comparison pipeline",
      },
    });
  }
}
