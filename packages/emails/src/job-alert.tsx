import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from '@react-email/components';

interface JobAlertEmailProps {
  name: string;
  jobs: Array<{ title: string; location: string; slug: string }>;
  appUrl?: string;
}

export function JobAlertEmail({ name, jobs, appUrl = 'https://bukzaccounting.co.uk' }: JobAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New jobs matching your profile</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#0D1B3E', padding: '24px', borderRadius: '8px 8px 0 0' }}>
            <Heading style={{ color: '#C9A84C', margin: 0, fontSize: '28px' }}>BUKZ Jobs</Heading>
          </Section>
          <Section style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '0 0 8px 8px' }}>
            <Heading style={{ color: '#0D1B3E', fontSize: '22px' }}>Your Weekly Job Alert</Heading>
            <Text style={{ color: '#4a5568' }}>Hi {name},</Text>
            <Text style={{ color: '#4a5568', lineHeight: '1.6' }}>
              We found {jobs.length} new jobs that match your profile!
            </Text>
            <div style={{ marginTop: '24px' }}>
              {jobs.map((job, i) => (
                <div key={i} style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <Heading style={{ color: '#0D1B3E', fontSize: '16px', margin: '0 0 4px 0' }}>
                    <Link href={`${appUrl}/jobs/${job.slug}`} style={{ color: '#0D1B3E', textDecoration: 'none' }}>
                      {job.title}
                    </Link>
                  </Heading>
                  <Text style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{job.location}</Text>
                </div>
              ))}
            </div>
            <Link
              href={`${appUrl}/jobs`}
              style={{
                display: 'inline-block',
                backgroundColor: '#C9A84C',
                color: '#0D1B3E',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                marginTop: '24px',
              }}
            >
              View All Jobs
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
