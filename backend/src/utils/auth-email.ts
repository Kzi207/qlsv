import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const getNodemailer = () => require('nodemailer');

let transporter: any | null | undefined;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getTransporter = () => {
  if (transporter !== undefined) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    transporter = null;
    return transporter;
  }

  try {
    const nodemailer = getNodemailer();
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  } catch (error) {
    console.error('[AuthEmail] Failed to create transporter:', error);
    transporter = null;
  }

  return transporter;
};

const getFromAddress = () => {
  const fromEmail = process.env.MAIL_FROM || process.env.GMAIL_USER;
  if (!fromEmail) return undefined;
  return `"Hệ Thống QLSV" <${fromEmail}>`;
};

export const sendPasswordResetCodeEmail = async (input: {
  to: string;
  studentName: string;
  studentCode: string;
  code: string;
  expiresInMinutes: number;
}) => {
  const activeTransporter = getTransporter();
  const from = getFromAddress();

  if (!activeTransporter || !from) {
    return {
      sent: false,
      message: 'Hệ thống chưa cấu hình gửi email Gmail.',
    };
  }

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #0f172a; line-height: 1.65;">
        <p>Chào <strong>${escapeHtml(input.studentName)}</strong> (${escapeHtml(input.studentCode)}),</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản QLSV.</p>
        <div style="margin: 20px 0; padding: 24px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; text-align: center;">
          <p style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; color: #1d4ed8; font-weight: 700;">Mã xác thực</p>
          <p style="margin: 0; font-size: 32px; letter-spacing: 0.35em; font-weight: 700; color: #1e3a8a;">${escapeHtml(input.code)}</p>
        </div>
        <p>Mã có hiệu lực trong <strong>${input.expiresInMinutes} phút</strong>.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email để giữ an toàn cho tài khoản.</p>
        <p>Trân trọng,<br><strong>Hệ thống QLSV</strong></p>
      </div>
    `;

    await activeTransporter.sendMail({
      from,
      to: input.to,
      subject: `[QLSV] Mã xác thực đặt lại mật khẩu - ${input.studentCode}`,
      html,
    });

    return {
      sent: true,
      message: `Đã gửi mã xác thực đến ${input.to}.`,
    };
  } catch (error) {
    console.error('[AuthEmail] Failed to send password reset email:', error);
    return {
      sent: false,
      message: 'Không thể gửi email xác thực. Vui lòng thử lại sau.',
    };
  }
};
