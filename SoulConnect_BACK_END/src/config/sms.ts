import dotenv from "dotenv";
dotenv.config();

export interface Send2FactorSMSOptions {
  phone: string; // E.164 or local phone number e.g. "+919876543210" or "9876543210"
  otp: string;
  templateName?: string;
}

export interface Send2FactorSMSResult {
  success: boolean;
  sessionId?: string;
  details?: string;
  error?: string;
}

/**
 * Clean and format phone number for 2Factor.in API.
 * 2Factor API expects phone number without '+' or special characters.
 * E.g., "+919876543210" -> "919876543210", "9876543210" -> "919876543210"
 */
function sanitizePhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/[^\d]/g, "");
  // Extract last 10 digits and prefix with 91 for Indian mobile numbers
  if (digitsOnly.length >= 10) {
    return "91" + digitsOnly.slice(-10);
  }
  return digitsOnly;
}

/**
 * Send SMS OTP via 2Factor.in REST API.
 * Endpoint format: https://2factor.in/API/V1/{API_KEY}/SMS/{PHONE_NUMBER}/{OTP}
 * Or with custom DLT template: https://2factor.in/API/V1/{API_KEY}/SMS/{PHONE_NUMBER}/{OTP}/{TEMPLATE_NAME}
 */
export async function send2FactorOTP(
  options: Send2FactorSMSOptions,
): Promise<Send2FactorSMSResult> {
  const apiKey =
    process.env.TWOFACTOR_API_KEY ||
    process.env.TOFACT ||
    process.env.TWO_FACTOR_API_KEY ||
    process.env["2FACTOR_API_KEY"];

  if (!apiKey) {
    const errorMsg =
      "❌ 2Factor API Key is missing in .env! (Expected TWOFACTOR_API_KEY or TOFACT)";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  const cleanedPhone = sanitizePhoneNumber(options.phone);
  const template = options.templateName || process.env.TWOFACTOR_TEMPLATE_NAME;

  // Build 2Factor API URL: Only append template if explicitly configured
  const url = template
    ? `https://2factor.in/API/V1/${apiKey}/SMS/${cleanedPhone}/${options.otp}/${encodeURIComponent(template)}`
    : `https://2factor.in/API/V1/${apiKey}/SMS/${cleanedPhone}/${options.otp}`;

  console.log("====================================");
  console.log("📱 [2Factor.in] Dispatching SMS OTP");
  console.log("Recipient :", cleanedPhone);
  console.log("OTP       :", options.otp);
  console.log("Channel   : SMS Text Message");
  console.log("Template  :", template || "Default (Open OTP Route)");
  console.log("====================================");

  try {
    const response = await fetch(url, { method: "GET" });
    const data: any = await response.json();

    if (data && data.Status === "Success") {
      console.log(`✅ [2Factor.in] SMS OTP sent successfully to ${cleanedPhone}. Session ID: ${data.Details}`);
      return {
        success: true,
        sessionId: data.Details,
        details: data.Details,
      };
    } else {
      const errorMsg = data?.Details || "Unknown error from 2Factor API";
      console.error(`❌ [2Factor.in] Failed to send SMS OTP: ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
        details: JSON.stringify(data),
      };
    }
  } catch (error: any) {
    console.error("❌ [2Factor.in] HTTP request error:", error.message || error);
    return {
      success: false,
      error: error.message || "Network request failed",
    };
  }
}
