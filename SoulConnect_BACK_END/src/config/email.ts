import nodemailer from "nodemailer";

export const EMAIL_TRIGGER_ENABLE_FLAG = true;

export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER || "karthimailu@gmail.com",
      pass: process.env.SMTP_PASS || "zizbzdtzjubexmbx",
    },
    tls: {
      rejectUnauthorized: false,
    },
    logger: true,
    debug: true,
  });
};
