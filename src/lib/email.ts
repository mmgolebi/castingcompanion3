import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSubmissionEmail({
  castingEmail,
  userProfile,
  castingCall,
  submissionId,
}: {
  castingEmail: string;
  userProfile: any;
  castingCall: any;
  submissionId: string;
}) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_URL}/unsubscribe/${submissionId}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .profile-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #1f2937; }
          .attachments { margin: 20px 0; }
          .attachment-link { display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 5px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Actor Submission</h1>
            <p>${castingCall.title} - ${castingCall.production}</p>
          </div>
          
          <div class="content">
            <div class="profile-section">
              <h2>${userProfile.name || 'Actor'}</h2>
              
              <div class="info-row">
                <span class="label">Contact:</span>
                <span class="value">${userProfile.email}${userProfile.phone ? ' | ' + userProfile.phone : ''}</span>
              </div>
              
              ${userProfile.city ? `
              <div class="info-row">
                <span class="label">Location:</span>
                <span class="value">${userProfile.city}, ${userProfile.state} ${userProfile.zipCode || ''}</span>
              </div>
              ` : ''}
              
              ${userProfile.age ? `
              <div class="info-row">
                <span class="label">Age:</span>
                <span class="value">${userProfile.age}${userProfile.playableAgeMin ? ` (plays ${userProfile.playableAgeMin}-${userProfile.playableAgeMax})` : ''}</span>
              </div>
              ` : ''}
              
              ${userProfile.gender || userProfile.height || userProfile.ethnicity ? `
              <div class="info-row">
                <span class="label">Physical:</span>
                <span class="value">
                  ${userProfile.gender || ''} 
                  ${userProfile.height ? `| ${Math.floor(userProfile.height / 12)}'${userProfile.height % 12}"` : ''} 
                  ${userProfile.weight ? `| ${userProfile.weight} lbs` : ''} 
                  ${userProfile.ethnicity ? `| ${userProfile.ethnicity}` : ''}
                </span>
              </div>
              ` : ''}
              
              ${userProfile.unionStatus ? `
              <div class="info-row">
                <span class="label">Union Status:</span>
                <span class="value">${userProfile.unionStatus}</span>
              </div>
              ` : ''}
              
              ${userProfile.skills && userProfile.skills.length > 0 ? `
              <div class="info-row">
                <span class="label">Special Skills:</span>
                <span class="value">${userProfile.skills.join(', ')}</span>
              </div>
              ` : ''}
              
              ${userProfile.demoReel ? `
              <div class="info-row">
                <span class="label">Demo Reel:</span>
                <span class="value"><a href="${userProfile.demoReel}" target="_blank">View Reel</a></span>
              </div>
              ` : ''}
            </div>
            
            <div class="attachments">
              <h3>Materials:</h3>
              ${userProfile.headshot ? `<a href="${userProfile.headshot}" class="attachment-link" target="_blank">View Headshot</a>` : ''}
              ${userProfile.fullBody ? `<a href="${userProfile.fullBody}" class="attachment-link" target="_blank">View Full Body Shot</a>` : ''}
              ${userProfile.resume ? `<a href="${userProfile.resume}" class="attachment-link" target="_blank">View Resume</a>` : ''}
            </div>
            
            <div class="footer">
              <p>This submission was sent via Casting Companion</p>
              <p><a href="${unsubscribeUrl}">Unsubscribe from future submissions</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: castingEmail,
    subject: `New Submission: ${userProfile.name || 'Actor'} - ${castingCall.title}`,
    html,
  });
}

export async function sendSubmissionConfirmation({
  userEmail,
  userName,
  castingCall,
}: {
  userEmail: string;
  userName: string;
  castingCall: any;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .call-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #6b7280; }
          .cta { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Submission Confirmed!</h1>
          </div>
          
          <div class="content">
            <div class="success-icon">✓</div>
            
            <p>Hi ${userName},</p>
            
            <p>Your submission has been successfully sent to the casting team!</p>
            
            <div class="call-details">
              <h3>${castingCall.title}</h3>
              <div class="detail-row">
                <span class="label">Production:</span> ${castingCall.production}
              </div>
              <div class="detail-row">
                <span class="label">Location:</span> ${castingCall.location}
              </div>
              <div class="detail-row">
                <span class="label">Compensation:</span> ${castingCall.compensation}
              </div>
            </div>
            
            <p>The casting director has received your headshot, resume, and contact information. They will reach out directly if they'd like to schedule an audition.</p>
            
            <div class="cta">
              <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" class="button">View Dashboard</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Good luck! We'll notify you of any updates.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: userEmail,
    subject: `Submission Confirmed: ${castingCall.title}`,
    html,
  });
}

export async function sendWeeklyDigest({
  userEmail,
  userName,
  newCalls,
}: {
  userEmail: string;
  userName: string;
  newCalls: any[];
}) {
  if (newCalls.length === 0) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .call-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
          .match-badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .cta { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Weekly Casting Digest</h1>
            <p>${newCalls.length} New Opportunities</p>
          </div>
          
          <div class="content">
            <p>Hi ${userName},</p>
            
            <p>Here are the new casting calls that match your profile this week:</p>
            
            ${newCalls.map(call => `
              <div class="call-card">
                <h3>${call.title}</h3>
                <p><strong>${call.production}</strong> | ${call.location}</p>
                <p>${call.description.substring(0, 150)}...</p>
                <p>
                  <span class="match-badge">${call.matchScore}% Match</span>
                  ${call.wasAutoSubmitted ? '<span style="color: #10b981; margin-left: 10px;">✓ Auto-Submitted</span>' : ''}
                </p>
              </div>
            `).join('')}
            
            <div class="cta">
              <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" class="button">View All Opportunities</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: userEmail,
    subject: `${newCalls.length} New Casting Opportunities`,
    html,
  });
}
