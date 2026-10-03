export type PaymentGatewayType = "STRIPE" | "LEMON_SQUEEZY" | "SSLCOMMERZ" | "MANUAL" | "SANDBOX";

export type PlanCode = "FREE" | "PRO" | "TEAM" | "ENTERPRISE" | "ACADEMIC";

export type BillingPeriod = "monthly" | "yearly";

export interface CheckoutRequest {
  userId: string;
  userEmail: string;
  userName?: string;
  planCode: string;
  billingPeriod?: BillingPeriod;
  gatewayChoice?: PaymentGatewayType | "AUTO";
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl?: string;
  invoiceId?: string;
  gateway?: PaymentGatewayType;
  amountCents?: number;
  currency?: string;
  isTestMode?: boolean;
  sessionId?: string;
  error?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: "SUCCEEDED" | "PENDING" | "FAILED" | "CANCELLED";
  invoiceId: string;
  userId?: string;
  amountCents?: number;
  currency?: string;
  gateway: PaymentGatewayType;
  planCode?: string;
  externalTransactionId?: string;
  message?: string;
}

export interface GatewayCredentials {
  gateway: PaymentGatewayType;
  publicKey: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
  isLiveMode: boolean;
  isEnabled: boolean;
}

export interface GatewayConnectionTestResult {
  gateway: PaymentGatewayType;
  success: boolean;
  isLiveMode: boolean;
  latencyMs: number;
  message: string;
  details?: Record<string, any>;
}
