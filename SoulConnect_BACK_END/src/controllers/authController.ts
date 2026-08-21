import { Request, Response } from "express";
import crypto from "crypto";
import { getMasterAdminClient } from "../config/keycloak-admin";
import { sendGridEmail } from "../config/email";

const TOKEN_SECRET = process.env.SESSION_SECRET || "soul-connect-secret-key-2026";

/**
 * Helper: Generate secure signed token for password reset (valid for 30 minutes)
 */
export function generateResetToken(userId: string, email: string): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes expiration
  const payload = `${userId}:${email}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${signature}`).toString("base64url");
  return { token, expiresAt };
}

/**
 * Helper: Verify signed reset token
 */
export function verifyResetToken(token: string): { valid: boolean; userId?: string; email?: string; reason?: string } {
  if (!token) {
    return { valid: false, reason: "Missing reset token." };
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 4) {
      return { valid: false, reason: "Invalid reset token format." };
    }

    const [userId, email, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    // Check expiration
    if (Date.now() > expiresAt) {
      return { valid: false, reason: "Reset link has expired. Please request a new password reset." };
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(`${userId}:${email}:${expiresAtStr}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, reason: "Invalid or tampered reset token." };
    }

    return { valid: true, userId, email };
  } catch (err) {
    return { valid: false, reason: "Malformed reset token." };
  }
}

/**
 * Handle Forgot Password request
 */
export async function handleForgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  // Negative Flow 1: Missing or empty email
  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Negative Flow 2: Email regex format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address format (e.g. name@example.com).",
    });
  }

  try {
    console.log(`🔍 [Forgot Password] Searching for user in Keycloak: ${cleanEmail}`);
    const kcAdminClient = await getMasterAdminClient();

    // Search user in Keycloak by email
    const users = await kcAdminClient.users.find({ email: cleanEmail, exact: true });

    // Negative Flow 3: User not found in Keycloak
    if (!users || users.length === 0) {
      console.warn(`⚠️ [Forgot Password] User not found in Keycloak: ${cleanEmail}`);
      return res.status(404).json({
        success: false,
        message: "No account found with this email address. Please check and try again.",
      });
    }

    const targetUser = users[0];

    // Negative Flow 4: Disabled user account
    if (targetUser.enabled === false) {
      console.warn(`⚠️ [Forgot Password] User account is disabled: ${cleanEmail}`);
      return res.status(403).json({
        success: false,
        message: "This account has been disabled. Please contact customer support.",
      });
    }

    console.log(`✅ [Forgot Password] User found (ID: ${targetUser.id}). Generating reset URL...`);

    // Generate secure signed reset token
    const { token } = generateResetToken(targetUser.id as string, cleanEmail);

    // Determine domain URL (frontend app)
    const domainUrl = process.env.FRONTEND_URL || "https://soulconect.com";
    const resetUrl = `${domainUrl}/reset_password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    console.log(`🔗 Generated Reset URL: ${resetUrl}`);

    // Send email notification via SendGrid API
    let sendgridEmailSent = false;
    try {
      const userName = targetUser.firstName
        ? `${targetUser.firstName} ${targetUser.lastName || ""}`.trim()
        : targetUser.username || "Member";

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #F2688C, #7C3AED); padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Soul Connect</h2>
            <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">Password Reset Request</p>
          </div>

          <div style="padding: 28px 20px; color: #333333; line-height: 1.6;">
            <p style="font-size: 15px; font-weight: 600; margin-top: 0;">Hello ${userName},</p>
            <p style="font-size: 14px; color: #4b4468;">We received a request to reset your password for your Soul Connect account.</p>
            <p style="font-size: 14px; color: #4b4468;">Click the button below to set a new password. This link is valid for 30 minutes.</p>

            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #F2688C, #7C3AED); color: #ffffff; padding: 12px 28px; border-radius: 24px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                Reset Password ✦
              </a>
            </div>

            <p style="font-size: 12px; color: #888888; border-top: 1px solid #eee; padding-top: 16px;">
              If you did not request a password reset, please ignore this email or contact support. Your password will remain unchanged.
            </p>
          </div>

          <div style="text-align: center; font-size: 11px; color: #aaaaaa; padding-top: 10px;">
            &copy; ${new Date().getFullYear()} Soul Connect. All rights reserved.
          </div>
        </div>
      `;

      await sendGridEmail({
        to: cleanEmail,
        subject: "Reset Your Password - Soul Connect",
        text: `Hello ${userName},\n\nWe received a request to reset your password for Soul Connect. Please visit ${resetUrl} to reset your password.`,
        html: htmlContent,
      });

      sendgridEmailSent = true;
      console.log(`✅ [Forgot Password] SendGrid Email API dispatched successfully to ${cleanEmail}`);
    } catch (sgErr: any) {
      console.error(`❌ [Forgot Password] SendGrid Email dispatch error:`, sgErr.message || sgErr);
    }

    return res.status(200).json({
      success: true,
      message: `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox.`,
      email: cleanEmail,
      resetUrl,
    });

  } catch (error: any) {
    console.error("❌ [Forgot Password] Internal Exception:", error.message || error);
    const detailMsg = error.response?.data?.errorMessage || error.message || "Failed to process forgot password request";
    return res.status(500).json({
      success: false,
      message: "Unable to process password reset at this time. Please try again later.",
      details: detailMsg,
    });
  }
}

/**
 * Handle Reset Password request (updates password in Keycloak)
 */
export async function handleResetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;

  // Negative Flow 1: Missing token or password
  if (!token || typeof token !== "string") {
    return res.status(400).json({
      success: false,
      message: "Missing reset token.",
    });
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }

  // Verify Token
  const tokenData = verifyResetToken(token);
  if (!tokenData.valid || !tokenData.userId) {
    return res.status(400).json({
      success: false,
      message: tokenData.reason || "Invalid or expired reset link. Please request a new password reset.",
    });
  }

  try {
    console.log(`🔒 [Reset Password] Resetting password for Keycloak User ID: ${tokenData.userId}`);
    const kcAdminClient = await getMasterAdminClient();

    // Reset user password in Keycloak
    await kcAdminClient.users.resetPassword({
      id: tokenData.userId,
      credential: {
        type: "password",
        value: newPassword,
        temporary: false,
      },
    });

    console.log(`✅ [Reset Password] Password updated successfully in Keycloak for User ID: ${tokenData.userId}`);

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully! You can now sign in with your new password.",
    });

  } catch (error: any) {
    console.error("❌ [Reset Password] Error resetting password in Keycloak:", error.message || error);
    const detailMsg = error.response?.data?.errorMessage || error.message || "Failed to reset password";
    return res.status(500).json({
      success: false,
      message: "Unable to update password. Please try requesting a new reset link.",
      details: detailMsg,
    });
  }
}
