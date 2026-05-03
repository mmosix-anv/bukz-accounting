import { Resend } from 'resend';

const resend = process.env['RESEND_API_KEY'] ? new Resend(process.env['RESEND_API_KEY']) : null;
const FROM = process.env['EMAIL_FROM'] ?? 'BUKZ <noreply@bukzaccounting.co.uk>';
const APP_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';

async function send(to: string, subject: string, html: string) {
  if (!resend) return;
  await resend.emails.send({ from: FROM, to, subject, html }).catch(() => undefined);
}

export const email = {
  sendWelcome: (to: string, name: string, role: string) => {
    const label = role === 'employer' ? 'employer' : role === 'instructor' ? 'instructor' : 'accounting professional';
    return send(to, 'Welcome to BUKZ Accounting', `<h2>Welcome to BUKZ, ${name}!</h2>
<p>Your account has been created as a ${label}.</p>
<p><a href="${APP_URL}/dashboard">Go to your dashboard</a></p>
<p>— The BUKZ Team</p>`);
  },

  sendApplicationReceived: (to: string, candidateName: string, jobTitle: string, companyName: string) =>
    send(to, `Application received: ${jobTitle}`, `<h2>Application submitted</h2>
<p>Hi ${candidateName},</p>
<p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received.</p>
<p><a href="${APP_URL}/dashboard/applications">Track your applications</a></p>
<p>— The BUKZ Team</p>`),

  sendApplicationStatusUpdate: (to: string, candidateName: string, jobTitle: string, status: string) => {
    const msgs: Record<string, string> = {
      viewed: 'The employer has viewed your application.',
      shortlisted: 'Great news — you have been shortlisted for this role.',
      offered: 'Congratulations! You have received a job offer.',
      rejected: 'Unfortunately, your application has not been taken forward at this time.',
    };
    const msg = msgs[status] ?? `Your application status has been updated to: ${status}.`;
    return send(to, `Application update: ${jobTitle}`, `<h2>Application update</h2>
<p>Hi ${candidateName},</p><p>${msg}</p>
<p>Job: <strong>${jobTitle}</strong></p>
<p><a href="${APP_URL}/dashboard/applications">View all applications</a></p>
<p>— The BUKZ Team</p>`);
  },

  sendCourseEnrolment: (to: string, name: string, courseTitle: string, courseSlug: string, cpdHours: string) =>
    send(to, `You're enrolled: ${courseTitle}`, `<h2>Enrolment confirmed</h2>
<p>Hi ${name},</p>
<p>You are now enrolled in <strong>${courseTitle}</strong> (${Number(cpdHours).toFixed(1)} CPD hours).</p>
<p><a href="${APP_URL}/learn/${courseSlug}">Start learning now</a></p>
<p>— The BUKZ Team</p>`),

  sendCertificate: (to: string, name: string, courseTitle: string, cpdHours: string, downloadUrl: string) =>
    send(to, `Certificate: ${courseTitle}`, `<h2>Congratulations, ${name}!</h2>
<p>You have completed <strong>${courseTitle}</strong> and earned ${Number(cpdHours).toFixed(1)} CPD hours.</p>
<p><a href="${downloadUrl}">Download your certificate (PDF)</a></p>
<p>— The BUKZ Team</p>`),
};
