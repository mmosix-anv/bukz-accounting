import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components';

interface CourseEnrolmentEmailProps {
  name: string;
  courseTitle: string;
  cpdHours: number;
  instructorName: string;
}

export function CourseEnrolmentEmail({
  name,
  courseTitle,
  cpdHours,
  instructorName,
}: CourseEnrolmentEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re enrolled in {courseTitle}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#0D1B3E', padding: '24px', borderRadius: '8px 8px 0 0' }}>
            <Heading style={{ color: '#C9A84C', margin: 0, fontSize: '28px' }}>BUKZ Learn</Heading>
          </Section>
          <Section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '0 0 8px 8px' }}>
            <Heading style={{ color: '#0D1B3E', fontSize: '22px' }}>Enrolment Confirmed</Heading>
            <Text style={{ color: '#4a5568' }}>Hi {name},</Text>
            <Text style={{ color: '#4a5568', lineHeight: '1.6' }}>
              You&apos;re now enrolled in <strong>{courseTitle}</strong> by {instructorName}.
              This course awards <strong>{cpdHours} CPD hours</strong> upon completion.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
