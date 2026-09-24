import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractEmbedding } from "@/lib/ai-gateway";
import { cosineSimilarity } from "@/lib/similarity/cosine";
import { calculateConfidenceScore } from "@/lib/similarity/scoring";
import { generateTextDiff, generateCodeDiff, generateImageDiff } from "@/lib/similarity/diffMapping";
import { extractTextFromBuffer, preprocessText } from "@/lib/preprocessing/text";
import { preprocessCode, detectLanguage } from "@/lib/preprocessing/code";
import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

interface ProcessedFileItem {
  index: number;
  name: string;
  size: number;
  buffer: Buffer;
  text: string;
  tokenCount: number;
  artifactId?: string;
  vector?: number[];
  model?: string;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let assignmentTitle = "Classroom Batch Examination";
    let modality: "TEXT" | "PDF" | "CODE" | "IMAGE" = "TEXT";
    let language = "python";
    const fileItems: ProcessedFileItem[] = [];

    // 1. Get or create teacher user
    let user = await prisma.user.findFirst({ where: { role: "TEACHER" } });
    if (!user) {
      user = await prisma.user.findFirst();
    }
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Dr. Eleanor Vance",
          email: "evaluator@university.edu",
          role: "TEACHER",
        },
      });
    }

    if (contentType.includes("application/json")) {
      const jsonBody = await req.json();
      assignmentTitle = jsonBody.assignmentTitle || assignmentTitle;
      modality = jsonBody.type || modality;
      language = jsonBody.language || language;

      if (jsonBody.isDemo) {
        // Pre-packaged 4-student class scenario
        const demoStudents = [
          {
            name: "Alex_Johnson_Assignment2.txt",
            text: "The rapid proliferation of multimodal deep learning models has revolutionized automated content evaluation. However, cross-artifact plagiarism detection requires projecting heterogeneous representations into a shared semantic manifold with robust geometry. We evaluate cosine alignment across dense text and code embeddings.",
          },
          {
            name: "Benjamin_Carter_Assignment2.txt",
            text: "The swift expansion of multimodal deep neural architectures has transformed modern automated content appraisal. Nonetheless, cross-artifact similarity analysis demands projecting disparate data representations onto a joint semantic manifold with resilient topology. We assess cosine alignment between dense linguistic and programmatic vectors.",
          },
          {
            name: "Clara_Mendoza_Assignment2.txt",
            text: "Automated content evaluation has seen rapid advances through multimodal deep learning algorithms. Cross-artifact plagiarism detection requires projecting heterogeneous representations into a shared semantic manifold with robust geometry. We evaluate cosine alignment across dense text and code embeddings to pinpoint unauthorized derivative borrowing.",
          },
          {
            name: "Daniel_Kim_Assignment2.txt",
            text: "Convolutional vision transformers leverage hierarchical feature pooling for high-resolution satellite imagery classification without recurrent temporal sequencing. Our proposed benchmark achieves linear scaling across sparse attention heads while maintaining low inference latency on embedded edge accelerators.",
          },
        ];

        demoStudents.forEach((student, idx) => {
          const buf = Buffer.from(student.text, "utf-8");
          const safeFilename = `${Date.now()}-${student.name}`;
          fs.writeFileSync(path.join(uploadsDir, safeFilename), buf);
          const prep = preprocessText(student.text);
          fileItems.push({
            index: idx,
            name: student.name,
            size: buf.length,
            buffer: buf,
            text: prep.cleanedText,
            tokenCount: prep.tokenCount,
          });
        });
      }
    } else {
      // Multipart form data
      const formData = await req.formData();
      assignmentTitle = (formData.get("assignmentTitle") as string) || assignmentTitle;
      modality = ((formData.get("type") as string) || "TEXT") as any;
      language = (formData.get("language") as string) || language;

      // Extract all files
      const rawFiles = formData.getAll("files") as File[];
      if (rawFiles.length === 0) {
        const singleFile = formData.get("file") as File | null;
        if (singleFile) rawFiles.push(singleFile);
      }

      if (rawFiles.length < 2) {
        return NextResponse.json(
          { error: "At least 2 files are required for classroom batch cross-checking." },
          { status: 400 }
        );
      }

      for (let i = 0; i < rawFiles.length; i++) {
        const file = rawFiles[i];
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        fs.writeFileSync(path.join(uploadsDir, safeFilename), buffer);

        let cleanText = "";
        let tokenCount = 0;

        if (modality === "TEXT" || modality === "PDF") {
          const raw = await extractTextFromBuffer(buffer, file.name || file.type || "text/plain");
          const prep = preprocessText(raw);
          cleanText = prep.cleanedText;
          tokenCount = prep.tokenCount;
        } else if (modality === "CODE") {
          const raw = buffer.toString("utf-8");
          const lang = language || detectLanguage(file.name);
          const prep = preprocessCode(raw, lang);
          cleanText = prep.cleanedCode;
          tokenCount = prep.structuralTokens.length;
        } else {
          cleanText = file.name;
          tokenCount = Math.round(buffer.length / 1024);
        }

        fileItems.push({
          index: i,
          name: file.name,
          size: file.size,
          buffer,
          text: cleanText,
          tokenCount,
        });
      }
    }

    if (fileItems.length < 2) {
      return NextResponse.json(
        { error: "Batch comparison requires at least 2 student submissions." },
        { status: 400 }
      );
    }

    // 2. Create the Submission container in DB
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        title: assignmentTitle,
      },
    });

    // 3. Extract embeddings and create Artifact records (O(N) operations)
    for (const item of fileItems) {
      const embedding = await extractEmbedding(
        modality,
        modality === "IMAGE" ? item.buffer : item.text,
        modality === "CODE" ? language : undefined
      );

      item.vector = embedding.vector;
      item.model = embedding.model;

      const artifact = await prisma.artifact.create({
        data: {
          submissionId: submission.id,
          type: modality,
          originalFileUrl: `/uploads/${Date.now()}-${item.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
          normalizedText: item.text,
          language: modality === "CODE" ? language : null,
          embedding: JSON.stringify(embedding.vector),
          embeddingModel: embedding.model,
        },
      });

      item.artifactId = artifact.id;
    }

    // 4. Compute All-vs-All Pairwise Cross-Matrix & Jobs (N*(N-1)/2 pairs)
    const N = fileItems.length;
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
    let comparisonsCount = 0;
    let highestSimilarity = 0;
    let topRiskPairTitle = "";

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i === j) {
          matrix[i][j] = { similarity: 100, jobId: null, status: "self" };
          continue;
        }

        // Only compute unique pairs once, mirror for j < i
        if (i < j) {
          const itemA = fileItems[i];
          const itemB = fileItems[j];

          const rawCosine = cosineSimilarity(itemA.vector!, itemB.vector!);
          const confidence = calculateConfidenceScore(rawCosine);
          const score = confidence.confidenceScore;

          similaritySum += score;
          comparisonsCount++;
          if (score > highestSimilarity) {
            highestSimilarity = score;
            topRiskPairTitle = `${itemA.name} ↔ ${itemB.name}`;
          }

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

          // Generate detailed diff mapping for deep inspection
          let diffReport: any = null;
          if (modality === "TEXT" || modality === "PDF") {
            diffReport = generateTextDiff(itemA.text, itemB.text);
          } else if (modality === "CODE") {
            diffReport = generateCodeDiff(itemA.text, itemB.text, language);
          } else {
            diffReport = generateImageDiff(itemA.buffer, itemB.buffer, 4);
          }

          const reportData = {
            modality,
            diff: diffReport,
            summary: confidence,
            modelUsed: itemA.model || "Sentence-BERT",
            vectorDimensions: itemA.vector?.length || 64,
            latencyMs: 12,
          };

          // Create permanent ComparisonJob so teacher can click right into it
          const job = await prisma.comparisonJob.create({
            data: {
              submissionId: submission.id,
              artifactAId: itemA.artifactId!,
              artifactBId: itemB.artifactId!,
              status: "COMPLETE",
              similarityScore: score,
              rawCosine: Math.round(rawCosine * 1000) / 1000,
              reportJson: JSON.stringify(reportData),
              completedAt: new Date(),
            },
          });

          matrix[i][j] = { similarity: score, jobId: job.id, status: pairStatus };
          matrix[j][i] = { similarity: score, jobId: job.id, status: pairStatus };

          flaggedPairs.push({
            pairKey: `${i}-${j}`,
            fileA: { index: i, name: itemA.name, id: itemA.artifactId! },
            fileB: { index: j, name: itemB.name, id: itemB.artifactId! },
            similarity: score,
            rawCosine: Math.round(rawCosine * 1000) / 1000,
            status: pairStatus,
            jobId: job.id,
          });
        }
      }
    }

    // Sort flagged pairs descending by similarity
    flaggedPairs.sort((a, b) => b.similarity - a.similarity);

    const averageSimilarity =
      comparisonsCount > 0 ? Math.round((similaritySum / comparisonsCount) * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      assignmentTitle,
      modality,
      files: fileItems.map((f) => ({
        index: f.index,
        id: f.artifactId,
        name: f.name,
        size: f.size,
        tokenCount: f.tokenCount,
      })),
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
    });
  } catch (err: any) {
    console.error("Batch compare error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process classroom batch comparison." },
      { status: 500 }
    );
  }
}
