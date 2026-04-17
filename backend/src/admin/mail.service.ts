import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const logger = new Logger('MailService');
const APPROVAL_CONTACT_EMAIL = 'contact@pharmaflowdz.com';

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export async function sendApprovalEmail(toEmail: string, companyName?: string) {
  const transporter = getTransporter();
  const sender = APPROVAL_CONTACT_EMAIL;

  if (!transporter) {
    logger.warn(`Skipping approval email for ${toEmail}: Gmail credentials are not configured.`);
    return;
  }

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

  await transporter.sendMail({
    from: `"Plateforme PHARMA FLOW" <${sender}>`,
    replyTo: sender,
    to: toEmail,
    subject: 'Votre compte a ete approuve',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#16a34a;">Felicitations ${companyName ?? ''} !</h2>
        <p style="font-size:16px;color:#374151;">
          Votre compte sur notre plateforme a ete <strong>approuve</strong> par l'administrateur.
        </p>
        <p style="font-size:16px;color:#374151;">
          Vous pouvez maintenant vous connecter et acceder a toutes les fonctionnalites.
        </p>
        <a href="${frontendUrl}/auth/signin"
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Se connecter
        </a>
        <p style="margin-top:30px;font-size:13px;color:#9ca3af;">
          Des questions ? Contactez-nous a <a href="mailto:${sender}">${sender}</a>
        </p>
      </div>
    `,
  });
}
