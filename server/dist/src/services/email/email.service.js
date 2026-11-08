"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../../config/env");
class EmailService {
    transporter = null;
    sentEmailsHistory = [];
    constructor() {
        if (env_1.env.SMTP_HOST && env_1.env.SMTP_USER && env_1.env.SMTP_PASSWORD) {
            this.transporter = nodemailer_1.default.createTransport({
                host: env_1.env.SMTP_HOST,
                port: env_1.env.SMTP_PORT,
                secure: env_1.env.SMTP_PORT === 465,
                auth: {
                    user: env_1.env.SMTP_USER,
                    pass: env_1.env.SMTP_PASSWORD,
                },
            });
            console.log(`[EmailService] Nodemailer configured with SMTP host: ${env_1.env.SMTP_HOST}`);
        }
        else {
            console.log('[EmailService] No live SMTP configured. Using development in-memory logger & simulated transporter.');
        }
    }
    getSentEmails() {
        return [...this.sentEmailsHistory];
    }
    clearSentEmails() {
        this.sentEmailsHistory = [];
    }
    async sendTechnicianInvitation(params) {
        const acceptanceUrl = `${env_1.env.FRONTEND_URL}/accept-invitation?token=${params.token}`;
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
        const record = {
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
                    from: env_1.env.SMTP_FROM,
                    to: params.to,
                    subject,
                    html,
                });
                console.log(`[EmailService] Invitation email successfully dispatched to ${params.to}`);
                return true;
            }
            catch (error) {
                console.error(`[EmailService] Failed to send email via SMTP to ${params.to}:`, error);
                // Do not throw; we allow resending and keep local record
                return false;
            }
        }
        else {
            console.log(`[EmailService: Simulated] Sent invitation email to: ${params.to}`);
            console.log(`[EmailService: Simulated] Acceptance URL: ${acceptanceUrl}`);
            return true;
        }
    }
}
exports.emailService = new EmailService();
