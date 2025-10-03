import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SubmissionEmailParams {
  castingEmail: string;
  userProfile: any;
  castingCall: any;
  submissionId: string;
}

export async function sendSubmissionEmail({
  castingEmail,
  userProfile,
  castingCall,
  submissionId,
}: SubmissionEmailParams) {
  try {
    console.log('Attempting to send email to:', castingEmail);
    
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('Email service not configured');
    }

    const emailHtml = `
      <h2>New Talent Submission</h2>
      <p>You have received a new submission for: <strong>${castingCall.title}</strong></p>
      
      <h3>Talent Information</h3>
      <ul>
        <li><strong>Name:</strong> ${userProfile.name}</li>
        <li><strong>Email:</strong> ${userProfile.email}</li>
        <li><strong>Phone:</strong> ${userProfile.phone || 'Not provided'}</li>
        <li><strong>Age:</strong> ${userProfile.age}</li>
        <li><strong>Playable Age Range:</strong> ${userProfile.playableAgeMin}-${userProfile.playableAgeMax}</li>
        <li><strong>Gender:</strong> ${userProfile.gender}</li>
        <li><strong>Location:</strong> ${userProfile.city}, ${userProfile.state}</li>
        <li><strong>Union Status:</strong> ${userProfile.unionStatus}</li>
        <li><strong>Ethnicity:</strong> ${userProfile.ethnicity}</li>
      </ul>

      ${userProfile.skills?.length > 0 ? `
        <h3>Special Skills</h3>
        <p>${userProfile.skills.join(', ')}</p>
      ` : ''}

      <h3>Materials</h3>
      <ul>
        ${userProfile.headshot ? `<li><a href="${userProfile.headshot}">Headshot</a></li>` : ''}
        ${userProfile.fullBody ? `<li><a href="${userProfile.fullBody}">Full Body Shot</a></li>` : ''}
        ${userProfile.resume ? `<li><a href="${userProfile.resume}">Resume</a></li>` : ''}
        ${userProfile.demoReel ? `<li><a href="${userProfile.demoReel}">Demo Reel</a></li>` : ''}
      </ul>

      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Submission ID: ${submissionId}
      </p>
    `;

    const result = await resend.emails.send({
      from: 'Casting Companion <onboarding@resend.dev>',
      to: castingEmail,
      subject: `New Submission: ${castingCall.title} - ${userProfile.name}`,
      html: emailHtml,
    });

    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send submission email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    console.log('Sending welcome email to:', userEmail);
    
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('Email service not configured');
    }

    const emailHtml = `
      <h1>Welcome to Casting Companion, ${userName}!</h1>
      
      <p>We're excited to have you join our platform. Here's what you can do:</p>
      
      <ul>
        <li><strong>Auto-Submissions:</strong> We automatically submit your profile to casting calls that match your criteria with 85%+ compatibility</li>
        <li><strong>Browse Opportunities:</strong> Search and filter casting calls to find the perfect roles</li>
        <li><strong>Track Applications:</strong> Monitor your submissions and their status</li>
        <li><strong>Update Your Profile:</strong> Keep your information current to get better matches</li>
      </ul>

      <p>Your profile is now active and we'll start matching you with relevant casting calls.</p>
      
      <p style="margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>

      <p style="color: #666; font-size: 14px; margin-top: 40px;">
        Questions? Reply to this email and we'll be happy to help!
      </p>
    `;

    const result = await resend.emails.send({
      from: 'Casting Companion <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Welcome to Casting Companion!',
      html: emailHtml,
    });

    console.log('Welcome email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}
