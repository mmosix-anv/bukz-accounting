import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from '@react-email/components';

interface CourseCertificateEmailProps {
  name: string;
  courseTitle: string;
  certificateUrl: string;
}

export function CourseCertificateEmail({
  name,
  courseTitle,
  certificateUrl,
}: CourseCertificateEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your course certificate is ready!</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#0D1B3E', padding: '24px', borderRadius: '8px 8px 0 0' }}>
            <Heading style={{ color: '#C9A84C', margin: 0, fontSize: '28px' }}>BUKZ Learn</Heading>
          </Section>
          <Section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '0 0 8px 8px' }}>
            <Heading style={{ color: '#0D1B3E', fontSize: '22px' }}>Congratulations, {name}!</Heading>
            <Text style={{ color: '#4a5568', lineHeight: '1.6' }}>
              You&apos;ve successfully completed <strong>{courseTitle}</strong>.
            </Text>
            <Text style={{ color: '#4a5568', lineHeight: '1.6', marginTop: '20px' }}>
              Your certificate is ready to download!
            </Text>
            <Link
              href={certificateUrl}
              style={{
                display: 'inline-block',
                backgroundColor: '#C9A84C',
                color: '#0D1B3E',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                marginTop: '20px',
              }}
            >
              Download Certificate
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
