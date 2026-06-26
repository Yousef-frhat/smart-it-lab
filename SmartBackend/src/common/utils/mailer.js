import nodemailer from "nodemailer";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Create reusable transporter.
 * Uses Mailtrap SMTP if credentials are set, otherwise logs to console.
 */
function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

const transporter = createTransporter();

function brandedHtml(heading, body) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0F172A;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F172A;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1E293B;border-radius:12px;padding:40px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <span style="color:#00FF41;font-size:24px;font-weight:bold;font-family:monospace;">⚡ Smart IT Lab</span>
        </td></tr>
        <tr><td align="center" style="padding-bottom:16px;">
          <h1 style="color:#E2E8F0;margin:0;font-size:22px;">${heading}</h1>
        </td></tr>
        <tr><td style="color:#94A3B8;font-size:14px;line-height:1.7;">
          ${body}
        </td></tr>
        <tr><td align="center" style="padding-top:32px;border-top:1px solid #334155;margin-top:24px;">
          <span style="color:#64748B;font-size:12px;">© ${new Date().getFullYear()} Smart IT Lab. All rights reserved.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(to, token) {
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;
  const html = brandedHtml(
    "Verify Your Email",
    `<p style="color:#E2E8F0;">Welcome to Smart IT Lab! Please verify your email address to get started.</p>
     <div style="text-align:center;margin:24px 0;">
       <a href="${link}" style="display:inline-block;padding:12px 32px;background:#3B82F6;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Verify Email</a>
     </div>
     <p>Or copy this link: <a href="${link}" style="color:#3B82F6;word-break:break-all;">${link}</a></p>
     <p>This link expires in 24 hours.</p>`
  );

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Smart IT Lab" <noreply@smartitlab.com>',
      to,
      subject: "Verify your Smart IT Lab email",
      html,
    });
  } else {
    console.log(`\n📧 [MAILER] Verification email for ${to}`);
    console.log(`   Link:  ${link}\n`);
  }
}

export async function sendPasswordResetEmail(to, token) {
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;
  const html = brandedHtml(
    "Reset Your Password",
    `<p style="color:#E2E8F0;">We received a request to reset your password. Click below to choose a new one.</p>
     <div style="text-align:center;margin:24px 0;">
       <a href="${link}" style="display:inline-block;padding:12px 32px;background:#F59E0B;color:#0F172A;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
     </div>
     <p>Or copy this link: <a href="${link}" style="color:#3B82F6;word-break:break-all;">${link}</a></p>
     <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`
  );

  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Smart IT Lab" <noreply@smartitlab.com>',
      to,
      subject: "Reset your Smart IT Lab password",
      html,
    });
  } else {
    console.log(`\n📧 [MAILER] Password reset email for ${to}`);
    console.log(`   Link:  ${link}\n`);
  }
}
