import { Request, Response } from "express";
import { Customers } from "../models/customer";
import { sendGridEmail } from "../config/email";
import {
  sendWhatsAppOTP,
  getSoulConectWhatsAppChannel,
  generateWhatsAppDirectLink,
  formatWhatsAppNumber,
} from "../config/whatsapp";

/**
 * Generate a random 6-digit OTP.
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Initiate verification by generating and sending a 6-digit OTP via Email or WhatsApp.
 * Supports finding customer by email OR phone_number case-insensitively.
 */
export async function handleSendOTP(req: Request, res: Response) {
  try {
    const { email, type = "phone", phone_number, phone_code = "+91" } = req.body;

    if (!email && !phone_number) {
      return res.status(400).json({ error: "Missing email or phone_number parameter" });
    }

    const isPhoneOrWhatsApp = type === "phone" || type === "whatsapp";
    if (type !== "email" && !isPhoneOrWhatsApp) {
      return res.status(400).json({
        error: "Invalid verification type. Expected 'email', 'phone', or 'whatsapp'",
      });
    }

    // Find customer by email (case-insensitive) OR by phone number
    const findConditions: any[] = [];
    if (email && typeof email === "string" && email.trim()) {
      findConditions.push({ email: { $regex: new RegExp(`^${email.trim()}$`, "i") } });
    }
    if (phone_number && typeof phone_number === "string" && phone_number.trim()) {
      const cleanDigits = phone_number.replace(/\D/g, "").replace(/^0+/, "");
      findConditions.push({ phone_number: phone_number.trim() });
      findConditions.push({ phone_number: cleanDigits });
      if (cleanDigits.length === 10) {
        findConditions.push({ phone_number: `+91 ${cleanDigits}` });
        findConditions.push({ phone_number: `+91${cleanDigits}` });
      }
    }

    let customer = findConditions.length > 0 ? await Customers.findOne({ $or: findConditions }) : null;

    const otp = generateOTP();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration
    const channelInfo = getSoulConectWhatsAppChannel();

    if (type === "email") {
      const targetEmail = (email || customer?.get("email") || "").trim();
      if (!targetEmail) {
        return res.status(400).json({ error: "No email address found for email verification" });
      }

      if (customer) {
        customer.set("email_otp", otp);
        customer.set("email_otp_expires", expires);
        await customer.save();
      }

      console.log(`📨 [Email verification] Generated OTP: ${otp} for ${targetEmail}`);

      // Send OTP Email using SendGrid
      try {
        await sendGridEmail({
          to: targetEmail,
          subject: "Verify Your Email Address - Soul Connect",
          text: `Your Soul Connect verification code is: ${otp}. This code is valid for 5 minutes.`,
          html: `
            <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; padding:20px; border:1px solid #f0f0f0; border-radius:8px; background:#ffffff;">
              <div style="background:linear-gradient(135deg,#F2688C,#7C3AED); padding:20px; text-align:center; border-radius:6px 6px 0 0;">
                <h2 style="margin:0;color:#fff;">Soul Connect Verification</h2>
              </div>
              <div style="padding:24px; font-size:15px; text-align:center;">
                <p>Hello,</p>
                <p>Thank you for using Soul Connect. Please verify your email address by entering the following OTP code:</p>
                <div style="display:inline-block; margin:20px auto; padding:12px 30px; font-size:24px; font-weight:bold; letter-spacing:4px; color:#7C3AED; background:#f3e8ff; border-radius:8px; border:1px dashed #7C3AED;">
                  ${otp}
                </div>
                <p style="font-size:13px; color:#666;">This code is valid for 5 minutes. Do not share this OTP with anyone.</p>
              </div>
              <div style="border-top:1px solid #eee; margin-top:20px; padding-top:15px; text-align:center; font-size:12px; color:#888;">
                📢 Official Soul Connect WhatsApp Channel: <a href="${channelInfo.channelUrl}" style="color:#7C3AED;text-decoration:none;font-weight:600;">Join ${channelInfo.name}</a><br/>
                This is an automated notification. Please do not reply directly.
              </div>
            </div>
          `,
        });
        console.log(`✅ Verification email sent successfully to ${targetEmail} via SendGrid`);
      } catch (emailErr: any) {
        console.error("❌ Failed to send SendGrid verification email:", emailErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Email verification OTP sent successfully",
        delivery: "email",
        channel_group: channelInfo,
      });
    } else {
      // Phone / WhatsApp verification
      const rawTargetPhone = phone_number || customer?.get("phone_number") || "";
      const rawTargetCode = phone_code || customer?.get("phone_code") || "+91";

      if (!rawTargetPhone) {
        return res.status(400).json({ error: "No mobile number found for WhatsApp verification" });
      }

      const formattedNumber = formatWhatsAppNumber(rawTargetPhone, rawTargetCode);
      const memberName =
        customer?.get("first_name") ||
        customer?.get("firstName") ||
        "Member";

      if (customer) {
        if (phone_number) {
          customer.set("phone_number", phone_number);
          customer.set("whatsapp_number", phone_number);
        }
        if (phone_code) {
          customer.set("phone_code", phone_code);
        }
        customer.set("phone_otp", otp);
        customer.set("phone_otp_expires", expires);
        await customer.save();
      }

      console.log(
        `📱💬 [WhatsApp verification] Generated OTP: ${otp} for ${formattedNumber} (${memberName})`,
      );

      const waResult = await sendWhatsAppOTP({
        to: formattedNumber,
        otp,
        memberName,
        type: "otp",
      });

      return res.status(200).json({
        success: true,
        message: `WhatsApp verification OTP generated for +${formattedNumber}. Valid for 5 minutes.`,
        delivery: "whatsapp",
        direct_link: waResult.directLink,
        otp_message: waResult.formattedMessage,
        recipient_phone: `+${formattedNumber}`,
        channel_group: waResult.channelInfo,
        otp, // Expose OTP for convenient verification
      });
    }
  } catch (err: any) {
    console.error("handleSendOTP error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to send verification OTP" });
  }
}

/**
 * Verify the submitted OTP and update customer verification state.
 */
export async function handleVerifyOTP(req: Request, res: Response) {
  try {
    const { email, phone_number, type = "phone", otp } = req.body;

    if (!otp || (!email && !phone_number)) {
      return res
        .status(400)
        .json({ error: "Missing required parameters (otp, and either email or phone_number)" });
    }

    const isPhoneOrWhatsApp = type === "phone" || type === "whatsapp";
    if (type !== "email" && !isPhoneOrWhatsApp) {
      return res.status(400).json({
        error: "Invalid verification type. Expected 'email', 'phone', or 'whatsapp'",
      });
    }

    // Find customer by email or phone
    const findConditions: any[] = [];
    if (email && typeof email === "string" && email.trim()) {
      findConditions.push({ email: { $regex: new RegExp(`^${email.trim()}$`, "i") } });
    }
    if (phone_number && typeof phone_number === "string" && phone_number.trim()) {
      const cleanDigits = phone_number.replace(/\D/g, "").replace(/^0+/, "");
      findConditions.push({ phone_number: phone_number.trim() });
      findConditions.push({ phone_number: cleanDigits });
      if (cleanDigits.length === 10) {
        findConditions.push({ phone_number: `+91 ${cleanDigits}` });
        findConditions.push({ phone_number: `+91${cleanDigits}` });
      }
    }

    const customer = findConditions.length > 0 ? await Customers.findOne({ $or: findConditions }) : null;
    const channelInfo = getSoulConectWhatsAppChannel();

    if (customer) {
      const dbOtp =
        type === "email" ? customer.get("email_otp") : customer.get("phone_otp");
      const dbOtpExpires =
        type === "email"
          ? customer.get("email_otp_expires")
          : customer.get("phone_otp_expires");

      if (!dbOtp || !dbOtpExpires) {
        return res.status(400).json({
          error: "No active verification code found. Please request a code first.",
        });
      }

      // Check expiration
      if (new Date() > new Date(dbOtpExpires)) {
        return res.status(400).json({
          error: "Verification code has expired. Please request a new one.",
        });
      }

      // Compare codes
      if (dbOtp !== String(otp).trim()) {
        return res.status(400).json({ error: "Invalid verification code" });
      }

      // Success! Update verification status
      if (type === "email") {
        customer.set("email_verified", true);
        customer.set("email_otp", undefined);
        customer.set("email_otp_expires", undefined);
      } else {
        customer.set("phone_verified", true);
        customer.set("whatsapp_verified", true);
        customer.set("phone_otp", undefined);
        customer.set("phone_otp_expires", undefined);
      }

      await customer.save();
      console.log(
        `✅ [Verification] Customer ${customer.get("email") || phone_number} verified their ${type} successfully`,
      );
    }

    return res.status(200).json({
      success: true,
      message: `${type === "email" ? "Email" : "WhatsApp / Mobile number"} verified successfully!`,
      channel_group: channelInfo,
    });
  } catch (err: any) {
    console.error("handleVerifyOTP error:", err);
    res.status(500).json({ error: err.message || "Failed to verify OTP" });
  }
}
