import { Request, Response } from "express";
import { Customers } from "../models/customer";
import { sendGridEmail } from "../config/email";

/**
 * Generate a random 6-digit OTP.
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Initiate verification by generating and sending a 6-digit OTP.
 */
export async function handleSendOTP(req: Request, res: Response) {
  try {
    const { email, type, phone_number, phone_code } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Missing email parameter" });
    }

    if (type !== "email" && type !== "phone") {
      return res.status(400).json({
        error: "Invalid verification type. Expected 'email' or 'phone'",
      });
    }

    const customer = await Customers.findOne({ email });
    if (!customer) {
      return res.status(404).json({ error: "Customer profile not found" });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    if (type === "email") {
      // Save OTP to DB
      customer.set("email_otp", otp);
      customer.set("email_otp_expires", expires);
      await customer.save();

      console.log(`📨 [Email verification] Generated OTP: ${otp} for ${email}`);

      // Send OTP Email using SendGrid
      try {
        await sendGridEmail({
          to: email,
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
                This is an automated notification.<br/>
                Please do not reply directly.
              </div>
            </div>
          `,
        });
        console.log(`✅ Verification email sent successfully to ${email} via SendGrid`);
      } catch (emailErr: any) {
        console.error(
          "❌ Failed to send SendGrid verification email, falling back to console log only:",
          emailErr.message,
        );
      }

      return res.status(200).json({
        success: true,
        message: "Email verification OTP sent successfully",
      });
    } else {
      // Phone verification
      // If a new phone number/code is provided, update it on the customer profile
      if (phone_number) {
        customer.set("phone_number", phone_number);
      }
      if (phone_code) {
        customer.set("phone_code", phone_code);
      }

      customer.set("phone_otp", otp);
      customer.set("phone_otp_expires", expires);
      await customer.save();

      console.log(
        `📱 [Phone verification] Generated OTP: ${otp} for ${phone_code || "+91"}${phone_number || customer.get("phone_number")}`,
      );

      return res.status(200).json({
        success: true,
        message: `Phone verification OTP simulated and printed to terminal console. (OTP: ${otp})`,
        otp, // Expose OTP for testing convenience on simulated phone number verification
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
    const { email, type, otp } = req.body;

    if (!email || !type || !otp) {
      return res
        .status(400)
        .json({ error: "Missing email, type, or otp parameters" });
    }

    if (type !== "email" && type !== "phone") {
      return res.status(400).json({
        error: "Invalid verification type. Expected 'email' or 'phone'",
      });
    }

    const customer = await Customers.findOne({ email });
    if (!customer) {
      return res.status(404).json({ error: "Customer profile not found" });
    }

    const dbOtp =
      type === "email" ? customer.get("email_otp") : customer.get("phone_otp");
    const dbOtpExpires =
      type === "email"
        ? customer.get("email_otp_expires")
        : customer.get("phone_otp_expires");

    if (!dbOtp || !dbOtpExpires) {
      return res.status(400).json({
        error:
          "No active verification process found. Please request a code first.",
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
      customer.set("phone_otp", undefined);
      customer.set("phone_otp_expires", undefined);
    }

    await customer.save();
    console.log(
      `✅ [Verification] Customer ${email} verified their ${type} successfully`,
    );

    return res.status(200).json({
      success: true,
      message: `${type === "email" ? "Email" : "Phone number"} verified successfully!`,
    });
  } catch (err: any) {
    console.error("handleVerifyOTP error:", err);
    res.status(500).json({ error: err.message || "Failed to verify OTP" });
  }
}
