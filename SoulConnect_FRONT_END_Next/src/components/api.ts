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
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (r) => {
      const resData = await r.json().catch(() => ({}));
      if (!r.ok) {
        const errorMsg =
          resData.error ||
          resData.message ||
          resData.detail ||
          `Request failed with status ${r.status}`;
        throw new Error(errorMsg);
      }
      if (resData.error) {
        throw new Error(resData.error);
      }
      console.log("Customer created outside", resData);
      return resData;
    })
    .catch((e) => {
      console.error("Error saving customer:", e);
      throw e;
    });
};

/**
 * Send Verification OTP (Email or Phone)
 */
export const onSendOtpApi = async (payload: {
  email: string;
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
  email: string;
  type: "email" | "phone";
  otp: string;
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
