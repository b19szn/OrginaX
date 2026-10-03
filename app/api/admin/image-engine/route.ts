import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminDefaults } from "@/lib/admin/defaults";

export async function GET() {
  try {
    await ensureAdminDefaults();

    const settings = await prisma.adminSetting.findMany({
      where: {
        key: {
          in: [
            "image_hash_algorithm",
            "image_grid_resolution",
            "image_hamming_tolerance",
            "image_ocr_enabled",
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      settings: {
        algorithm: settingsMap["image_hash_algorithm"] || "PHASH_DCT",
        resolution: settingsMap["image_grid_resolution"] || "256",
        tolerance: parseInt(settingsMap["image_hamming_tolerance"] || "12", 10),
        ocrDiagrams: settingsMap["image_ocr_enabled"] !== "false",
      },
    });
  } catch (error: any) {
    console.error("Failed to load image engine settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load image engine configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { algorithm, resolution, tolerance, ocrDiagrams } = body;

    const updates = [
      prisma.adminSetting.upsert({
        where: { key: "image_hash_algorithm" },
        update: { value: String(algorithm || "PHASH_DCT") },
        create: {
          key: "image_hash_algorithm",
          value: String(algorithm || "PHASH_DCT"),
          description: "Perceptual hashing algorithm for visual diagram matching",
        },
      }),
      prisma.adminSetting.upsert({
        where: { key: "image_grid_resolution" },
        update: { value: String(resolution || "256") },
        create: {
          key: "image_grid_resolution",
          value: String(resolution || "256"),
          description: "Grid resolution downsampling for visual normalization",
        },
      }),
      prisma.adminSetting.upsert({
        where: { key: "image_hamming_tolerance" },
        update: { value: String(tolerance ?? 12) },
        create: {
          key: "image_hamming_tolerance",
          value: String(tolerance ?? 12),
          description: "Hamming bit distance tolerance for diagram plagiarism detection",
        },
      }),
      prisma.adminSetting.upsert({
        where: { key: "image_ocr_enabled" },
        update: { value: ocrDiagrams ? "true" : "false" },
        create: {
          key: "image_ocr_enabled",
          value: ocrDiagrams ? "true" : "false",
          description: "Enable OCR on flowchart nodes for cross-modal text diffing",
        },
      }),
    ];

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Visual & diagram similarity engine configuration saved and active across all inference nodes",
      settings: {
        algorithm: String(algorithm || "PHASH_DCT"),
        resolution: String(resolution || "256"),
        tolerance: Number(tolerance ?? 12),
        ocrDiagrams: Boolean(ocrDiagrams),
      },
    });
  } catch (error: any) {
    console.error("Failed to save image engine settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save configuration" },
      { status: 500 }
    );
  }
}
