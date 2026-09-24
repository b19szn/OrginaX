import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminDefaults } from "@/lib/admin/defaults";

export async function GET() {
  try {
    await ensureAdminDefaults();
    const [nodes, maintenanceSetting] = await Promise.all([
      prisma.cmsNode.findMany({ orderBy: { key: "asc" } }),
      prisma.adminSetting.findUnique({ where: { key: "maintenance_mode" } }),
    ]);

    return NextResponse.json({
      success: true,
      nodes,
      maintenanceMode: maintenanceSetting?.value === "true",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to load CMS data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "UPDATE_NODE") {
      const { key, title, contentJson, isPublished } = body;
      const updated = await prisma.cmsNode.upsert({
        where: { key },
        update: {
          title,
          contentJson: typeof contentJson === "string" ? contentJson : JSON.stringify(contentJson),
          isPublished: typeof isPublished === "boolean" ? isPublished : true,
          version: { increment: 1 },
          updatedBy: "SuperAdmin_Session",
        },
        create: {
          key,
          title,
          contentJson: typeof contentJson === "string" ? contentJson : JSON.stringify(contentJson),
          isPublished: true,
          version: 1,
          updatedBy: "SuperAdmin_Session",
        },
      });

      return NextResponse.json({ success: true, message: `Node "${title}" saved and published`, node: updated });
    }

    if (action === "TOGGLE_MAINTENANCE") {
      const { enabled } = body;
      await prisma.adminSetting.upsert({
        where: { key: "maintenance_mode" },
        update: { value: enabled ? "true" : "false" },
        create: { key: "maintenance_mode", value: enabled ? "true" : "false", description: "Global maintenance mode" },
      });

      return NextResponse.json({ success: true, message: `Maintenance mode ${enabled ? "activated" : "deactivated"}` });
    }

    return NextResponse.json({ success: false, error: "Invalid CMS action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "CMS update failed" }, { status: 500 });
  }
}
