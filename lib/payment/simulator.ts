import { prisma } from "@/lib/prisma";
import { PaymentGatewayType } from "./types";

export interface SimulatorSession {
  invoiceId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  planName: string;
  planCode: string;
  amountCents: number;
  currency: string;
  gateway: PaymentGatewayType;
  returnUrl: string;
}

export function generateSimulatorUrl(session: SimulatorSession): string {
  const params = new URLSearchParams({
    invoiceId: session.invoiceId,
    userId: session.userId,
    email: session.userEmail,
    plan: session.planCode,
    name: session.planName,
    amount: session.amountCents.toString(),
    currency: session.currency,
    gateway: session.gateway,
    returnUrl: session.returnUrl,
  });

  return `/payment/simulator?${params.toString()}`;
}
