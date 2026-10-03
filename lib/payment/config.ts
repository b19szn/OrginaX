import { prisma } from "@/lib/prisma";
import { PaymentGatewayType, GatewayCredentials } from "./types";
import { ensureAdminDefaults } from "@/lib/admin/defaults";

export async function getGatewayCredentials(gatewayType: PaymentGatewayType): Promise<GatewayCredentials> {
  await ensureAdminDefaults();

  const config = await prisma.paymentGatewayConfig.findFirst({
    where: { gateway: gatewayType as any },
  });

  // 1. Check environment variables
  let envPublic: string | null = null;
  let envSecret: string | null = null;
  let envWebhook: string | null = null;

  if (gatewayType === "STRIPE") {
    envPublic = process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null;
    envSecret = process.env.STRIPE_SECRET_KEY || null;
    envWebhook = process.env.STRIPE_WEBHOOK_SECRET || null;
  } else if (gatewayType === "LEMON_SQUEEZY") {
    envPublic = process.env.LEMON_SQUEEZY_STORE_ID || null;
    envSecret = process.env.LEMON_SQUEEZY_API_KEY || null;
    envWebhook = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || null;
  } else if (gatewayType === "SSLCOMMERZ") {
    envPublic = process.env.SSLCOMMERZ_STORE_ID || null;
    envSecret = process.env.SSLCOMMERZ_STORE_PASSWD || null;
    envWebhook = null;
  }

  // 2. Check encrypted/secure settings in AdminSetting table
  const [dbSecret, dbWebhook, dbPublic] = await Promise.all([
    prisma.adminSetting.findUnique({ where: { key: `gateway_secret_${gatewayType}` } }),
    prisma.adminSetting.findUnique({ where: { key: `gateway_webhook_${gatewayType}` } }),
    prisma.adminSetting.findUnique({ where: { key: `gateway_public_${gatewayType}` } }),
  ]);

  const publicKey = envPublic || dbPublic?.value || config?.publicKey || null;
  const secretKey = envSecret || dbSecret?.value || null;
  const webhookSecret = envWebhook || dbWebhook?.value || null;

  return {
    gateway: gatewayType,
    publicKey,
    secretKey,
    webhookSecret,
    isLiveMode: config?.isLiveMode ?? false,
    isEnabled: config?.isEnabled ?? false,
  };
}

export async function saveGatewayCredentials(
  gatewayType: PaymentGatewayType,
  data: {
    publicKey?: string;
    secretKey?: string;
    webhookSecret?: string;
    isLiveMode?: boolean;
    isEnabled?: boolean;
  }
) {
  // Update secure AdminSettings if provided
  if (data.secretKey && data.secretKey.trim()) {
    await prisma.adminSetting.upsert({
      where: { key: `gateway_secret_${gatewayType}` },
      update: { value: data.secretKey.trim() },
      create: { key: `gateway_secret_${gatewayType}`, value: data.secretKey.trim(), description: `${gatewayType} Secret Key` },
    });
  }

  if (data.webhookSecret && data.webhookSecret.trim()) {
    await prisma.adminSetting.upsert({
      where: { key: `gateway_webhook_${gatewayType}` },
      update: { value: data.webhookSecret.trim() },
      create: { key: `gateway_webhook_${gatewayType}`, value: data.webhookSecret.trim(), description: `${gatewayType} Webhook Secret` },
    });
  }

  if (data.publicKey && data.publicKey.trim()) {
    await prisma.adminSetting.upsert({
      where: { key: `gateway_public_${gatewayType}` },
      update: { value: data.publicKey.trim() },
      create: { key: `gateway_public_${gatewayType}`, value: data.publicKey.trim(), description: `${gatewayType} Public Key` },
    });
  }

  // Update PaymentGatewayConfig with masked values for zero-knowledge safety
  const updateData: any = {};
  if (typeof data.isEnabled === "boolean") updateData.isEnabled = data.isEnabled;
  if (typeof data.isLiveMode === "boolean") updateData.isLiveMode = data.isLiveMode;
  if (data.publicKey) updateData.publicKey = data.publicKey.trim();

  if (data.secretKey && data.secretKey.trim()) {
    const trimmed = data.secretKey.trim();
    updateData.secretKeyMasked = trimmed.length > 8
      ? `${trimmed.slice(0, 6)}••••••••${trimmed.slice(-4)}`
      : "••••••••";
  }

  if (data.webhookSecret && data.webhookSecret.trim()) {
    const trimmed = data.webhookSecret.trim();
    updateData.webhookSecretMasked = trimmed.length > 8
      ? `${trimmed.slice(0, 6)}••••••••${trimmed.slice(-4)}`
      : "••••••••";
  }

  const updated = await prisma.paymentGatewayConfig.updateMany({
    where: { gateway: gatewayType as any },
    data: updateData,
  });

  return updated;
}

export async function getEnabledGateways() {
  await ensureAdminDefaults();
  const configs = await prisma.paymentGatewayConfig.findMany({
    where: { isEnabled: true },
    orderBy: { gateway: "asc" },
  });
  return configs;
}
