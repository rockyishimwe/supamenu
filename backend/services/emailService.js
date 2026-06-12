// backend/services/emailService.js
// Handles transactional email sending via nodemailer.
// Configure SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in .env

const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

/** Lazily create the transporter so the app boots without a valid SMTP config. */
function getTransporter() {
  if (transporter) return transporter;

  const { host, port, user, pass } = config.SMTP;

  // If no credentials, use Ethereal (dev-only auto-created account)
  if (!user || !pass) {
    // Return a placeholder — won't send but won't crash either
    return nodemailer.createTransport({
      host: host || 'smtp.ethereal.email',
      port: port || 587,
      secure: false,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send an email.
 * @param {string} to       Recipient
 * @param {string} subject  Subject line
 * @param {string} html     HTML body
 * @returns {{ success: boolean, messageId?: string, error?: string }}
 */
async function sendEmail(to, subject, html) {
  const { from } = config.SMTP;
  const transport = getTransporter();

  try {
    const info = await transport.sendMail({ from, to, subject, html });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send failed:', err.message);
    // Don't throw — email failure shouldn't crash the request
    return { success: false, error: err.message };
  }
}

/**
 * Build a minimal HTML email template.
 */
function emailTemplate(title, bodyContent, ctaUrl, ctaLabel) {
  const brandColor = '#FF6B00';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f1115;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1c23;border-radius:16px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">
          <tr>
            <td align="center" style="padding:32px 24px 8px;">
              <span style="font-size:28px;font-weight:800;color:#ffffff;">DineFlow</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 24px;">
              <h1 style="color:#ffffff;font-size:20px;margin:0 0 8px;">${title}</h1>
              <div style="color:#9ca3af;font-size:14px;line-height:1.6;">${bodyContent}</div>
              ${ctaUrl ? `
              <div style="margin-top:24px;text-align:center;">
                <a href="${ctaUrl}" style="display:inline-block;padding:12px 28px;background:${brandColor};color:#ffffff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
                  ${ctaLabel}
                </a>
              </div>` : ''}
              <p style="color:#6b7280;font-size:12px;margin-top:24px;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send email verification message.
 * @param {{ name: string, email: string }} user
 * @param {string} token — raw verification token
 * @param {string} origin — base URL for the verification link
 */
async function sendVerificationEmail(user, token, origin) {
  const baseUrl = origin || 'http://localhost:3000';
  const link = `${baseUrl}/verify-email?token=${token}`;
  const html = emailTemplate(
    'Verify your email',
    `<p>Hi ${user.name},</p><p>Thanks for joining DineFlow! Verify your email address to access all features.</p>`,
    link,
    'Verify Email'
  );

  return sendEmail(user.email, 'Verify your DineFlow account', html);
}

/**
 * Send password reset email.
 * @param {{ name: string, email: string }} user
 * @param {string} token — raw reset token
 * @param {string} origin — base URL for the reset link
 */
async function sendPasswordResetEmail(user, token, origin) {
  const baseUrl = origin || 'http://localhost:3000';
  const link = `${baseUrl}/reset-password?token=${token}`;
  const html = emailTemplate(
    'Reset your password',
    `<p>Hi ${user.name},</p><p>We received a request to reset your DineFlow password. Click the button below to set a new one. This link expires in 1 hour.</p>`,
    link,
    'Reset Password'
  );

  return sendEmail(user.email, 'Reset your DineFlow password', html);
}

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
