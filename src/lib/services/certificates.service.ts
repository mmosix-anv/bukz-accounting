import { db } from '@/lib/db';
import { courseCertificates, courses, users } from '@bukz/db';
import { eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function findCertificatesByUser(userId: string) {
  return db
    .select({
      id: courseCertificates.id, issuedAt: courseCertificates.issuedAt,
      certificateUrl: courseCertificates.certificateUrl,
      courseTitle: courses.title, courseSlug: courses.slug, cpdHours: courses.cpdHours,
    })
    .from(courseCertificates)
    .innerJoin(courses, eq(courses.id, courseCertificates.courseId))
    .where(eq(courseCertificates.userId, userId));
}

export async function verifyCertificate(id: string) {
  const [cert] = await db
    .select({
      id: courseCertificates.id, issuedAt: courseCertificates.issuedAt,
      courseTitle: courses.title, cpdHours: courses.cpdHours, holderName: users.name,
    })
    .from(courseCertificates)
    .innerJoin(courses, eq(courses.id, courseCertificates.courseId))
    .innerJoin(users, eq(users.id, courseCertificates.userId))
    .where(eq(courseCertificates.id, id))
    .limit(1);

  if (!cert) throw new Error('Certificate not found');
  return { valid: true, certificate: cert };
}

export async function generateCertificatePdf(id: string): Promise<Buffer> {
  const [cert] = await db
    .select({
      id: courseCertificates.id, issuedAt: courseCertificates.issuedAt,
      courseTitle: courses.title, cpdHours: courses.cpdHours, holderName: users.name,
    })
    .from(courseCertificates)
    .innerJoin(courses, eq(courses.id, courseCertificates.courseId))
    .innerJoin(users, eq(users.id, courseCertificates.userId))
    .where(eq(courseCertificates.id, id))
    .limit(1);

  if (!cert) throw new Error('Certificate not found');

  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]);
  const { width, height } = page.getSize();
  const timesRoman = await doc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);

  const navy = rgb(0.051, 0.106, 0.243);
  const gold = rgb(0.788, 0.659, 0.298);
  const white = rgb(1, 1, 1);

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.95, 0.95, 0.95) });
  page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, color: white });
  page.drawRectangle({ x: 20, y: 20, width: width - 40, height: 8, color: navy });
  page.drawRectangle({ x: 20, y: height - 28, width: width - 40, height: 8, color: navy });

  page.drawText('BUKZ', { x: 50, y: height - 80, size: 36, font: timesBold, color: navy });
  page.drawText('ACCOUNTING', { x: 50, y: height - 100, size: 12, font: helvetica, color: gold });
  page.drawLine({ start: { x: 50, y: height - 115 }, end: { x: width - 50, y: height - 115 }, thickness: 1, color: gold });

  page.drawText('Certificate of Completion', { x: width / 2 - 140, y: height - 165, size: 28, font: timesBold, color: navy });
  page.drawText('This is to certify that', { x: width / 2 - 80, y: height - 210, size: 14, font: timesRoman, color: rgb(0.3, 0.3, 0.3) });

  const holderName = cert.holderName ?? 'Candidate';
  page.drawText(holderName, { x: width / 2 - holderName.length * 11, y: height - 260, size: 32, font: timesBold, color: navy });
  page.drawLine({ start: { x: 150, y: height - 272 }, end: { x: width - 150, y: height - 272 }, thickness: 1, color: gold });
  page.drawText('has successfully completed', { x: width / 2 - 100, y: height - 305, size: 14, font: timesRoman, color: rgb(0.3, 0.3, 0.3) });

  const titleLines = wrapText(cert.courseTitle ?? '', 50);
  titleLines.forEach((line, i) => {
    page.drawText(line, { x: width / 2 - line.length * 9, y: height - 345 - i * 30, size: 22, font: timesBold, color: navy });
  });

  const cpdY = height - 345 - titleLines.length * 30 - 20;
  page.drawRectangle({ x: width / 2 - 80, y: cpdY - 10, width: 160, height: 36, color: navy });
  page.drawText(`${cert.cpdHours} CPD Hours`, { x: width / 2 - 55, y: cpdY + 4, size: 14, font: timesBold, color: white });

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString('en-GB', { dateStyle: 'long' });
  page.drawText(`Issued: ${issuedDate}`, { x: 50, y: 70, size: 11, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
  page.drawText(`Certificate ID: ${cert.id}`, { x: 50, y: 52, size: 9, font: helvetica, color: rgb(0.6, 0.6, 0.6) });
  page.drawText('Verify at bukzaccounting.co.uk/verify', { x: width - 250, y: 52, size: 9, font: helvetica, color: rgb(0.6, 0.6, 0.6) });

  return Buffer.from(await doc.save());
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) { if (current) lines.push(current.trim()); current = word; }
    else { current = current ? current + ' ' + word : word; }
  }
  if (current) lines.push(current.trim());
  return lines;
}
