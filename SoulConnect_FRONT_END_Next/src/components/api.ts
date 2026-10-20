import configUrls from "../../configUrls";

/**
 * @SAVE_CUSTOMER_DATA
 * @param Data
 */
export const onSaveCustomer = async (data: any) => {
  if (data) {
    data.whoiam_register =
      data.whoiam_register || data.profile_created_for || "For myself";
    data.profile_created_for =
      data.profile_created_for || data.whoiam_register || "For myself";
  }
  let endpoint = configUrls?.apiUrl + "/api/public/customer_create";
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const resData = await r.json().catch(() => ({}));
    if (!r.ok || resData.error) {
      const errorMsg =
        resData.error ||
        resData.message ||
        resData.detail ||
        `Request failed with status ${r.status}`;
      return { success: false, error: errorMsg };
    }
    console.log("Customer created outside", resData);
    return { success: true, ...resData };
  } catch (e: any) {
    console.error("Error saving customer:", e);
    return {
      success: false,
      error: e?.message || "Network error while saving customer data.",
    };
  }
};

/**
 * Send Verification OTP (Email or Phone)
 */
export const onSendOtpApi = async (payload: {
  email?: string;
  type: "email" | "phone";
  phone_number?: string;
  phone_code?: string;
}) => {
  try {
    const apiUrl = configUrls?.apiUrl || "https://api.soulconect.com";
    const endpoint = `${apiUrl}/api/public/verification/send-otp`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || `HTTP ${res.status}` };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
};

/**
 * Verify OTP (Email or Phone)
 */
export const onVerifyOtpApi = async (payload: {
  email?: string;
  type: "email" | "phone";
  otp: string;
  phone_number?: string;
}) => {
  try {
    const apiUrl = configUrls?.apiUrl || "https://api.soulconect.com";
    const endpoint = `${apiUrl}/api/public/verification/verify-otp`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || `HTTP ${res.status}` };
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
};

/**
 * Upload Media (Image, PDF, Video, Audio) via multipart FormData
 * Returns { success: boolean, url?: string, path?: string, filename?: string, error?: string }
 */
export const uploadMediaFile = async (
  file: File | Blob,
  prefix = "profile",
  fieldName = "file",
): Promise<{
  success: boolean;
  url?: string;
  path?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  data?: any;
  error?: string;
}> => {
  try {
    const apiUrl = configUrls?.apiUrl || "https://api.soulconect.com";
    const endpoint = `${apiUrl}/media-upload?prefix=${encodeURIComponent(prefix)}`;
    const formData = new FormData();
    formData.append("prefix", prefix);
    formData.append(fieldName, file);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-prefix": prefix,
      },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Upload failed with status ${res.status}`,
      };
    }

    return {
      success: true,
      url: data.url,
      path: data.path,
      filename: data.filename,
      mimetype: data.mimetype,
      size: data.size,
      data: data.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error while uploading file",
    };
  }
};

/**
 * Resend Welcome Email with Temporary Password
 */
export const onResendWelcomeEmailApi = async (payload: {
  email: string;
  temporaryPassword?: string;
  firstName?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const apiUrl = configUrls?.apiUrl || "https://api.soulconect.com";
    const endpoint = `${apiUrl}/api/send-email`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: payload.email,
        subject: "Welcome to Soul Connect - Account Credentials",
        message: `Hello ${payload.firstName || "Member"},\n\nHere are your Soul Connect login details:\n\nEmail: ${payload.email}\nTemporary Password: ${payload.temporaryPassword || "password@123"}\n\nLogin to Portal: https://soulconect.com/portal\n\nPlease log in and change your password for security.\n\nBest regards,\nSoul Connect Team`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${res.status}`,
      };
    }
    return { success: true, ...data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error while sending email",
    };
  }
};
