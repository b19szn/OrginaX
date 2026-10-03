import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminDefaults } from "@/lib/admin/defaults";
import { saveGatewayCredentials } from "@/lib/payment/config";
import { testGateway, completePayment } from "@/lib/payment/service";
import { PaymentGatewayType } from "@/lib/payment/types";

export async function GET() {
  try {
    await ensureAdminDefaults();
    const [gateways, tiers, transactions] = await Promise.all([
      prisma.paymentGatewayConfig.findMany({ orderBy: { gateway: "asc" } }),
      prisma.subscriptionTier.findMany({ orderBy: { priceMonthlyCents: "asc" } }),
      prisma.transactionLedger.findMany({ take: 25, orderBy: { createdAt: "desc" } }),
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
      sampleLedger = await prisma.transactionLedger.findMany({ take: 25, orderBy: { createdAt: "desc" } });
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

      const gw = await prisma.paymentGatewayConfig.findUnique({
        where: { id: gatewayId },
      });

      if (!gw) {
        return NextResponse.json({ success: false, error: "Gateway not found" }, { status: 404 });
      }

      await saveGatewayCredentials(gw.gateway as PaymentGatewayType, {
        publicKey,
        secretKey,
        webhookSecret,
        isLiveMode,
        isEnabled,
      });

      const updated = await prisma.paymentGatewayConfig.findUnique({
        where: { id: gatewayId },
      });

      return NextResponse.json({ success: true, message: `Gateway ${gw.name} updated`, gateway: updated });
    }

    if (action === "TEST_GATEWAY") {
      const { gateway } = body;
      const testResult = await testGateway(gateway as PaymentGatewayType);
      return NextResponse.json({ success: true, testResult });
    }

    if (action === "SIMULATE_PAYMENT") {
      const { gateway = "STRIPE", planCode = "PRO", amountCents = 2000, userEmail = "tester@mit.edu" } = body;
      const invoiceId = `INV-SIM-${Date.now().toString().slice(-6)}`;

      await prisma.transactionLedger.create({
        data: {
          invoiceId,
          userId: `usr_sim_${Date.now()}`,
          userEmailMasked: `${userEmail.split("@")[0].slice(0, 2)}***@${userEmail.split("@")[1]}`,
          gateway,
          amountCents: Number(amountCents),
          currency: "USD",
          status: "PENDING",
        },
      });

      const verification = await completePayment({
        invoiceId,
        gateway: gateway as PaymentGatewayType,
        externalTransactionId: `SIM_TX_${Date.now()}`,
        planCode,
      });

      return NextResponse.json({
        success: true,
        message: `Simulated $${(Number(amountCents) / 100).toFixed(2)} test payment completed on ${gateway}`,
        invoiceId,
        verification,
      });
    }

    if (action === "REFUND_TRANSACTION") {
      const { invoiceId } = body;
      if (!invoiceId) {
        return NextResponse.json({ success: false, error: "Invoice ID required" }, { status: 400 });
      }

      const tx = await prisma.transactionLedger.findUnique({ where: { invoiceId } });
      if (!tx) {
        return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
      }

      const updated = await prisma.transactionLedger.update({
        where: { invoiceId },
        data: { status: "REFUNDED" },
      });

      await prisma.adminAuditLog.create({
        data: {
          actorEmail: "admin@originax.online",
          actorRole: "SuperAdmin",
          action: "PAYMENT_REFUNDED",
          target: `Invoice ${invoiceId}`,
          details: `Refunded $${(tx.amountCents / 100).toFixed(2)} on gateway ${tx.gateway}`,
        },
      });

      return NextResponse.json({ success: true, message: `Invoice ${invoiceId} marked as REFUNDED`, transaction: updated });
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

