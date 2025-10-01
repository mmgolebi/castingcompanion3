import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Heading,
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Casting Companion! 🎬</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thank you for joining Casting Companion! Your 14-day trial has begun, and we're excited to help you
            discover and submit to the best casting opportunities.
          </Text>
          <Section style={section}>
            <Text style={boldText}>What's next?</Text>
            <Text style={listItem}>✓ Complete your profile to get better matches</Text>
            <Text style={listItem}>✓ Browse available casting calls</Text>
            <Text style={listItem}>✓ We'll auto-submit you to great matches (≥85% score)</Text>
            <Text style={listItem}>✓ Track your submissions in your dashboard</Text>
          </Section>
          <Button style={button} href={`${process.env.NEXTAUTH_URL}/dashboard`}>
            Go to Dashboard
          </Button>
          <Text style={text}>
            Questions? Just reply to this email—we're here to help!
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The Casting Companion Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 20px',
};

const boldText = {
  ...text,
  fontWeight: 'bold',
  marginTop: '24px',
};

const listItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '8px 20px 8px 40px',
};

const section = {
  margin: '24px 0',
};

const button = {
  backgroundColor: '#6366F1',
  borderRadius: '8px',
  color: '#fff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 20px',
  margin: '32px 20px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 20px',
};

export default WelcomeEmail;
