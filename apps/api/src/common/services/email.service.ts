import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env['RESEND_API_KEY'];
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = process.env['EMAIL_FROM'] ?? 'BUKZ <noreply@bukz.co.uk>';
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) return;
    await this.resend.emails.send({ from: this.from, to, subject, html }).catch(() => undefined);
  }

  async sendWelcome(to: string, name: string, role: string): Promise<void> {
    const roleLabel = role === 'employer' ? 'employer' : role === 'instructor' ? 'instructor' : 'accounting professional';
    await this.send(
      to,
      'Welcome to BUKZ Accounting',
      `<h2>Welcome to BUKZ, ${name}!</h2>
       <p>Your account has been created as a ${roleLabel}.</p>
       <p>Get started: <a href="${process.env['NEXT_PUBLIC_APP_URL']}/dashboard">Go to your dashboard</a></p>
       <p>— The BUKZ Team</p>`,
    );
  }

  async sendApplicationReceived(
    to: string,
    candidateName: string,
    jobTitle: string,
    companyName: string,
  ): Promise<void> {
    await this.send(
      to,
      `Application received: ${jobTitle}`,
      `<h2>Application submitted</h2>
       <p>Hi ${candidateName},</p>
       <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received.</p>
       <p>You can track the status in your <a href="${process.env['NEXT_PUBLIC_APP_URL']}/dashboard/applications">applications dashboard</a>.</p>
       <p>Good luck!</p>
       <p>— The BUKZ Team</p>`,
    );
  }

  async sendApplicationStatusUpdate(
    to: string,
    candidateName: string,
    jobTitle: string,
    status: string,
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      viewed: 'The employer has viewed your application.',
      shortlisted: 'Great news — you have been shortlisted for this role.',
      offered: 'Congratulations! You have received a job offer.',
      rejected: 'Unfortunately, your application has not been taken forward at this time.',
    };
    const msg = statusMessages[status] ?? `Your application status has been updated to: ${status}.`;

    await this.send(
      to,
      `Application update: ${jobTitle}`,
      `<h2>Application update</h2>
       <p>Hi ${candidateName},</p>
       <p>${msg}</p>
       <p>Job: <strong>${jobTitle}</strong></p>
       <p><a href="${process.env['NEXT_PUBLIC_APP_URL']}/dashboard/applications">View all applications</a></p>
       <p>— The BUKZ Team</p>`,
    );
  }

  async sendCourseEnrolment(
    to: string,
    name: string,
    courseTitle: string,
    courseSlug: string,
    cpdHours: string,
  ): Promise<void> {
    await this.send(
      to,
      `You're enrolled: ${courseTitle}`,
      `<h2>Enrolment confirmed</h2>
       <p>Hi ${name},</p>
       <p>You are now enrolled in <strong>${courseTitle}</strong> (${Number(cpdHours).toFixed(1)} CPD hours).</p>
       <p><a href="${process.env['NEXT_PUBLIC_APP_URL']}/learn/${courseSlug}">Start learning now</a></p>
       <p>— The BUKZ Team</p>`,
    );
  }

  async sendCertificate(
    to: string,
    name: string,
    courseTitle: string,
    cpdHours: string,
    downloadUrl: string,
  ): Promise<void> {
    await this.send(
      to,
      `Certificate: ${courseTitle}`,
      `<h2>Congratulations, ${name}!</h2>
       <p>You have completed <strong>${courseTitle}</strong> and earned ${Number(cpdHours).toFixed(1)} CPD hours.</p>
       <p><a href="${downloadUrl}">Download your certificate (PDF)</a></p>
       <p>— The BUKZ Team</p>`,
    );
  }

  async sendExpertBookingConfirmation(
    to: string,
    candidateName: string,
    expertName: string,
  ): Promise<void> {
    await this.send(
      to,
      `Booking confirmed with ${expertName}`,
      `<h2>Consultation booked</h2>
       <p>Hi ${candidateName},</p>
       <p>Your consultation with <strong>${expertName}</strong> has been booked via Cal.com.</p>
       <p>Check your calendar for the meeting details.</p>
       <p><a href="${process.env['NEXT_PUBLIC_APP_URL']}/experts">Browse more experts</a></p>
       <p>— The BUKZ Team</p>`,
    );
  }
}
