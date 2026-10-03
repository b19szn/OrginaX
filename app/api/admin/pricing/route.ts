import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminDefaults } from "@/lib/admin/defaults";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureAdminDefaults();
    const node = await prisma.cmsNode.findUnique({
      where: { key: "pricing_tiers" },
    });

    let data: any = null;
    if (node?.contentJson) {
      try {
        data = JSON.parse(node.contentJson);
      } catch (e) {
        console.error("Failed to parse pricing JSON:", e);
      }
    }

    const tiers = await prisma.subscriptionTier.findMany({
      orderBy: { priceMonthlyCents: "asc" },
    });

    return NextResponse.json({
      success: true,
      pricing: data,
      tiers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load admin pricing" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, pricingData, plan, enterpriseContactEmail } = body;

    if (action === "UPDATE_ALL_PLANS") {
      const payload = {
        enterpriseContactEmail: enterpriseContactEmail || "contact@originax.online",
        plans: pricingData.plans || [],
      };

      // 1. Update CMS Node
      await prisma.cmsNode.upsert({
        where: { key: "pricing_tiers" },
        update: {
          title: "Public Pricing Table",
          contentJson: JSON.stringify(payload),
          isPublished: true,
          version: { increment: 1 },
          updatedBy: "Admin_Session",
        },
        create: {
          key: "pricing_tiers",
          title: "Public Pricing Table",
          contentJson: JSON.stringify(payload),
          isPublished: true,
          version: 1,
          updatedBy: "Admin_Session",
        },
      });

      // 2. Synchronize SubscriptionTier table
      for (const p of payload.plans) {
        if (!p.code) continue;
        const priceCents = parseInt(String(p.price).replace(/[^0-9]/g, ""), 10) * 100 || 0;
        const scans = parseInt(String(p.allowance).replace(/[^0-9]/g, ""), 10) || 50;

        await prisma.subscriptionTier.upsert({
          where: { code: p.code },
          update: {
            name: p.name,
            priceMonthlyCents: priceCents,
            monthlyScanAllowance: scans,
            featuresJson: JSON.stringify(p.features || []),
            isActive: true,
          },
          create: {
            code: p.code,
            name: p.name,
            priceMonthlyCents: priceCents,
            monthlyScanAllowance: scans,
            rateLimitPerMinute: 60,
            featuresJson: JSON.stringify(p.features || []),
            isActive: true,
          },
        });
      }

      // 3. Log Audit
      await prisma.adminAuditLog.create({
        data: {
          actorEmail: "admin@originax.online",
          actorRole: "SuperAdmin",
          action: "TIER_UPDATED",
          target: "Pricing Tiers & Enterprise Contact",
          details: `Updated subscription plans: Free, Pro ($20), Team (5 Seats), Enterprise (${payload.enterpriseContactEmail})`,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription plans and enterprise contact successfully updated & published live!",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin pricing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update pricing" },
      { status: 500 }
    );
  }
}
