import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
  Heading,
} from '@react-email/components';

interface PasswordResetEmailProps {
  resetLink: string;
}

export function PasswordResetEmail({ resetLink }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to reset your Casting Companion password.
          </Text>
          <Text style={text}>
            Click the button below to create a new password. This link will expire in 30 minutes.
          </Text>
          <Button style={button} href={resetLink}>
            Reset Password
          </Button>
          <Text style={text}>
            If you didn't request a password reset, you can safely ignore this email.
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

const button = {
  backgroundColor: '#EF4444',
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

export default PasswordResetEmail;
