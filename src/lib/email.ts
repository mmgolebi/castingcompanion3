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
    console.log('=== SENDING SUBMISSION EMAIL ===');
    console.log('To:', castingEmail);
    console.log('API Key exists:', !!process.env.RESEND_API_KEY);
    console.log('API Key prefix:', process.env.RESEND_API_KEY?.substring(0, 10));
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
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

    console.log('Calling resend.emails.send...');
    const result = await resend.emails.send({
      from: 'Casting Companion <onboarding@resend.dev>',
      to: castingEmail,
      subject: `New Submission: ${castingCall.title} - ${userProfile.name}`,
      html: emailHtml,
    });

    console.log('Resend API response:', JSON.stringify(result));
    return result;
  } catch (error: any) {
    console.error('=== EMAIL SEND FAILED ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

export async function sendSubmissionConfirmationEmail(
  userEmail: string,
  userName: string,
  castingCall: any
) {
  try {
    console.log('=== SENDING CONFIRMATION EMAIL ===');
    console.log('To:', userEmail);
    console.log('API Key exists:', !!process.env.RESEND_API_KEY);
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }

    const emailHtml = `
      <h2>Submission Confirmed!</h2>
      
      <p>Hi ${userName},</p>
      
      <p>Your submission has been successfully sent to the casting director for:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${castingCall.title}</h3>
        <p><strong>Production:</strong> ${castingCall.production}</p>
        <p><strong>Location:</strong> ${castingCall.location}</p>
        <p><strong>Deadline:</strong> ${new Date(castingCall.submissionDeadline).toLocaleDateString()}</p>
      </div>

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>The casting director will review your materials</li>
        <li>If interested, they'll contact you directly via email or phone</li>
        <li>You can track this submission in your dashboard</li>
      </ul>

      <p style="margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Dashboard
        </a>
      </p>

      <p style="color: #666; font-size: 14px; margin-top: 40px;">
        Good luck! Break a leg! 🎭
      </p>
    `;

    console.log('Calling resend.emails.send...');
    const result = await resend.emails.send({
      from: 'Casting Companion <onboarding@resend.dev>',
      to: userEmail,
      subject: `Submission Confirmed: ${castingCall.title}`,
      html: emailHtml,
    });

    console.log('Resend API response:', JSON.stringify(result));
    return result;
  } catch (error: any) {
    console.error('=== CONFIRMATION EMAIL FAILED ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    throw error;
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    console.log('=== SENDING WELCOME EMAIL ===');
    console.log('To:', userEmail);
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
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

    console.log('Welcome email sent:', JSON.stringify(result));
    return result;
  } catch (error: any) {
    console.error('=== WELCOME EMAIL FAILED ===');
    console.error('Error details:', error);
    throw error;
  }
}
