import nodemailer from 'nodemailer';
import { env } from '../../config/env';

export interface SendInvitationEmailParams {
  to: string;
  technicianName: string;
  organisationName: string;
  inviterName: string;
  token: string;
  expiresHours: number;
}

export interface SentEmailRecord {
  to: string;
  subject: string;
  acceptanceUrl: string;
  token: string;
  sentAt: Date;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private sentEmailsHistory: SentEmailRecord[] = [];

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });
      console.log(`[EmailService] Nodemailer configured with SMTP host: ${env.SMTP_HOST}`);
    } else {
      console.log(
        '[EmailService] No live SMTP configured. Using development in-memory logger & simulated transporter.'
      );
    }
  }

  public getSentEmails(): SentEmailRecord[] {
    return [...this.sentEmailsHistory];
  }

  public clearSentEmails(): void {
    this.sentEmailsHistory = [];
  }

  public async sendTechnicianInvitation(params: SendInvitationEmailParams): Promise<boolean> {
    const acceptanceUrl = `${env.FRONTEND_URL}/accept-invitation?token=${params.token}`;
    const subject = `Invitation to join GroundOps – ${params.organisationName}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GroundOps Field Operations Invitation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .badge { display: inline-block; background-color: #172554; color: #ffffff; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-size: 24px; color: #0f172a; margin-top: 0; font-weight: 800; }
    p { font-size: 15px; line-height: 24px; color: #334155; margin-bottom: 16px; }
    .info-box { background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748B; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">GroundOps Internal Enterprise</div>
    <h1>Welcome to GroundOps</h1>
    <p>Hello <strong>${params.technicianName}</strong>,</p>
    <p>You have been invited by <strong>${params.inviterName}</strong> to join the field operations maintenance team at <strong>${params.organisationName}</strong>.</p>
    
    <div class="info-box">
      <strong>Your Role:</strong> Field Operations Technician<br>
      <strong>Organisation:</strong> ${params.organisationName}<br>
      <strong>Invitation Valid For:</strong> ${params.expiresHours} Hours
    </div>

    <p>To activate your technician account and create your secure password, please click the button below:</p>
    
    <div style="text-align: center;">
      <a href="${acceptanceUrl}" class="button" target="_blank">Activate Technician Account</a>
    </div>

    <p style="font-size: 13px; color: #64748B;">Or copy and paste this link in your browser:<br><a href="${acceptanceUrl}" style="color: #2563eb; word-break: break-all;">${acceptanceUrl}</a></p>

    <div class="footer">
      This is an internal enterprise invitation from GroundOps. If you were not expecting this invitation, you may ignore this email.
    </div>
  </div>
</body>
</html>
    `;

    const record: SentEmailRecord = {
      to: params.to,
      subject,
      acceptanceUrl,
      token: params.token,
      sentAt: new Date(),
    };
    this.sentEmailsHistory.push(record);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to: params.to,
          subject,
          html,
        });
        console.log(`[EmailService] Invitation email successfully dispatched to ${params.to}`);
        return true;
      } catch (error) {
        console.error(`[EmailService] Failed to send email via SMTP to ${params.to}:`, error);
        // Do not throw; we allow resending and keep local record
        return false;
      }
    } else {
      console.log(`[EmailService: Simulated] Sent invitation email to: ${params.to}`);
      console.log(`[EmailService: Simulated] Acceptance URL: ${acceptanceUrl}`);
      return true;
    }
  }
}

export const emailService = new EmailService();
