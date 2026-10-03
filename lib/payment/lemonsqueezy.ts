import crypto from "crypto";
import { GatewayCredentials, GatewayConnectionTestResult } from "./types";

const LEMON_API_BASE = "https://api.lemonsqueezy.com/v1";

export async function createLemonSqueezyCheckout(
  creds: GatewayCredentials,
  params: {
    invoiceId: string;
    userId: string;
    userEmail: string;
    userName?: string;
    planName: string;
    planCode: string;
    amountCents: number;
    currency: string;
    returnUrl: string;
  }
): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  if (!creds.secretKey || creds.secretKey.includes("••••")) {
    return {
      success: false,
      error: "Lemon Squeezy API key is not configured.",
    };
  }

  const storeId = creds.publicKey;
  if (!storeId || storeId.includes("••••")) {
    return {
      success: false,
      error: "Lemon Squeezy Store ID is required. Please set it in Public Key field.",
    };
  }

  try {
    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          custom_price: params.amountCents,
          checkout_data: {
            email: params.userEmail,
            name: params.userName || undefined,
            custom: {
              invoice_id: params.invoiceId,
              user_id: params.userId,
              plan_code: params.planCode,
            },
          },
          product_options: {
            name: `OriginaX ${params.planName}`,
            description: `Plagiarism Detection Subscription - ${params.planCode}`,
            redirect_url: `${params.returnUrl}?invoiceId=${params.invoiceId}&gateway=LEMON_SQUEEZY`,
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: storeId.trim(),
            },
          },
        },
      },
    };

    const res = await fetch(`${LEMON_API_BASE}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.secretKey.trim()}`,
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.errors) {
      console.error("Lemon Squeezy error:", data.errors);
      return {
        success: false,
        error: data.errors?.[0]?.detail || "Lemon Squeezy checkout creation failed",
      };
    }

    const checkoutUrl = data.data?.attributes?.url;
    return {
      success: true,
      checkoutUrl,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reach Lemon Squeezy" };
  }
}

export function verifyLemonSqueezyWebhook(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
): { isValid: boolean; event?: any; error?: string } {
  try {
    const expectedSig = crypto.createHmac("sha256", webhookSecret.trim()).update(rawBody).digest("hex");
    const matches = crypto.timingSafeEqual(Buffer.from(signatureHeader, "hex"), Buffer.from(expectedSig, "hex"));

    if (!matches) {
      return { isValid: false, error: "Lemon Squeezy webhook signature mismatch" };
    }

    const event = JSON.parse(rawBody);
    return { isValid: true, event };
  } catch (err: any) {
    return { isValid: false, error: err.message };
  }
}

export async function testLemonSqueezyConnection(creds: GatewayCredentials): Promise<GatewayConnectionTestResult> {
  const start = Date.now();
  if (!creds.secretKey || creds.secretKey.includes("••••")) {
    return {
      gateway: "LEMON_SQUEEZY",
      success: false,
      isLiveMode: creds.isLiveMode,
      latencyMs: 0,
      message: "API Key is missing or masked. Please enter a valid Lemon Squeezy API key.",
    };
  }

  try {
    const res = await fetch(`${LEMON_API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${creds.secretKey.trim()}`,
        Accept: "application/vnd.api+json",
      },
    });

    const latencyMs = Date.now() - start;
    const data = await res.json();

    if (!res.ok || data.errors) {
      return {
        gateway: "LEMON_SQUEEZY",
        success: false,
        isLiveMode: creds.isLiveMode,
        latencyMs,
        message: data.errors?.[0]?.detail || "Authentication rejected by Lemon Squeezy.",
      };
    }

    const userName = data.data?.attributes?.name || "Merchant";
    const userEmail = data.data?.attributes?.email || "";

    return {
      gateway: "LEMON_SQUEEZY",
      success: true,
      isLiveMode: creds.isLiveMode,
      latencyMs,
      message: `Connected successfully to Lemon Squeezy account: ${userName} (${userEmail})`,
      details: {
        userName,
        userEmail,
      },
    };
  } catch (err: any) {
    return {
      gateway: "LEMON_SQUEEZY",
      success: false,
      isLiveMode: creds.isLiveMode,
      latencyMs: Date.now() - start,
      message: `Failed to reach Lemon Squeezy: ${err.message}`,
    };
  }
}
