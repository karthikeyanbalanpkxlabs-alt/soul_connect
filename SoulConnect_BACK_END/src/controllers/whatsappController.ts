import { Request, Response } from "express";
import {
  SOUL_CONECT_WHATSAPP_CHANNEL,
  sendWhatsAppOTP,
  formatWhatsAppOtpMessage,
  generateWhatsAppDirectLink,
} from "../config/whatsapp";
import { Customers } from "../models/customer";

/**
 * Get official Soul Conect WhatsApp Channel & Group details
 */
export async function handleGetWhatsAppChannelInfo(req: Request, res: Response) {
  try {
    const channelInfo = SOUL_CONECT_WHATSAPP_CHANNEL;
    return res.status(200).json({
      success: true,
      channel: channelInfo,
      stats: {
        activeMembers: 12480,
        dailyMatchAlerts: "Active",
        verificationSpeed: "Instant (< 10s)",
      },
    });
  } catch (err: any) {
    console.error("handleGetWhatsAppChannelInfo error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch WhatsApp channel info" });
  }
}

/**
 * Send WhatsApp Channel Group Invite to a customer
 */
export async function handleSendWhatsAppInvite(req: Request, res: Response) {
  try {
    const { email, phone_number, phone_code } = req.body;

    if (!email && !phone_number) {
      return res.status(400).json({ error: "Missing email or phone_number" });
    }

    let targetPhone = phone_number;
    let targetCode = phone_code || "+91";

    if (email) {
      const customer = await Customers.findOne({ email });
      if (customer) {
        targetPhone = customer.get("phone_number") || targetPhone;
        targetCode = customer.get("phone_code") || targetCode;
      }
    }

    if (!targetPhone) {
      return res.status(400).json({ error: "No phone number available for WhatsApp invite" });
    }

    const fullPhone = `${targetCode}${targetPhone}`;
    const channel = SOUL_CONECT_WHATSAPP_CHANNEL;

    const directLink = `https://wa.me/${fullPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `🙏 Vanakkam! Welcome to *${channel.name}* Matrimony.\n\nJoin our official channel group for verified matrimony matches and alerts:\n${channel.channelUrl}\n\nGroup: ${channel.groupUrl}`,
    )}`;

    return res.status(200).json({
      success: true,
      message: `WhatsApp invite prepared for ${fullPhone}`,
      channel: channel,
      direct_link: directLink,
    });
  } catch (err: any) {
    console.error("handleSendWhatsAppInvite error:", err);
    res.status(500).json({ error: err.message || "Failed to send WhatsApp invite" });
  }
}
