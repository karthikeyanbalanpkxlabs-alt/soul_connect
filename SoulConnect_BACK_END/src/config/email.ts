import sgMail from "@sendgrid/mail";

export const EMAIL_TRIGGER_ENABLE_FLAG = true;

export interface SendGridMailData {
  to: string | string[];
  from?: string | { email: string; name?: string };
  cc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send email using SendGrid Mail API.
 */
export const sendGridEmail = async (mailData: SendGridMailData) => {
  const apiKey = process.env.S_API_KEY || "";
  if (!apiKey || apiKey === "SG.your_sendgrid_api_key_here") {
    console.warn(
      "⚠️ SendGrid API key is not configured or using placeholder value in .env!",
    );
  }
  sgMail.setApiKey(apiKey);

  const defaultFrom = {
    email: process.env.SENDGRID_FROM_EMAIL || "supportsoulconect@gmail.com",
    name: process.env.SENDGRID_FROM_NAME || "Soul Connect",
  };

  const msg: any = {
    to: mailData.to,
    from: mailData.from || defaultFrom,
    subject: mailData.subject,
    text: mailData.text || "",
    html: mailData.html || "",
  };

  if (mailData.cc) {
    msg.cc = mailData.cc;
  } else if (process.env.SENDGRID_CC_EMAIL) {
    msg.cc = process.env.SENDGRID_CC_EMAIL;
  }

  console.log("====================================");
  console.log("📨 [SendGrid] Dispatching Email");
  console.log("To     :", msg.to);
  console.log("From   :", msg.from);
  console.log("CC     :", msg.cc);
  console.log("Subject:", msg.subject);
  console.log("====================================");

  try {
    const response = await sgMail.send(msg);
    return response;
  } catch (error: any) {
    if (error.code === 401 || error.response?.statusCode === 401) {
      console.error(
        "❌ [SendGrid 401 Unauthorized] The S_API_KEY in .env is invalid, expired, or revoked.",
      );
      console.error(
        "👉 Please generate a new API key in SendGrid Dashboard (https://app.sendgrid.com/settings/api_keys) with 'Mail Send' permissions and update S_API_KEY in your backend .env file.",
      );
    } else if (error.code === 403 || error.response?.statusCode === 403) {
      const senderEmail =
        typeof msg.from === "string" ? msg.from : msg.from.email;
      console.error(
        `❌ [SendGrid 403 Forbidden] The sender address '${senderEmail}' is not a verified Sender Identity.`,
      );
      console.error(
        "👉 Please verify this email in SendGrid Dashboard (https://app.sendgrid.com/settings/sender_auth) or update SENDGRID_FROM_EMAIL in .env to a verified sender email.",
      );
    }
    throw error;
  }
};
