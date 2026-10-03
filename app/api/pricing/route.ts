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

    if (node?.contentJson) {
      try {
        const parsed = JSON.parse(node.contentJson);
        // Handle array vs object format
        if (Array.isArray(parsed)) {
          return NextResponse.json({
            success: true,
            pricing: {
              enterpriseContactEmail: "contact@originax.online",
              plans: parsed,
            },
          });
        }
        return NextResponse.json({
          success: true,
          pricing: parsed,
        });
      } catch (err) {
        console.error("Error parsing pricing_tiers JSON:", err);
      }
    }

    // Default Fallback Plans
    return NextResponse.json({
      success: true,
      pricing: {
        enterpriseContactEmail: "contact@originax.online",
        plans: [
          {
            id: "free",
            code: "FREE",
            name: "Free Plan",
            price: "$0",
            period: "forever",
            allowance: "10 checks free",
            seats: 1,
            badge: "Starter",
            highlight: false,
            ctaText: "Get Started Free",
            ctaHref: "/dashboard",
            features: [
              "10 Free Checks Included",
              "Natural Text & PDF Document Extraction",
              "Basic Source Code AST Analysis",
              "Local Zero-Knowledge Privacy Engine",
              "Instant Overlap Detection",
            ],
          },
          {
            id: "pro",
            code: "PRO",
            name: "Pro Plan",
            price: "$20",
            period: "per month",
            allowance: "500 scans/mo",
            seats: 1,
            badge: "Most Popular",
            highlight: true,
            ctaText: "Upgrade to Pro",
            ctaHref: "/signup?plan=pro",
            features: [
              "$20 / Month Active Access",
              "500 Multi-Modal Scans Monthly",
              "Full Code AST Identifier Anonymizer",
              "Deep Semantic Vector Projections",
              "Synchronized Split/Unified Diff Inspector",
              "Priority AI Inference Gateway",
            ],
          },
          {
            id: "team",
            code: "TEAM",
            name: "Team Plan",
            price: "$60",
            period: "per month",
            allowance: "2,500 scans/mo · 5 Seats",
            seats: 5,
            badge: "Collaboration",
            highlight: false,
            ctaText: "Get Team Plan",
            ctaHref: "/signup?plan=team",
            features: [
              "5 Team Seats Included",
              "Cohort N x N Collusion Heatmap Matrix",
              "Cross-Assignment Batch Comparison",
              "Shared Team Folders & Assignment Pools",
              "Team Activity Logs & Exportable Audit Trail",
              "Expedited Priority Queue",
            ],
          },
          {
            id: "enterprise",
            code: "ENTERPRISE",
            name: "Enterprise Plan",
            price: "Custom",
            period: "annual / institutional",
            allowance: "Unlimited scans & custom seats",
            seats: "Unlimited",
            badge: "Institutional",
            highlight: false,
            ctaText: "Contact for Custom Plan",
            ctaEmail: "contact@originax.online",
            features: [
              "Custom Seat & Scan Volume",
              "Direct Contact: contact@originax.online",
              "LMS Integration (Canvas, Moodle, Blackboard)",
              "Dedicated On-Premise Vectorizer Appliance",
              "Zero-Knowledge FERPA/HIPAA Compliance SLA",
              "Dedicated Account Executive & 24/7 SLA",
            ],
          },
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve pricing data" },
      { status: 500 }
    );
  }
}
