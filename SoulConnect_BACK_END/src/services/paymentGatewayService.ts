import crypto from "crypto";

export interface GatewayConfig {
  api_key: string;
  salt: string;
  pg_api_url?: string;
  encryption_key?: string;
  decryption_key?: string;
}

/**
 * 1. HASH GENERATION (Appendix 2 - Section 15.1)
 * Computes SHA-512 uppercase hash with sorted keys and salt prepended with pipe (|)
 */
export function generateGatewayHash(
  params: Record<string, any>,
  salt: string,
): string {
  if (!salt) {
    throw new Error("Cannot calculate gateway hash: 'salt' is missing.");
  }

  // Filter out 'hash', null, undefined, or empty string values
  const validKeys = Object.keys(params)
    .filter(
      (k) =>
        k !== "hash" &&
        params[k] !== undefined &&
        params[k] !== null &&
        String(params[k]).trim().length > 0,
    )
    .sort();

  let hashData = salt;
  for (const key of validKeys) {
    hashData += `|${String(params[key]).trim()}`;
  }

  return crypto.createHash("sha512").update(hashData).digest("hex").toUpperCase();
}

/**
 * 2. HASH VERIFICATION (Appendix 2 - Section 15.2)
 * Verifies gateway response hash against the received payload and salt
 */
export function verifyGatewayHash(
  responsePayload: Record<string, any>,
  salt: string,
): boolean {
  if (!responsePayload || !responsePayload.hash) {
    return true; // As per doc 15.2: if hash is null or omitted, hash checking is skipped
  }

  const receivedHash = String(responsePayload.hash).toUpperCase();
  const payloadCopy = { ...responsePayload };
  delete payloadCopy.hash;

  const computedHash = generateGatewayHash(payloadCopy, salt);
  return receivedHash === computedHash;
}

/**
 * 3. AES-256-CBC ENCRYPTION (Section 3.1)
 * Encrypts payload string using AES-256-CBC and returns Base64 encoded encrypted_data & iv
 */
export function encryptGatewayData(
  plainData: string,
  encryptionKey: string,
): { encrypted_data: string; iv: string } {
  const iv = crypto.randomBytes(16);
  // Ensure key is 32 bytes for AES-256
  const keyBuffer = Buffer.from(encryptionKey.padEnd(32, "0").slice(0, 32));
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);

  let encrypted = cipher.update(plainData, "utf8", "base64");
  encrypted += cipher.final("base64");

  return {
    encrypted_data: encrypted,
    iv: iv.toString("base64"),
  };
}

/**
 * 4. AES-256-CBC DECRYPTION (Section 3.2)
 * Decrypts Base64 encoded AES-256-CBC encrypted_data using decryptionKey and Base64 iv
 */
export function decryptGatewayData(
  encryptedDataBase64: string,
  decryptionKey: string,
  ivBase64: string,
): string {
  const iv = Buffer.from(ivBase64, "base64");
  const keyBuffer = Buffer.from(decryptionKey.padEnd(32, "0").slice(0, 32));
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);

  let decrypted = decipher.update(encryptedDataBase64, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

/**
 * Helper to normalize PG base URL
 */
function getGatewayUrl(config: GatewayConfig, endpointPath: string): string {
  const rawUrl = (
    config.pg_api_url ||
    process.env.PG_API_URL ||
    "https://api.paymentgateway.com"
  ).trim();
  const baseUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = endpointPath.startsWith("/")
    ? endpointPath
    : `/${endpointPath}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Common POST request sender to Gateway with application/x-www-form-urlencoded
 */
async function postToGateway(
  url: string,
  formFields: Record<string, any>,
): Promise<any> {
  const formBody = new URLSearchParams();
  for (const key of Object.keys(formFields)) {
    if (formFields[key] !== undefined && formFields[key] !== null) {
      formBody.append(key, String(formFields[key]));
    }
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody.toString(),
  });

  const responseText = await res.text();
  let jsonResponse: any;
  try {
    jsonResponse = JSON.parse(responseText);
  } catch (err) {
    throw new Error(
      `Gateway response is not valid JSON (${res.status} ${res.statusText}): ${responseText}`,
    );
  }

  return jsonResponse;
}

// --------------------------------------------------------------------------------------
// CORE GATEWAY APIS
// --------------------------------------------------------------------------------------

/**
 * 5. GET PAYMENT REQUEST INTENT URL - UPI INTENT (Section 5)
 * Returns upi://pay?... URL for deep linking into UPI apps (GPay, PhonePe, Paytm, etc.)
 */
export async function fetchUpiIntentUrl(
  params: {
    order_id: string;
    amount: string | number;
    currency?: string;
    description: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    zip_code: string;
    return_url: string;
    return_url_failure?: string;
    return_url_cancel?: string;
    mode?: "TEST" | "LIVE";
    [key: string]: any;
  },
  config: GatewayConfig,
) {
  const fullParams: Record<string, any> = {
    api_key: config.api_key,
    order_id: params.order_id,
    mode: params.mode || "LIVE",
    amount: Number(params.amount).toFixed(2),
    currency: params.currency || "INR",
    description: params.description,
    name: params.name,
    email: params.email,
    phone: params.phone,
    address_line_1: params.address_line_1 || "",
    address_line_2: params.address_line_2 || "",
    city: params.city,
    state: params.state || "",
    country: params.country || "IND",
    zip_code: params.zip_code,
    return_url: params.return_url,
    return_url_failure: params.return_url_failure || params.return_url,
    return_url_cancel: params.return_url_cancel || params.return_url,
    payment_options: "upi",
    allowed_bank_codes: "UPIU",
  };

  fullParams.hash = generateGatewayHash(fullParams, config.salt);
  const targetUrl = getGatewayUrl(config, "/v2/getpaymentrequestintenturl");
  return await postToGateway(targetUrl, fullParams);
}

/**
 * 6. GET PAYMENT REQUEST URL - HOSTED CHARGE PAGE (Section 4)
 * Returns unique payment URL to open in browser / webview to complete transaction
 */
export async function fetchPaymentRequestUrl(
  params: {
    order_id: string;
    amount: string | number;
    currency?: string;
    description: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    zip_code: string;
    return_url: string;
    return_url_failure?: string;
    return_url_cancel?: string;
    expiry_in_minutes?: number | string;
    payment_options?: string;
    allowed_bank_codes?: string;
    mode?: "TEST" | "LIVE";
    [key: string]: any;
  },
  config: GatewayConfig,
) {
  const fullParams: Record<string, any> = {
    api_key: config.api_key,
    order_id: params.order_id,
    mode: params.mode || "LIVE",
    amount: Number(params.amount).toFixed(2),
    currency: params.currency || "INR",
    description: params.description,
    name: params.name,
    email: params.email,
    phone: params.phone,
    address_line_1: params.address_line_1 || "",
    address_line_2: params.address_line_2 || "",
    city: params.city,
    state: params.state || "",
    country: params.country || "IND",
    zip_code: params.zip_code,
    return_url: params.return_url,
    return_url_failure: params.return_url_failure || params.return_url,
    return_url_cancel: params.return_url_cancel || params.return_url,
    expiry_in_minutes: params.expiry_in_minutes || "15",
    payment_options: params.payment_options || "upi,cc,nb,w",
    allowed_bank_codes: params.allowed_bank_codes || "",
  };

  fullParams.hash = generateGatewayHash(fullParams, config.salt);
  const targetUrl = getGatewayUrl(config, "/v2/getpaymentrequesturl");
  return await postToGateway(targetUrl, fullParams);
}

/**
 * 7. EXPIRE PAYMENT REQUEST URL (Section 4.4)
 * Manually expires a payment URL before automatic expiry
 */
export async function expirePaymentUrl(
  uuid: string,
  config: GatewayConfig,
) {
  const fullParams: Record<string, any> = {
    api_key: config.api_key,
    uuid: uuid,
  };

  fullParams.hash = generateGatewayHash(fullParams, config.salt);
  const targetUrl = getGatewayUrl(config, "/v2/expirepaymentrequesturl");
  return await postToGateway(targetUrl, fullParams);
}

/**
 * 8. GENERATE CHALLAN / INVOICE URL (Section 11.2)
 * Creates a payment link to share with customers via SMS or Email
 */
export async function generateChallanUrl(
  params: {
    name: string;
    mobile: string;
    email: string;
    amount: string | number;
    purpose: string;
  },
  config: GatewayConfig,
) {
  const fullParams: Record<string, any> = {
    api_key: config.api_key,
    name: params.name,
    mobile: params.mobile,
    email: params.email,
    amount: Number(params.amount).toFixed(2),
    purpose: params.purpose,
  };

  // Section 11.2.1 specifies alphabetical hash: SALT|amount|api_key|email|mobile|name|purpose
  fullParams.hash = generateGatewayHash(fullParams, config.salt);
  const targetUrl = getGatewayUrl(config, "/v1/generatechallanurl");
  return await postToGateway(targetUrl, fullParams);
}

/**
 * 9. SEAMLESS PAYMENT REQUEST - UPI COLLECT / CARDS (Section 13)
 * Custom UI payment request without redirection (e.g. UPI Collect with payer_virtual_address)
 */
export async function executeSeamlessPayment(
  params: {
    order_id: string;
    amount: string | number;
    currency?: string;
    description: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    zip_code: string;
    return_url: string;
    bank_code: string; // "UPIU" for UPI
    payer_virtual_address?: string; // e.g. "user@okhdfcbank"
    mode?: "TEST" | "LIVE";
    [key: string]: any;
  },
  config: GatewayConfig,
) {
  const fullParams: Record<string, any> = {
    api_key: config.api_key,
    order_id: params.order_id,
    mode: params.mode || "LIVE",
    amount: Number(params.amount).toFixed(2),
    currency: params.currency || "INR",
    description: params.description,
    name: params.name,
    email: params.email,
    phone: params.phone,
    address_line_1: params.address_line_1 || "",
    address_line_2: params.address_line_2 || "",
    city: params.city,
    state: params.state || "",
    country: params.country || "IND",
    zip_code: params.zip_code,
    bank_code: params.bank_code || "UPIU",
    payer_virtual_address: params.payer_virtual_address || "",
    return_url: params.return_url,
    return_url_failure: params.return_url_failure || params.return_url,
    return_url_cancel: params.return_url_cancel || params.return_url,
  };

  fullParams.hash = generateGatewayHash(fullParams, config.salt);
  const targetUrl = getGatewayUrl(config, "/v2/paymentseamlessrequest");
  return await postToGateway(targetUrl, fullParams);
}

/**
 * 10. PAYMENT STATUS INQUIRY API (Section 6)
 * Checks transaction status for one or more order_ids or transaction_ids
 */
export async function checkPaymentStatus(
  params: {
    order_id?: string;
    transaction_id?: string;
    bank_code?: string;
    response_code?: number | string;
    customer_phone?: string;
    customer_email?: string;
    customer_name?: string;
    date_from?: string; // DD-MM-YYYY or YYYY-MM-DD HH:MM:SS
    date_to?: string;
    page_number?: number | string;
    per_page?: number | string;
  },
  config: GatewayConfig,
) {
  const fullParams: Record<string, any> = {
    api_key: config.api_key,
    ...params,
  };

  fullParams.hash = generateGatewayHash(fullParams, config.salt);
  const targetUrl = getGatewayUrl(config, "/v2/paymentstatus");
  return await postToGateway(targetUrl, fullParams);
}

/**
 * 11. REFUND REQUEST API (Section 7.1)
 * Initiates full or partial refund for a prior transaction
 */
export async function initiateRefund(
  params: {
    transaction_id: string;
    amount: string | number;
    description: string;
    merchant_refund_id?: string;
    merchant_order_id?: string;
  },
  config: GatewayConfig,
) {
  const fullParams: Record<string, any> = {
    api_key: config.api_key,
    transaction_id: params.transaction_id,
    amount: Number(params.amount).toFixed(2),
    description: params.description,
    merchant_refund_id:
      params.merchant_refund_id ||
      `REF_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };

  if (params.merchant_order_id) {
    fullParams.merchant_order_id = params.merchant_order_id;
  }

  fullParams.hash = generateGatewayHash(fullParams, config.salt);
  const targetUrl = getGatewayUrl(config, "/v2/refundrequest");
  return await postToGateway(targetUrl, fullParams);
}

/**
 * 12. REFUND STATUS API (Section 7.2)
 * Checks status of previous refund(s) for a given transaction_id
 */
export async function checkRefundStatus(
  params: {
    transaction_id: string;
    merchant_order_id?: string;
  },
  config: GatewayConfig,
) {
  const fullParams: Record<string, any> = {
    api_key: config.api_key,
    transaction_id: params.transaction_id,
  };

  if (params.merchant_order_id) {
    fullParams.merchant_order_id = params.merchant_order_id;
  }

  fullParams.hash = generateGatewayHash(fullParams, config.salt);
  const targetUrl = getGatewayUrl(config, "/v2/refundstatus");
  return await postToGateway(targetUrl, fullParams);
}
