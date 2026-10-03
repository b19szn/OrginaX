import { NextResponse } from "next/server";
import { getGatewayCredentials } from "@/lib/payment/config";
import { verifyStripeWebhookSignature } from "@/lib/payment/stripe";
import { verifyLemonSqueezyWebhook } from "@/lib/payment/lemonsqueezy";
import { completePayment } from "@/lib/payment/service";
import { PaymentGatewayType } from "@/lib/payment/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { gateway: string } }
) {
  const gateway = params.gateway.toUpperCase() as PaymentGatewayType;

  try {
    const rawBody = await req.text();
    const creds = await getGatewayCredentials(gateway);

    // 1. STRIPE WEBHOOK
    if (gateway === "STRIPE") {
      const sigHeader = req.headers.get("stripe-signature");

      if (creds.webhookSecret && sigHeader && !creds.webhookSecret.includes("••••")) {
        const check = verifyStripeWebhookSignature(rawBody, sigHeader, creds.webhookSecret);
        if (!check.isValid) {
          return NextResponse.json({ error: check.error || "Invalid signature" }, { status: 400 });
        }
      }

      const event = JSON.parse(rawBody);
      if (
        event.type === "checkout.session.completed" ||
        event.type === "payment_intent.succeeded" ||
        event.type === "invoice.payment_succeeded"
      ) {
        const obj = event.data?.object || {};
        const invoiceId = obj.metadata?.invoiceId || obj.client_reference_id;
        if (invoiceId) {
          await completePayment({
            invoiceId,
            gateway: "STRIPE",
            externalTransactionId: obj.id,
            planCode: obj.metadata?.planCode,
          });
        }
      }

      return NextResponse.json({ received: true });
    }

    // 2. LEMON SQUEEZY WEBHOOK
    if (gateway === "LEMON_SQUEEZY") {
      const sigHeader = req.headers.get("x-signature");

      if (creds.webhookSecret && sigHeader && !creds.webhookSecret.includes("••••")) {
        const check = verifyLemonSqueezyWebhook(rawBody, sigHeader, creds.webhookSecret);
        if (!check.isValid) {
          return NextResponse.json({ error: check.error || "Invalid signature" }, { status: 400 });
        }
      }

      const event = JSON.parse(rawBody);
      const eventName = event.meta?.event_name;
      if (eventName === "order_created" || eventName === "subscription_created") {
        const customData = event.meta?.custom_data || {};
        const invoiceId = customData.invoice_id;
        if (invoiceId) {
          await completePayment({
            invoiceId,
            gateway: "LEMON_SQUEEZY",
            externalTransactionId: event.data?.id,
            planCode: customData.plan_code,
          });
        }
      }

      return NextResponse.json({ received: true });
    }

    // 3. SSLCOMMERZ IPN
    if (gateway === "SSLCOMMERZ") {
      let payload: any = {};
      try {
        payload = JSON.parse(rawBody);
      } catch {
        const urlParams = new URLSearchParams(rawBody);
        payload = Object.fromEntries(urlParams.entries());
      }

      const invoiceId = payload.tran_id;
      const status = payload.status;

      if (invoiceId && (status === "VALID" || status === "VALIDATED")) {
        await completePayment({
          invoiceId,
          gateway: "SSLCOMMERZ",
          externalTransactionId: payload.val_id,
        });
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ error: "Unknown gateway" }, { status: 400 });
  } catch (error: any) {
    console.error("Webhook processing failure:", error);
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
