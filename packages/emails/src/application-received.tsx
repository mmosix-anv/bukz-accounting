import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components';

interface ApplicationReceivedEmailProps {
  employerName: string;
  jobTitle: string;
  candidateName: string;
}

export function ApplicationReceivedEmail({
  employerName,
  jobTitle,
  candidateName,
}: ApplicationReceivedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New application for {jobTitle} from {candidateName}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#0D1B3E', padding: '24px', borderRadius: '8px 8px 0 0' }}>
            <Heading style={{ color: '#C9A84C', margin: 0, fontSize: '28px' }}>BUKZ Jobs</Heading>
          </Section>
          <Section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '0 0 8px 8px' }}>
            <Heading style={{ color: '#0D1B3E', fontSize: '22px' }}>New Application Received</Heading>
            <Text style={{ color: '#4a5568' }}>Hi {employerName},</Text>
            <Text style={{ color: '#4a5568', lineHeight: '1.6' }}>
              <strong>{candidateName}</strong> has applied for your <strong>{jobTitle}</strong> position.
              Log in to your employer dashboard to review their application.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
