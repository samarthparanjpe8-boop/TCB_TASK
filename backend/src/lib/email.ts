import nodemailer from "nodemailer";
import { config } from "../config.js";

// Note: To send real emails, the USER must configure these env vars:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendTeacherApprovalEmail(userEmail: string, userId: string, token: string, overrideBaseUrl?: string) {
  const adminEmail = "samarthparanjpe8@gmail.com";
  const baseUrl = overrideBaseUrl || config.backendUrl;
  const approvalLink = `${baseUrl}/api/v1/auth/approve-teacher?userId=${userId}&token=${token}`;

  const mailOptions = {
    from: `"ClassroomIQ Admin" <${process.env.SMTP_USER || "noreply@school.edu"}>`,
    to: adminEmail,
    subject: "Teacher Approval Required",
    html: `
      <h2>New Teacher Registration</h2>
      <p>A new user has registered as a teacher and requires your approval.</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p>Click the link below to approve this teacher:</p>
      <a href="${approvalLink}" style="display:inline-block;padding:10px 20px;background:#0284c7;color:#fff;text-decoration:none;border-radius:4px;">Approve Teacher</a>
      <p>If the button doesn't work, copy and paste this link: ${approvalLink}</p>
    `,
  };

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("[Email] SMTP credentials not set. Logging approval link instead:");
      console.log(`[APPROVAL LINK]: ${approvalLink}`);
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Approval email sent to ${adminEmail}`);
  } catch (error) {
    console.error("[Email] Failed to send approval email:", error);
    // Even if email fails, we log the link so the admin can still approve manually
    console.log(`[APPROVAL LINK]: ${approvalLink}`);
  }
}
