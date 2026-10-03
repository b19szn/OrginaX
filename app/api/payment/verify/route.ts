import { NextResponse } from "next/server";
import { completePayment } from "@/lib/payment/service";
import { getGatewayCredentials } from "@/lib/payment/config";
import { verifyStripeSession } from "@/lib/payment/stripe";
import { validateSSLCommerzPayment } from "@/lib/payment/sslcommerz";
import { PaymentGatewayType } from "@/lib/payment/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");
    const gateway = (searchParams.get("gateway") || "STRIPE") as PaymentGatewayType;
    const sessionId = searchParams.get("session_id");
    const valId = searchParams.get("val_id");

    if (!invoiceId) {
      return NextResponse.json({ success: false, error: "Invoice ID required" }, { status: 400 });
    }

    // Verify with provider if real live session
    if (gateway === "STRIPE" && sessionId && !sessionId.startsWith("sim_")) {
      const creds = await getGatewayCredentials("STRIPE");
      const stripeCheck = await verifyStripeSession(creds, sessionId);
      if (!stripeCheck.paid) {
        return NextResponse.json({
          success: false,
          status: "PENDING",
          message: "Payment is still processing with Stripe",
        });
      }
    } else if (gateway === "SSLCOMMERZ" && valId) {
      const creds = await getGatewayCredentials("SSLCOMMERZ");
      const sslCheck = await validateSSLCommerzPayment(creds, valId);
      if (!sslCheck.paid) {
        return NextResponse.json({
          success: false,
          status: "FAILED",
          message: "SSLCommerz validation failed",
        });
      }
    }

    // Complete payment in our system
    const result = await completePayment({
      invoiceId,
      gateway,
      externalTransactionId: sessionId || valId || undefined,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to verify payment" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, gateway, externalTransactionId, planCode } = body;

    if (!invoiceId) {
      return NextResponse.json({ success: false, error: "Invoice ID is required" }, { status: 400 });
    }

    const result = await completePayment({
      invoiceId,
      gateway: gateway as PaymentGatewayType,
      externalTransactionId,
      planCode,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to confirm payment" }, { status: 500 });
  }
}
