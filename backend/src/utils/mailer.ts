import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const getNodemailer = () => require('nodemailer');

let transporter: any | null | undefined;

/**
 * Shared SMTP transporter singleton.
 * Uses connection pooling to reuse TCP connections across emails,
 * significantly reducing latency on weak servers.
 */
export const getTransporter = () => {
  if (transporter !== undefined) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('[Mailer] Missing GMAIL_USER or GMAIL_APP_PASSWORD, skip sending mail');
    transporter = null;
    return transporter;
  }

  try {
    const nodemailer = getNodemailer();
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      pool: true,          // Enable connection pooling
      maxConnections: 3,   // Up to 3 simultaneous connections
      maxMessages: 50,     // Up to 50 messages per connection before recycling
      rateDelta: 1000,     // 1 second window for rate limiting
      rateLimit: 5,        // Max 5 messages per rateDelta
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log('[Mailer] Pooled transporter initialized for', user);
  } catch (err) {
    console.error('[Mailer] Failed to create transporter:', err);
    transporter = null;
  }

  return transporter;
};

export const getFromAddress = (displayName = 'Hệ Thống QLSV') => {
  const fromEmail = process.env.MAIL_FROM || process.env.GMAIL_USER;
  if (!fromEmail) return undefined;
  return `"${displayName}" <${fromEmail}>`;
};

export const getMailerContext = (displayName?: string) => {
  const activeTransporter = getTransporter();
  const from = getFromAddress(displayName);

  if (!activeTransporter) {
    return {
      transporter: null,
      from: undefined,
      error: 'Hệ thống chưa cấu hình GMAIL_USER hoặc GMAIL_APP_PASSWORD.',
    };
  }

  if (!from) {
    return {
      transporter: null,
      from: undefined,
      error: 'Hệ thống chưa cấu hình MAIL_FROM hoặc GMAIL_USER.',
    };
  }

  return { transporter: activeTransporter, from, error: null };
};

export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    const activeTransporter = getTransporter();
    if (!activeTransporter) return false;
    await activeTransporter.verify();
    console.log('[Mailer] Configuration verified successfully');
    return true;
  } catch (error) {
    console.error('[Mailer] Configuration error:', error);
    return false;
  }
};

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
