import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { preprocessText, extractTextFromBuffer } from "@/lib/preprocessing/text";
import { preprocessCode, detectLanguage } from "@/lib/preprocessing/code";
import fs from "fs";
import path from "path";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const directContent = formData.get("content") as string | null;
    const type = (formData.get("type") as string) || "TEXT"; // TEXT | PDF | CODE | IMAGE
    const title = (formData.get("title") as string) || "Untitled Submission";
    const languageInput = formData.get("language") as string | null;

    // Get or create default user for demonstration
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Dr. Eleanor Vance",
          email: "evaluator@university.edu",
          role: "TEACHER",
        },
      });
    }

    let originalFileUrl = "";
    let normalizedText: string | null = null;
    let detectedLang: string | null = null;

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, buffer);
      originalFileUrl = `/uploads/${safeFilename}`;

      if (type === "TEXT" || type === "PDF") {
        const raw = await extractTextFromBuffer(buffer, file.name || file.type || "text/plain");
        const prep = preprocessText(raw);
        normalizedText = prep.cleanedText;
      } else if (type === "CODE") {
        const raw = buffer.toString("utf-8");
        detectedLang = languageInput || detectLanguage(file.name);
        const prep = preprocessCode(raw, detectedLang);
        normalizedText = prep.cleanedCode;
      }
    } else if (directContent) {
      const safeFilename = `${Date.now()}-direct_input.txt`;
      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, Buffer.from(directContent, "utf-8"));
      originalFileUrl = `/uploads/${safeFilename}`;

      if (type === "TEXT" || type === "PDF") {
        const prep = preprocessText(directContent);
        normalizedText = prep.cleanedText;
      } else if (type === "CODE") {
        detectedLang = languageInput || detectLanguage(directContent);
        const prep = preprocessCode(directContent, detectedLang);
        normalizedText = prep.cleanedCode;
      }
    } else {
      return NextResponse.json(
        { error: "No file or text content provided." },
        { status: 400 }
      );
    }

    // Create Submission & Artifact
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        title,
        artifacts: {
          create: {
            type,
            originalFileUrl,
            normalizedText,
            language: detectedLang,
          },
        },
      },
      include: {
        artifacts: true,
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      artifact: submission.artifacts[0],
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process artifact upload." },
      { status: 500 }
    );
  }
}
