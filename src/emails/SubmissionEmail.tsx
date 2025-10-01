import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Link,
  Heading,
  Hr,
} from '@react-email/components';

interface SubmissionEmailProps {
  castingEmail: string;
  actorName: string;
  actorEmail: string;
  actorPhone?: string;
  headshotUrl?: string;
  resumeUrl?: string;
  reelLink?: string;
  callTitle: string;
  production: string;
  profile: {
    age?: number;
    gender?: string;
    ethnicity?: string;
    unionStatus?: string;
    location?: string;
    roleInterests?: string[];
    specialSkills?: string[];
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
}

export function SubmissionEmail({
  actorName,
  actorEmail,
  actorPhone,
  headshotUrl,
  resumeUrl,
  reelLink,
  callTitle,
  production,
  profile,
}: SubmissionEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New Submission: {callTitle}</Heading>
          
          <Section style={section}>
            <Text style={boldText}>Production: {production}</Text>
          </Section>

          {headshotUrl && (
            <Section style={imageSection}>
              <Img src={headshotUrl} alt={`${actorName} headshot`} style={headshot} />
            </Section>
          )}

          <Section style={section}>
            <Heading style={h2}>{actorName}</Heading>
            
            <Text style={infoText}>
              <strong>Age:</strong> {profile.age || 'Not specified'}
              <br />
              <strong>Gender:</strong> {profile.gender || 'Not specified'}
              <br />
              <strong>Ethnicity:</strong> {profile.ethnicity || 'Not specified'}
              <br />
              <strong>Union Status:</strong> {profile.unionStatus || 'Not specified'}
              <br />
              <strong>Location:</strong> {profile.location || 'Not specified'}
            </Text>

            {profile.roleInterests && profile.roleInterests.length > 0 && (
              <Text style={infoText}>
                <strong>Role Interests:</strong> {profile.roleInterests.join(', ')}
              </Text>
            )}

            {profile.specialSkills && profile.specialSkills.length > 0 && (
              <Text style={infoText}>
                <strong>Special Skills:</strong> {profile.specialSkills.join(', ')}
              </Text>
            )}
          </Section>

          <Hr style={hr} />

          <Section style={section}>
            <Text style={contactHeader}>Contact Information</Text>
            <Text style={infoText}>
              <strong>Email:</strong> <Link href={`mailto:${actorEmail}`}>{actorEmail}</Link>
              <br />
              {actorPhone && (
                <>
                  <strong>Phone:</strong> {actorPhone}
                  <br />
                </>
              )}
            </Text>
          </Section>

          {(reelLink || resumeUrl) && (
            <Section style={section}>
              <Text style={contactHeader}>Materials</Text>
              {reelLink && (
                <Text style={linkText}>
                  🎬 <Link href={reelLink} style={link}>View Reel</Link>
                </Text>
              )}
              {resumeUrl && (
                <Text style={linkText}>
                  📄 <Link href={resumeUrl} style={link}>Download Resume</Link>
                </Text>
              )}
            </Section>
          )}

          {(profile.instagram || profile.tiktok || profile.youtube) && (
            <Section style={section}>
              <Text style={contactHeader}>Social Media</Text>
              {profile.instagram && (
                <Text style={linkText}>
                  📸 <Link href={profile.instagram} style={link}>Instagram</Link>
                </Text>
              )}
              {profile.tiktok && (
                <Text style={linkText}>
                  🎵 <Link href={profile.tiktok} style={link}>TikTok</Link>
                </Text>
              )}
              {profile.youtube && (
                <Text style={linkText}>
                  ▶️ <Link href={profile.youtube} style={link}>YouTube</Link>
                </Text>
              )}
            </Section>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            Submitted via Casting Companion
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
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#333',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  padding: '0',
};

const section = {
  margin: '24px 20px',
};

const imageSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const headshot = {
  width: '200px',
  height: 'auto',
  borderRadius: '8px',
  margin: '0 auto',
};

const boldText = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const infoText = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
};

const contactHeader = {
  color: '#6366F1',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '16px 0 8px',
};

const linkText = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '28px',
  margin: '4px 0',
};

const link = {
  color: '#6366F1',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 20px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '32px 20px',
  textAlign: 'center' as const,
};

export default SubmissionEmail;