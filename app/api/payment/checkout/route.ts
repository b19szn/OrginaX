import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createCheckout } from "@/lib/payment/service";
import { PaymentGatewayType } from "@/lib/payment/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json().catch(() => ({}));

    const userId = user?.id || body.userId || `guest_${Date.now()}`;
    const userEmail = user?.email || body.userEmail || "investigator@campus.edu";
    const userName = user?.name || body.userName || "OriginaX Investigator";

    const planCode = body.planCode || "PRO";
    const billingPeriod = body.billingPeriod || "monthly";
    const gatewayChoice = (body.gatewayChoice || "AUTO") as PaymentGatewayType | "AUTO";

    // Extract protocol & host to build absolute URLs
    const origin = req.headers.get("origin") || req.headers.get("referer")
      ? new URL(req.headers.get("origin") || req.headers.get("referer")!).origin
      : "http://localhost:3000";

    const result = await createCheckout(
      {
        userId,
        userEmail,
        userName,
        planCode,
        billingPeriod,
        gatewayChoice,
        returnUrl: `${origin}/payment/success`,
        cancelUrl: `${origin}/payment/cancel`,
      },
      origin
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "Failed to create checkout session" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      invoiceId: result.invoiceId,
      gateway: result.gateway,
      amountCents: result.amountCents,
      currency: result.currency,
      isTestMode: result.isTestMode,
    });
  } catch (error: any) {
    console.error("Payment checkout API error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 });
  }
}
