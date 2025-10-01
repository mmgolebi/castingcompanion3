import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { PasswordResetEmail } from '@/emails/PasswordResetEmail';
import { SubmissionEmail } from '@/emails/SubmissionEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name?: string) {
  try {
    await resend.emails.send({
      from: 'Casting Companion <hello@yourdomain.com>',
      to,
      subject: 'Welcome to Casting Companion!',
      react: WelcomeEmail({ name: name || 'Actor' }),
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  try {
    await resend.emails.send({
      from: 'Casting Companion <hello@yourdomain.com>',
      to,
      subject: 'Reset your password',
      react: PasswordResetEmail({ resetLink }),
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
}

export async function sendSubmissionEmail(data: {
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
}) {
  try {
    await resend.emails.send({
      from: 'Casting Companion Submissions <submissions@yourdomain.com>',
      to: data.castingEmail,
      subject: `Submission: ${data.actorName} — ${data.callTitle}`,
      react: SubmissionEmail(data),
    });
  } catch (error) {
    console.error('Failed to send submission email:', error);
    throw error;
  }
}
