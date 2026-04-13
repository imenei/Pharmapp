// src/admin/mail.service.ts
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendApprovalEmail(toEmail: string, companyName?: string) {
  await transporter.sendMail({
    from: `"Plateforme PHARMA FLOW" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Votre compte a été approuvé ✅',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#16a34a;">Félicitations ${companyName ?? ''} ! 🎉</h2>
        <p style="font-size:16px;color:#374151;">
          Votre compte sur notre plateforme a été <strong>approuvé</strong> par l'administrateur.
        </p>
        <p style="font-size:16px;color:#374151;">
          Vous pouvez dès maintenant vous connecter et accéder à toutes les fonctionnalités.
        </p>
        <a href="${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/login"
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Se connecter →
        </a>
        <p style="margin-top:30px;font-size:13px;color:#9ca3af;">
          Des questions ? Contactez-nous à <a href="mailto:${process.env.GMAIL_USER}">${process.env.GMAIL_USER}</a>
        </p>
      </div>
    `,
  });
}