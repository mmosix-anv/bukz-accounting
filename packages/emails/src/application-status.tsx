import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components';

interface ApplicationStatusEmailProps {
  candidateName: string;
  jobTitle: string;
  status: string;
  message?: string;
}

export function ApplicationStatusEmail({
  candidateName,
  jobTitle,
  status,
  message,
}: ApplicationStatusEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your application for {jobTitle} has been updated</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#0D1B3E', padding: '24px', borderRadius: '8px 8px 0 0' }}>
            <Heading style={{ color: '#C9A84C', margin: 0, fontSize: '28px' }}>BUKZ Jobs</Heading>
          </Section>
          <Section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '0 0 8px 8px' }}>
            <Heading style={{ color: '#0D1B3E', fontSize: '22px' }}>Application Status Update</Heading>
            <Text style={{ color: '#4a5568' }}>Hi {candidateName},</Text>
            <Text style={{ color: '#4a5568', lineHeight: '1.6' }}>
              Your application for <strong>{jobTitle}</strong> is now <strong>{status}</strong>.
            </Text>
            {message && (
              <Text style={{ color: '#4a5568', lineHeight: '1.6', marginTop: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                {message}
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
