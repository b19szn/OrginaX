import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminDefaults } from "@/lib/admin/defaults";

export async function GET() {
  try {
    await ensureAdminDefaults();
    const settings = await prisma.adminSetting.findMany();

    const configMap: Record<string, string> = {};
    for (const s of settings) {
      configMap[s.key] = s.value;
    }

    const mockWebhookDeliveries = [
      { id: "wh_log_881", event: "TASK_COLLUSION_ALERT", destination: "Slack Security Webhook", statusCode: 200, latencyMs: 142, timestamp: "2026-09-24T09:12:00Z", status: "DELIVERED" },
      { id: "wh_log_882", event: "BILLING_SUBSCRIPTION_RENEWAL", destination: "Stripe Webhook Relay", statusCode: 200, latencyMs: 88, timestamp: "2026-09-24T08:44:00Z", status: "DELIVERED" },
      { id: "wh_log_883", event: "PROVIDER_LATENCY_SPIKE", destination: "OpsGenie Pager", statusCode: 200, latencyMs: 215, timestamp: "2026-09-24T06:19:00Z", status: "DELIVERED" },
      { id: "wh_log_884", event: "SANDBOX_VERIFICATION_TEST", destination: "Internal Datadog Relay", statusCode: 200, latencyMs: 64, timestamp: "2026-09-24T05:01:00Z", status: "DELIVERED" },
    ];

    return NextResponse.json({
      success: true,
      settings: configMap,
      webhookDeliveries: mockWebhookDeliveries,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to load telemetry settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: "Missing setting key" }, { status: 400 });
    }

    const updated = await prisma.adminSetting.upsert({
      where: { key },
      update: { value: value || "", updatedAt: new Date() },
      create: { key, value: value || "", description: `Configured via Admin Telemetry Hub` },
    });

    return NextResponse.json({ success: true, message: `Setting "${key}" saved successfully`, setting: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Telemetry update failed" }, { status: 500 });
  }
}
