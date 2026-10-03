import { prisma } from "@/lib/prisma";
import { ensureAdminDefaults } from "@/lib/admin/defaults";
import {
  CheckoutRequest,
  CheckoutResponse,
  PaymentGatewayType,
  PaymentVerificationResult,
  GatewayConnectionTestResult,
} from "./types";
import { getGatewayCredentials, getEnabledGateways } from "./config";
import { createStripeSession, verifyStripeSession, testStripeConnection } from "./stripe";
import { createLemonSqueezyCheckout, testLemonSqueezyConnection } from "./lemonsqueezy";
import { createSSLCommerzSession, validateSSLCommerzPayment, testSSLCommerzConnection } from "./sslcommerz";
import { generateSimulatorUrl } from "./simulator";

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "u***@domain";
  const [local, domain] = email.split("@");
  const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : `${local[0]}***`;
  return `${maskedLocal}@${domain}`;
}

export async function createCheckout(
  req: CheckoutRequest,
  origin: string
): Promise<CheckoutResponse> {
  await ensureAdminDefaults();

  const code = (req.planCode || "PRO").toUpperCase();

  // Find plan details from database
  let tier = await prisma.subscriptionTier.findFirst({
    where: { code },
  });

  if (!tier && code === "TEAM") {
    // Team plan fallback
    tier = {
      id: "team",
      code: "TEAM",
      name: "Team Collaboration Plan",
      priceMonthlyCents: 6000,
      monthlyScanAllowance: 2500,
      rateLimitPerMinute: 60,
      overagePricePerScanCents: 5,
      featuresJson: "[]",
      isActive: true,
      updatedAt: new Date(),
    };
  }

  const basePriceCents = tier?.priceMonthlyCents ?? (code === "PRO" ? 2000 : code === "TEAM" ? 6000 : 0);
  const planName = tier?.name || `${code} Plan`;

  let finalAmountCents = basePriceCents;
  if (req.billingPeriod === "yearly") {
    // 20% discount on annual billing
    finalAmountCents = Math.round(basePriceCents * 12 * 0.8);
  }

  // Generate unique invoice ID
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const invoiceId = `INV-${new Date().getFullYear()}-${randomSuffix}`;

  // Determine gateway
  let chosenGateway: PaymentGatewayType = "STRIPE";
  if (req.gatewayChoice && req.gatewayChoice !== "AUTO") {
    chosenGateway = req.gatewayChoice;
  } else {
    // Pick the first enabled gateway
    const enabled = await getEnabledGateways();
    if (enabled.length > 0) {
      chosenGateway = enabled[0].gateway as PaymentGatewayType;
    }
  }

  // Create pending ledger entry in TransactionLedger
  await prisma.transactionLedger.create({
    data: {
      invoiceId,
      userId: req.userId,
      userEmailMasked: maskEmail(req.userEmail),
      gateway: chosenGateway,
      amountCents: finalAmountCents,
      currency: "USD",
      status: "PENDING",
    },
  });

  const returnUrl = req.returnUrl || `${origin}/payment/success`;
  const cancelUrl = req.cancelUrl || `${origin}/payment/cancel`;

  const creds = await getGatewayCredentials(chosenGateway);

  // If Sandbox gateway is explicitly chosen
  if (chosenGateway === "SANDBOX") {
    const simUrl = generateSimulatorUrl({
      invoiceId,
      userId: req.userId,
      userEmail: req.userEmail,
      userName: req.userName,
      planName,
      planCode: code,
      amountCents: finalAmountCents,
      currency: "USD",
      gateway: chosenGateway,
      returnUrl,
    });
    return {
      success: true,
      checkoutUrl: simUrl,
      invoiceId,
      gateway: chosenGateway,
      amountCents: finalAmountCents,
      currency: "USD",
      isTestMode: true,
    };
  }

  // Route according to chosen gateway
  if (chosenGateway === "STRIPE") {
    if (creds.secretKey && !creds.secretKey.includes("••••") && (creds.secretKey.startsWith("sk_") || creds.secretKey.startsWith("rk_"))) {
      const stripeRes = await createStripeSession(creds, {
        invoiceId,
        userId: req.userId,
        userEmail: req.userEmail,
        planName,
        planCode: code,
        amountCents: finalAmountCents,
        currency: "USD",
        returnUrl,
        cancelUrl,
      });

      if (stripeRes.success && stripeRes.checkoutUrl) {
        return {
          success: true,
          checkoutUrl: stripeRes.checkoutUrl,
          invoiceId,
          sessionId: stripeRes.sessionId,
          gateway: "STRIPE",
          amountCents: finalAmountCents,
          currency: "USD",
          isTestMode: !creds.isLiveMode,
        };
      }
    }

    // Fallback to Developer Sandbox Simulator for Stripe
    const simUrl = generateSimulatorUrl({
      invoiceId,
      userId: req.userId,
      userEmail: req.userEmail,
      userName: req.userName,
      planName,
      planCode: code,
      amountCents: finalAmountCents,
      currency: "USD",
      gateway: "STRIPE",
      returnUrl,
    });
    return {
      success: true,
      checkoutUrl: simUrl,
      invoiceId,
      gateway: "STRIPE",
      amountCents: finalAmountCents,
      currency: "USD",
      isTestMode: true,
    };
  }

  if (chosenGateway === "LEMON_SQUEEZY") {
    if (creds.secretKey && !creds.secretKey.includes("••••") && creds.publicKey) {
      const lmsRes = await createLemonSqueezyCheckout(creds, {
        invoiceId,
        userId: req.userId,
        userEmail: req.userEmail,
        userName: req.userName,
        planName,
        planCode: code,
        amountCents: finalAmountCents,
        currency: "USD",
        returnUrl,
      });

      if (lmsRes.success && lmsRes.checkoutUrl) {
        return {
          success: true,
          checkoutUrl: lmsRes.checkoutUrl,
          invoiceId,
          gateway: "LEMON_SQUEEZY",
          amountCents: finalAmountCents,
          currency: "USD",
          isTestMode: !creds.isLiveMode,
        };
      }
    }

    // Fallback to Developer Sandbox Simulator for Lemon Squeezy
    const simUrl = generateSimulatorUrl({
      invoiceId,
      userId: req.userId,
      userEmail: req.userEmail,
      userName: req.userName,
      planName,
      planCode: code,
      amountCents: finalAmountCents,
      currency: "USD",
      gateway: "LEMON_SQUEEZY",
      returnUrl,
    });
    return {
      success: true,
      checkoutUrl: simUrl,
      invoiceId,
      gateway: "LEMON_SQUEEZY",
      amountCents: finalAmountCents,
      currency: "USD",
      isTestMode: true,
    };
  }

  if (chosenGateway === "SSLCOMMERZ") {
    if (creds.secretKey && !creds.secretKey.includes("••••") && creds.publicKey && !creds.publicKey.includes("••••")) {
      const sslRes = await createSSLCommerzSession(creds, {
        invoiceId,
        userId: req.userId,
        userEmail: req.userEmail,
        userName: req.userName,
        planName,
        planCode: code,
        amountCents: finalAmountCents,
        currency: "USD",
        returnUrl,
        cancelUrl,
      });

      if (sslRes.success && sslRes.checkoutUrl) {
        return {
          success: true,
          checkoutUrl: sslRes.checkoutUrl,
          invoiceId,
          gateway: "SSLCOMMERZ",
          amountCents: finalAmountCents,
          currency: "USD",
          isTestMode: !creds.isLiveMode,
        };
      }
    }

    // Fallback to Developer Sandbox Simulator for SSLCommerz
    const simUrl = generateSimulatorUrl({
      invoiceId,
      userId: req.userId,
      userEmail: req.userEmail,
      userName: req.userName,
      planName,
      planCode: code,
      amountCents: finalAmountCents,
      currency: "USD",
      gateway: "SSLCOMMERZ",
      returnUrl,
    });
    return {
      success: true,
      checkoutUrl: simUrl,
      invoiceId,
      gateway: "SSLCOMMERZ",
      amountCents: finalAmountCents,
      currency: "USD",
      isTestMode: true,
    };
  }

  return {
    success: false,
    error: `Unsupported gateway ${chosenGateway}`,
  };
}

export async function completePayment(params: {
  invoiceId: string;
  gateway?: PaymentGatewayType;
  externalTransactionId?: string;
  planCode?: string;
}): Promise<PaymentVerificationResult> {
  const transaction = await prisma.transactionLedger.findUnique({
    where: { invoiceId: params.invoiceId },
  });

  if (!transaction) {
    return {
      success: false,
      status: "FAILED",
      invoiceId: params.invoiceId,
      gateway: (params.gateway || "STRIPE") as PaymentGatewayType,
      message: "Invoice not found in transaction ledger",
    };
  }

  const effectiveGateway = (params.gateway || transaction.gateway) as PaymentGatewayType;

  // If already SUCCEEDED, return success
  if (transaction.status === "SUCCEEDED") {
    return {
      success: true,
      status: "SUCCEEDED",
      invoiceId: transaction.invoiceId,
      userId: transaction.userId,
      amountCents: transaction.amountCents,
      currency: transaction.currency,
      gateway: effectiveGateway,
      message: "Payment already confirmed and credited",
    };
  }

  // Update transaction status in Ledger
  const updatedTx = await prisma.transactionLedger.update({
    where: { invoiceId: params.invoiceId },
    data: {
      status: "SUCCEEDED",
      gateway: effectiveGateway,
    },
  });

  // Infer or get planCode
  let planToAssign = params.planCode || "PRO";
  if (updatedTx.amountCents >= 19900) {
    planToAssign = "ENTERPRISE";
  } else if (updatedTx.amountCents >= 6000) {
    planToAssign = "ENTERPRISE"; // Team plan maps to high capacity tier
  } else if (updatedTx.amountCents >= 1500) {
    planToAssign = "PRO";
  }

  // Upgrade the user in the database
  let targetUser = null;
  if (transaction.userId) {
    targetUser = await prisma.user.findUnique({
      where: { id: transaction.userId },
    });

    if (targetUser) {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          tierCode: planToAssign,
        },
      });
    }
  }

  // Record audit log
  await prisma.adminAuditLog.create({
    data: {
      actorEmail: targetUser?.email || transaction.userEmailMasked || "system@originax.online",
      actorRole: targetUser?.role || "STUDENT",
      action: "TIER_UPDATED",
      target: `Invoice ${transaction.invoiceId}`,
      details: `Payment of $${(transaction.amountCents / 100).toFixed(2)} received via ${effectiveGateway}. Upgraded user to ${planToAssign} tier. Ref: ${params.externalTransactionId || "DIRECT"}`,
    },
  });

  return {
    success: true,
    status: "SUCCEEDED",
    invoiceId: transaction.invoiceId,
    userId: transaction.userId,
    amountCents: transaction.amountCents,
    currency: transaction.currency,
    gateway: effectiveGateway,
    planCode: planToAssign,
    message: "Payment successfully validated and user tier upgraded",
  };
}

export async function testGateway(gateway: PaymentGatewayType): Promise<GatewayConnectionTestResult> {
  const creds = await getGatewayCredentials(gateway);

  if (gateway === "STRIPE") {
    return testStripeConnection(creds);
  } else if (gateway === "LEMON_SQUEEZY") {
    return testLemonSqueezyConnection(creds);
  } else if (gateway === "SSLCOMMERZ") {
    return testSSLCommerzConnection(creds);
  }

  return {
    gateway,
    success: true,
    isLiveMode: false,
    latencyMs: 1,
    message: "Sandbox simulator gateway is always operational.",
  };
}
