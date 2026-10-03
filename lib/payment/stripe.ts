import crypto from "crypto";
import { GatewayCredentials, GatewayConnectionTestResult } from "./types";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export async function createStripeSession(
  creds: GatewayCredentials,
  params: {
    invoiceId: string;
    userId: string;
    userEmail: string;
    planName: string;
    planCode: string;
    amountCents: number;
    currency: string;
    returnUrl: string;
    cancelUrl: string;
  }
): Promise<{ success: boolean; checkoutUrl?: string; sessionId?: string; error?: string }> {
  if (!creds.secretKey || creds.secretKey.includes("••••")) {
    return {
      success: false,
      error: "Stripe secret API key is not configured. Please set it in Admin Console or environment.",
    };
  }

  try {
    const bodyParams = new URLSearchParams();
    bodyParams.append("payment_method_types[0]", "card");
    bodyParams.append("mode", "payment");
    bodyParams.append("customer_email", params.userEmail);
    bodyParams.append("client_reference_id", params.userId);
    bodyParams.append("success_url", `${params.returnUrl}?session_id={CHECKOUT_SESSION_ID}&invoiceId=${params.invoiceId}&gateway=STRIPE`);
    bodyParams.append("cancel_url", `${params.cancelUrl}?invoiceId=${params.invoiceId}&gateway=STRIPE`);

    bodyParams.append("line_items[0][price_data][currency]", params.currency.toLowerCase());
    bodyParams.append("line_items[0][price_data][unit_amount]", params.amountCents.toString());
    bodyParams.append("line_items[0][price_data][product_data][name]", `OriginaX ${params.planName} Subscription`);
    bodyParams.append("line_items[0][price_data][product_data][description]", `Multi-Modal Plagiarism Detection Platform - ${params.planCode} Plan`);
    bodyParams.append("line_items[0][quantity]", "1");

    bodyParams.append("metadata[invoiceId]", params.invoiceId);
    bodyParams.append("metadata[userId]", params.userId);
    bodyParams.append("metadata[planCode]", params.planCode);

    const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.secretKey.trim()}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("Stripe Checkout Session error:", data.error);
      return {
        success: false,
        error: data.error?.message || "Stripe checkout session creation failed.",
      };
    }

    return {
      success: true,
      checkoutUrl: data.url,
      sessionId: data.id,
    };
  } catch (err: any) {
    console.error("Stripe network error:", err);
    return { success: false, error: err.message || "Failed to reach Stripe API" };
  }
}

export async function verifyStripeSession(
  creds: GatewayCredentials,
  sessionId: string
): Promise<{ verified: boolean; paid: boolean; metadata?: Record<string, string>; error?: string }> {
  if (!creds.secretKey) {
    return { verified: false, paid: false, error: "Stripe Secret key missing" };
  }

  try {
    const res = await fetch(`${STRIPE_API_BASE}/checkout/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${creds.secretKey.trim()}`,
      },
    });

    const session = await res.json();
    if (!res.ok || session.error) {
      return { verified: false, paid: false, error: session.error?.message };
    }

    const isPaid = session.payment_status === "paid" || session.status === "complete";
    return {
      verified: true,
      paid: isPaid,
      metadata: session.metadata,
    };
  } catch (err: any) {
    return { verified: false, paid: false, error: err.message };
  }
}

export function verifyStripeWebhookSignature(
  rawBody: string,
  sigHeader: string,
  webhookSecret: string,
  toleranceSec = 300
): { isValid: boolean; event?: any; error?: string } {
  try {
    const parts = sigHeader.split(",");
    let timestamp = "";
    const signatures: string[] = [];

    for (const part of parts) {
      const [k, v] = part.trim().split("=");
      if (k === "t") timestamp = v;
      if (k === "v1") signatures.push(v);
    }

    if (!timestamp || signatures.length === 0) {
      return { isValid: false, error: "Invalid stripe-signature header structure" };
    }

    const eventTime = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - eventTime) > toleranceSec) {
      return { isValid: false, error: "Webhook timestamp outside allowed tolerance" };
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto.createHmac("sha256", webhookSecret.trim()).update(signedPayload).digest("hex");

    const matches = signatures.some((sig) => {
      try {
        return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"));
      } catch {
        return false;
      }
    });

    if (!matches) {
      return { isValid: false, error: "Signature verification failed" };
    }

    const event = JSON.parse(rawBody);
    return { isValid: true, event };
  } catch (err: any) {
    return { isValid: false, error: err.message };
  }
}

export async function testStripeConnection(creds: GatewayCredentials): Promise<GatewayConnectionTestResult> {
  const start = Date.now();
  if (!creds.secretKey || creds.secretKey.includes("••••")) {
    return {
      gateway: "STRIPE",
      success: false,
      isLiveMode: creds.isLiveMode,
      latencyMs: 0,
      message: "Secret API Key is missing or masked. Please enter a valid Stripe secret key.",
    };
  }

  try {
    const res = await fetch(`${STRIPE_API_BASE}/balance`, {
      headers: {
        Authorization: `Bearer ${creds.secretKey.trim()}`,
      },
    });

    const latencyMs = Date.now() - start;
    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        gateway: "STRIPE",
        success: false,
        isLiveMode: creds.isLiveMode,
        latencyMs,
        message: data.error?.message || "Authentication rejected by Stripe.",
      };
    }

    const availableCurrencies = data.available?.map((b: any) => b.currency.toUpperCase()).join(", ") || "USD";
    return {
      gateway: "STRIPE",
      success: true,
      isLiveMode: creds.secretKey.startsWith("sk_live_"),
      latencyMs,
      message: `Connected successfully to Stripe (${creds.secretKey.startsWith("sk_live_") ? "Live" : "Test"}). Supported currencies: ${availableCurrencies}`,
      details: {
        livemode: data.livemode,
        currencies: availableCurrencies,
      },
    };
  } catch (err: any) {
    return {
      gateway: "STRIPE",
      success: false,
      isLiveMode: creds.isLiveMode,
      latencyMs: Date.now() - start,
      message: `Failed to connect to Stripe: ${err.message}`,
    };
  }
}
