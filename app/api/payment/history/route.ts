import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureAdminDefaults } from "@/lib/admin/defaults";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureAdminDefaults();
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const [tier, transactions, dbUser] = await Promise.all([
      prisma.subscriptionTier.findFirst({
        where: { code: user.tierCode || "FREE" },
      }),
      prisma.transactionLedger.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tierCode: true,
          createdAt: true,
        },
      }),
    ]);

    // Count user submissions
    const submissionCount = await prisma.submission.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      user: dbUser,
      currentTier: tier || {
        code: user.tierCode || "FREE",
        name: user.tierCode === "PRO" ? "Pro Plan" : user.tierCode === "ENTERPRISE" ? "Enterprise Plan" : "Free Plan",
        monthlyScanAllowance: user.tierCode === "PRO" ? 500 : user.tierCode === "ENTERPRISE" ? 10000 : 10,
        priceMonthlyCents: user.tierCode === "PRO" ? 2000 : user.tierCode === "ENTERPRISE" ? 19900 : 0,
      },
      usage: {
        scansUsed: submissionCount,
        scansAllowance: tier?.monthlyScanAllowance || (user.tierCode === "PRO" ? 500 : 10),
        periodEnds: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
      },
      transactions,
    });
  } catch (error: any) {
    console.error("Payment history fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to load payment history" }, { status: 500 });
  }
}
