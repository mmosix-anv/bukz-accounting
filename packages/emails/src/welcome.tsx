import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  role: 'candidate' | 'employer' | 'instructor';
}

export function WelcomeEmail({ name, role }: WelcomeEmailProps) {
  const roleMessage = {
    candidate: 'Start exploring accounting & finance jobs tailored to your profile.',
    employer: 'Post your first job and reach thousands of qualified accounting professionals.',
    instructor: 'Create your first CPD course and share your expertise.',
  }[role];

  return (
    <Html>
      <Head />
      <Preview>Welcome to BUKZ — {roleMessage}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#0D1B3E', padding: '24px', borderRadius: '8px 8px 0 0' }}>
            <Heading style={{ color: '#C9A84C', margin: 0, fontSize: '28px' }}>BUKZ</Heading>
          </Section>
          <Section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '0 0 8px 8px' }}>
            <Heading style={{ color: '#0D1B3E', fontSize: '24px' }}>Welcome, {name}!</Heading>
            <Text style={{ color: '#4a5568', lineHeight: '1.6' }}>{roleMessage}</Text>
            <Text style={{ color: '#4a5568', lineHeight: '1.6' }}>
              BUKZ is the UK&apos;s specialist platform for accounting &amp; finance professionals.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
