import { Request, Response } from "express";
import { sendGridEmail } from "../config/email";

export async function handleSendEmail(req: Request, res: Response) {
  const { to, subject, message } = req.body;

  try {
    const emailTo = to || "karthikeyanbalan.pkxlabs@gmail.com";
    const emailSubject = subject || "Test Email from SendGrid API";

    let htmlContent = "";
    let textContent = "";

    if (message) {
      textContent = message;

      if (message.trim().startsWith("<")) {
        htmlContent = message;
      } else {
        htmlContent = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
                    line-height:1.6;
                    color:#333;
                    max-width:600px;
                    margin:0 auto;
                    padding:20px;
                    border:1px solid #f0f0f0;
                    border-radius:8px;
                    background:#ffffff;">

          <div style="background:linear-gradient(135deg,#F2688C,#7C3AED);
                      padding:20px;
                      text-align:center;
                      border-radius:6px 6px 0 0;">
            <h2 style="margin:0;color:#fff;">
              Soul Connect
            </h2>
          </div>

          <div style="padding:24px;font-size:15px;">
            ${message.replace(/\n/g, "<br/>")}
          </div>

          <div style="border-top:1px solid #eee;
                      margin-top:20px;
                      padding-top:15px;
                      text-align:center;
                      font-size:12px;
                      color:#888;">
            This is an automated notification.<br/>
            Please do not reply directly.
          </div>

        </div>
        `;
      }
    } else {
      textContent = "Hello,\nThis is a test email sent from SendGrid API.";
      htmlContent = `
        <h2>Hello</h2>
        <p>This is a test email sent from SendGrid API.</p>
      `;
    }

    const response = await sendGridEmail({
      to: emailTo,
      cc: "karthikeyanbalan.pkxlabs@gmail.com",
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
    });

    console.log("====================================");
    console.log("✅ SendGrid Email Sent Successfully");
    console.log("Response Status Code:", response[0]?.statusCode);
    console.log("====================================");

    return res.status(200).json({
      success: true,
      message: "Email sent successfully via SendGrid API",
      statusCode: response[0]?.statusCode,
      headers: response[0]?.headers,
    });
  } catch (error: any) {
    console.error("====================================");
    console.error("❌ SendGrid Email Exception");
    console.error("Message      :", error.message);
    console.error("Code         :", error.code);
    console.error("Response     :", error.response?.body || error.response);
    console.error("Stack        :", error.stack);
    console.error("====================================");

    return res.status(500).json({
      success: false,
      message: error.message,
      code: error.code,
      details: error.response?.body || error.response,
    });
  }
}
