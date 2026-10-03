import { GatewayCredentials, GatewayConnectionTestResult } from "./types";

export async function createSSLCommerzSession(
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
    cancelUrl: string;
  }
): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  const storeId = creds.publicKey;
  const storePasswd = creds.secretKey;

  if (!storeId || storeId.includes("••••") || !storePasswd || storePasswd.includes("••••")) {
    return {
      success: false,
      error: "SSLCommerz Store ID or Store Password not properly configured.",
    };
  }

  const endpoint = creds.isLiveMode
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

  try {
    const postData = new URLSearchParams({
      store_id: storeId.trim(),
      store_passwd: storePasswd.trim(),
      total_amount: (params.amountCents / 100).toFixed(2),
      currency: params.currency === "BDT" ? "BDT" : "USD",
      tran_id: params.invoiceId,
      success_url: `${params.returnUrl}?gateway=SSLCOMMERZ&invoiceId=${params.invoiceId}`,
      fail_url: `${params.cancelUrl}?gateway=SSLCOMMERZ&invoiceId=${params.invoiceId}&status=failed`,
      cancel_url: `${params.cancelUrl}?gateway=SSLCOMMERZ&invoiceId=${params.invoiceId}&status=cancelled`,
      ipn_url: `${params.returnUrl.replace("/payment/success", "/api/payment/webhook/sslcommerz")}`,
      cus_name: params.userName || "OriginaX Customer",
      cus_email: params.userEmail,
      cus_add1: "Academic Campus",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
      shipping_method: "NO",
      product_name: `OriginaX ${params.planName}`,
      product_category: "Software Subscription",
      product_profile: "non-physical-goods",
    });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: postData.toString(),
    });

    const data = await res.json();
    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return {
        success: true,
        checkoutUrl: data.GatewayPageURL,
      };
    }

    return {
      success: false,
      error: data.failedreason || "Failed to initiate SSLCommerz session",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error contacting SSLCommerz" };
  }
}

export async function validateSSLCommerzPayment(
  creds: GatewayCredentials,
  valId: string
): Promise<{ verified: boolean; paid: boolean; error?: string }> {
  const storeId = creds.publicKey;
  const storePasswd = creds.secretKey;

  const endpoint = creds.isLiveMode
    ? `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(storeId || "")}&store_passwd=${encodeURIComponent(storePasswd || "")}&v=1&format=json`
    : `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(storeId || "")}&store_passwd=${encodeURIComponent(storePasswd || "")}&v=1&format=json`;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.status === "VALID" || data.status === "VALIDATED") {
      return { verified: true, paid: true };
    }
    return { verified: false, paid: false, error: data.status || "Validation unsuccessful" };
  } catch (err: any) {
    return { verified: false, paid: false, error: err.message };
  }
}

export async function testSSLCommerzConnection(creds: GatewayCredentials): Promise<GatewayConnectionTestResult> {
  const start = Date.now();
  const storeId = creds.publicKey;
  const storePasswd = creds.secretKey;

  if (!storeId || storeId.includes("••••") || !storePasswd || storePasswd.includes("••••")) {
    return {
      gateway: "SSLCOMMERZ",
      success: false,
      isLiveMode: creds.isLiveMode,
      latencyMs: 0,
      message: "Store ID or Store Password missing or masked. Please configure credentials.",
    };
  }

  const endpoint = creds.isLiveMode
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

  try {
    const postData = new URLSearchParams({
      store_id: storeId.trim(),
      store_passwd: storePasswd.trim(),
      total_amount: "1.00",
      currency: "USD",
      tran_id: `PING_${Date.now()}`,
      success_url: "https://originax.online",
      fail_url: "https://originax.online",
      cancel_url: "https://originax.online",
      cus_name: "Ping Test",
      cus_email: "ping@originax.online",
      cus_add1: "Campus",
      cus_city: "Dhaka",
      cus_country: "BD",
      cus_phone: "01700000000",
      shipping_method: "NO",
      product_name: "Handshake",
      product_category: "Test",
      product_profile: "non-physical-goods",
    });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: postData.toString(),
    });

    const latencyMs = Date.now() - start;
    const data = await res.json();

    if (data.status === "SUCCESS") {
      return {
        gateway: "SSLCOMMERZ",
        success: true,
        isLiveMode: creds.isLiveMode,
        latencyMs,
        message: `Connected successfully to SSLCommerz (${creds.isLiveMode ? "Live" : "Sandbox"} Environment). Session handshake OK.`,
      };
    } else {
      return {
        gateway: "SSLCOMMERZ",
        success: false,
        isLiveMode: creds.isLiveMode,
        latencyMs,
        message: data.failedreason || "Credentials rejected by SSLCommerz",
      };
    }
  } catch (err: any) {
    return {
      gateway: "SSLCOMMERZ",
      success: false,
      isLiveMode: creds.isLiveMode,
      latencyMs: Date.now() - start,
      message: `Failed to reach SSLCommerz: ${err.message}`,
    };
  }
}
