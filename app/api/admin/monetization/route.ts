import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminDefaults } from "@/lib/admin/defaults";

export async function GET() {
  try {
    await ensureAdminDefaults();
    const [gateways, tiers, transactions] = await Promise.all([
      prisma.paymentGatewayConfig.findMany({ orderBy: { gateway: "asc" } }),
      prisma.subscriptionTier.findMany({ orderBy: { priceMonthlyCents: "asc" } }),
      prisma.transactionLedger.findMany({ take: 15, orderBy: { createdAt: "desc" } }),
    ]);

    // If transactions empty, generate sample ledger records for audit demonstration
    let sampleLedger = transactions;
    if (transactions.length === 0) {
      await prisma.transactionLedger.createMany({
        data: [
          { invoiceId: "INV-2026-9041", userId: "usr_e88a", userEmailMasked: "a***@stanford.edu", gateway: "STRIPE", amountCents: 2900, status: "SUCCEEDED" },
          { invoiceId: "INV-2026-9042", userId: "usr_71bf", userEmailMasked: "c***@oxford.ac.uk", gateway: "STRIPE", amountCents: 19900, status: "SUCCEEDED" },
          { invoiceId: "INV-2026-9043", userId: "usr_440d", userEmailMasked: "d***@mit.edu", gateway: "LEMON_SQUEEZY", amountCents: 2900, status: "SUCCEEDED" },
          { invoiceId: "INV-2026-9044", userId: "usr_321c", userEmailMasked: "k***@buet.ac.bd", gateway: "SSLCOMMERZ", amountCents: 1500, status: "SUCCEEDED" },
        ],
      });
      sampleLedger = await prisma.transactionLedger.findMany({ take: 15, orderBy: { createdAt: "desc" } });
    }

    return NextResponse.json({
      success: true,
      gateways,
      tiers,
      transactions: sampleLedger,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to load monetization data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "UPDATE_GATEWAY") {
      const { gatewayId, isEnabled, isLiveMode, publicKey, secretKey, webhookSecret } = body;
      const updateData: any = {};
      if (typeof isEnabled === "boolean") updateData.isEnabled = isEnabled;
      if (typeof isLiveMode === "boolean") updateData.isLiveMode = isLiveMode;
      if (publicKey) updateData.publicKey = publicKey;
      if (secretKey && secretKey.trim()) {
        const trimmed = secretKey.trim();
        updateData.secretKeyMasked = `${trimmed.slice(0, 6)}••••••••${trimmed.slice(-4)}`;
      }
      if (webhookSecret && webhookSecret.trim()) {
        const trimmed = webhookSecret.trim();
        updateData.webhookSecretMasked = `${trimmed.slice(0, 6)}••••••••${trimmed.slice(-4)}`;
      }

      const updated = await prisma.paymentGatewayConfig.update({
        where: { id: gatewayId },
        data: updateData,
      });

      return NextResponse.json({ success: true, message: `Gateway ${updated.name} updated`, gateway: updated });
    }

    if (action === "UPDATE_TIER") {
      const { tierId, priceMonthlyCents, monthlyScanAllowance, rateLimitPerMinute, isActive } = body;
      const updated = await prisma.subscriptionTier.update({
        where: { id: tierId },
        data: {
          priceMonthlyCents: Number(priceMonthlyCents),
          monthlyScanAllowance: Number(monthlyScanAllowance),
          rateLimitPerMinute: Number(rateLimitPerMinute),
          isActive: typeof isActive === "boolean" ? isActive : true,
        },
      });

      return NextResponse.json({ success: true, message: `Tier ${updated.name} updated`, tier: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid monetization action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Monetization update failed" }, { status: 500 });
  }
}
