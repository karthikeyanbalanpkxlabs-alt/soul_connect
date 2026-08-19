/**
 * WhatsApp Channel & Community Group Integration for Soul Conect
 * Pure Channel & Community Group URL flow
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

  // Strip all leading zeros (e.g. 08870588605 -> 8870588605)
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
 * Dispatch WhatsApp OTP & Channel links
 */
export async function sendWhatsAppOTP(options: WhatsAppSendOptions): Promise<{
  success: boolean;
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

  console.log("==========================================");
  console.log(`💬 [Soul Conect WhatsApp OTP]`);
  console.log(`👤 Recipient Phone : ${to} -> ${formattedNumber}`);
  console.log(`👤 Recipient Name  : ${memberName || "Member"}`);
  console.log(`📢 Channel URL     : ${channelInfo.channelUrl}`);
  console.log(`👥 Group URL       : ${channelInfo.groupUrl}`);
  console.log(`🔑 OTP Code        : ${otp}`);
  console.log(`👉 Direct wa.me    : ${directLink}`);
  console.log("==========================================");

  return {
    success: true,
    directLink,
    formattedNumber,
    formattedMessage,
    channelInfo,
  };
}
