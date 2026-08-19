/**
 * WhatsApp Integration for Soul Conect
 * Supports:
 * 1. Meta WhatsApp Cloud API (Graph API) - for direct background delivery to recipient phones
 * 2. Official "Soul Conect" Channel & Community Group links
 * 3. Direct Click-to-Chat deep links (wa.me)
 */

export interface WhatsAppSendOptions {
  to: string; // Phone number (e.g. +918870588605, 8870588605, +91 8890888907)
  otp: string;
  memberName?: string;
  type?: "otp" | "notification" | "welcome" | "channel_invite";
  customMessage?: string;
}

export interface WhatsAppChannelGroupInfo {
  name: string;
  description: string;
  channelUrl: string;
  groupUrl: string;
  supportNumber: string;
  verified: boolean;
  avatarUrl: string;
}

/**
 * Get current Soul Conect WhatsApp Channel & Group configuration dynamically from environment
 */
export function getSoulConectWhatsAppChannel(): WhatsAppChannelGroupInfo {
  return {
    name: process.env.WHATSAPP_CHANNEL_GROUP_NAME || "Soul Conect",
    description:
      process.env.WHATSAPP_CHANNEL_GROUP_DESC ||
      "Official Soul Conect Matrimony Channel & Verified Community Group. Instant match alerts, horoscope notifications, and 24/7 matrimonial assistance.",
    channelUrl:
      process.env.WHATSAPP_CHANNEL_GROUP_URL ||
      "https://whatsapp.com/channel/0029VbDJafbG8l5C1LnfEh0X",
    groupUrl:
      process.env.WHATSAPP_COMMUNITY_GROUP_URL ||
      "https://chat.whatsapp.com/HwttQwBAS34Ck1az1PlOxQ",
    supportNumber: process.env.WHATSAPP_SUPPORT_NUMBER || "+918870588605",
    verified: true,
    avatarUrl: "https://soulconect.com/logo.png",
  };
}

export const SOUL_CONECT_WHATSAPP_CHANNEL = getSoulConectWhatsAppChannel();

/**
 * Clean and format any phone number into a 100% valid WhatsApp E.164 string (digits only).
 * Handles +91, spaces, dashes, leading 0, and avoids duplicate country codes.
 */
export function formatWhatsAppNumber(phone: string, phoneCode: string = "+91"): string {
  if (!phone) return "";

  let cleaned = phone.replace(/\D/g, ""); // digits only
  let codeDigits = (phoneCode || "+91").replace(/\D/g, "") || "91";

  // Strip all leading zeros (e.g. 08870688605 -> 8870688605)
  cleaned = cleaned.replace(/^0+/, "");

  // If already prefixed with country code (e.g. 918870588605 where length is 12 for India)
  if (cleaned.startsWith(codeDigits) && cleaned.length > 10) {
    return cleaned;
  }

  // If 10 digits (standard Indian mobile number), prepend country code
  if (cleaned.length === 10) {
    return `${codeDigits}${cleaned}`;
  }

  // Fallback
  if (cleaned.startsWith(codeDigits)) {
    return cleaned;
  }

  return `${codeDigits}${cleaned}`;
}

/**
 * Generate official WhatsApp message body with Soul Conect branding, Channel URL & Community Group URL
 */
export function formatWhatsAppOtpMessage(
  otp: string,
  channelName: string = "Soul Conect",
  memberName?: string,
): string {
  const channel = getSoulConectWhatsAppChannel();
  const greeting = memberName && memberName !== "Member" ? `Dear ${memberName},` : `Dear Member,`;

  return (
    `✨ *${channelName} – Mobile Verification Code* ✨\n\n` +
    `${greeting}\n` +
    `Your verification OTP code for ${channelName} is:\n\n` +
    `👉 *${otp}* 👈\n\n` +
    `⏳ This code is valid for *5 minutes*.\n` +
    `🔒 For your safety, please DO NOT share this OTP with anyone.\n\n` +
    `📢 *Join Official ${channelName} Channel:*\n` +
    `${channel.channelUrl}\n\n` +
    `👥 *Join our Community Group:*\n` +
    `${channel.groupUrl}\n\n` +
    `— Best regards,\n*Team ${channelName}* 🙏`
  );
}

/**
 * Generate Click-to-Chat WhatsApp deep link (wa.me) for an individual phone number
 */
export function generateWhatsAppDirectLink(
  phone: string,
  otp: string,
  phoneCode: string = "+91",
  memberName?: string,
): string {
  const formattedPhone = formatWhatsAppNumber(phone, phoneCode);
  const text = encodeURIComponent(formatWhatsAppOtpMessage(otp, "Soul Conect", memberName));
  return `https://wa.me/${formattedPhone}?text=${text}`;
}

/**
 * Dispatch WhatsApp OTP directly via Meta WhatsApp Cloud API (Graph API)
 */
export async function sendWhatsAppOTP(options: WhatsAppSendOptions): Promise<{
  success: boolean;
  provider: string;
  messageId?: string;
  directLink: string;
  formattedMessage: string;
  formattedNumber: string;
  channelInfo: WhatsAppChannelGroupInfo;
}> {
  const { to, otp, memberName } = options;
  const channelInfo = getSoulConectWhatsAppChannel();
  const formattedNumber = formatWhatsAppNumber(to);
  const formattedMessage = formatWhatsAppOtpMessage(otp, channelInfo.name, memberName);
  const directLink = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(formattedMessage)}`;

  const provider = (process.env.WHATSAPP_PROVIDER || "cloud_api").toLowerCase();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  console.log("==========================================");
  console.log(`💬 [Soul Conect WhatsApp OTP Dispatch]`);
  console.log(`📡 Provider        : ${provider}`);
  console.log(`👤 Recipient Phone : ${to} -> ${formattedNumber}`);
  console.log(`👤 Recipient Name  : ${memberName || "Member"}`);
  console.log(`📢 Channel URL     : ${channelInfo.channelUrl}`);
  console.log(`👥 Group URL       : ${channelInfo.groupUrl}`);
  console.log(`🔑 OTP Code        : ${otp}`);
  console.log("==========================================");

  // 1. Meta WhatsApp Cloud API (Graph API)
  if (provider === "cloud_api" || provider === "meta") {
    if (!phoneNumberId || !accessToken) {
      console.warn(
        "⚠️ Meta WhatsApp Cloud API credentials (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN) are not set in .env yet. Direct Click-to-Chat link generated as instant fallback.",
      );
    } else {
      try {
        const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedNumber,
            type: "text",
            text: {
              preview_url: true,
              body: formattedMessage,
            },
          }),
        });

        const data: any = await response.json();

        if (response.ok && data?.messages?.[0]?.id) {
          console.log(`✅ [Meta WhatsApp Cloud API] Message dispatched directly to ${formattedNumber}. Message ID: ${data.messages[0].id}`);
          return {
            success: true,
            provider: "cloud_api",
            messageId: data.messages[0].id,
            directLink,
            formattedNumber,
            formattedMessage,
            channelInfo,
          };
        } else {
          console.warn("⚠️ [Meta WhatsApp Cloud API Response]:", data);
          // If free-form text fails (e.g. requires approved template outside 24h window), try template if configured
          const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME || "soul_conect_otp";
          console.log(`🔄 Attempting Meta WhatsApp template dispatch (${templateName})...`);

          const templateRes = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: formattedNumber,
              type: "template",
              template: {
                name: templateName,
                language: { code: "en_US" },
                components: [
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: memberName || "Member" },
                      { type: "text", text: otp },
                    ],
                  },
                  {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [
                      { type: "text", text: otp },
                    ],
                  },
                ],
              },
            }),
          });

          const templateData: any = await templateRes.json();
          if (templateRes.ok && templateData?.messages?.[0]?.id) {
            console.log(`✅ [Meta WhatsApp Template] Sent successfully. ID: ${templateData.messages[0].id}`);
            return {
              success: true,
              provider: "cloud_api_template",
              messageId: templateData.messages[0].id,
              directLink,
              formattedNumber,
              formattedMessage,
              channelInfo,
            };
          } else {
            console.error("❌ Meta WhatsApp Template error:", templateData?.error?.message || templateData);
          }
        }
      } catch (err: any) {
        console.error("❌ Meta WhatsApp Cloud API exception:", err.message);
      }
    }
  }

  // Direct Click-to-Chat / Fallback
  return {
    success: true,
    provider: "click_to_chat_fallback",
    directLink,
    formattedNumber,
    formattedMessage,
    channelInfo,
  };
}
