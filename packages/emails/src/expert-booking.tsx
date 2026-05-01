import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from '@react-email/components';

interface ExpertBookingEmailProps {
  name: string;
  expertName: string;
  date: string;
  calLink: string;
}

export function ExpertBookingEmail({
  name,
  expertName,
  date,
  calLink,
}: ExpertBookingEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your consultation with {expertName} is confirmed</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#0D1B3E', padding: '24px', borderRadius: '8px 8px 0 0' }}>
            <Heading style={{ color: '#C9A84C', margin: 0, fontSize: '28px' }}>BUKZ Insight</Heading>
          </Section>
          <Section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '0 0 8px 8px' }}>
            <Heading style={{ color: '#0D1B3E', fontSize: '22px' }}>Consultation Confirmed</Heading>
            <Text style={{ color: '#4a5568' }}>Hi {name},</Text>
            <Text style={{ color: '#4a5568', lineHeight: '1.6' }}>
              Your consultation with <strong>{expertName}</strong> has been scheduled for <strong>{date}</strong>.
            </Text>
            <Link
              href={calLink}
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
              View Booking Details
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
