import { prisma } from '@/lib/db';
import { calculateMatchScore } from '@/lib/matchScore';
import { sendSubmissionEmail, sendSubmissionConfirmationEmail } from '@/lib/email';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate a cover letter for auto-submission
 */
async function generateCoverLetter(profile: any, user: any, castingCall: any): Promise<string | null> {
  try {
    const prompt = `You are a professional casting assistant writing a personalized cover letter for an actor submitting to a casting call.

**Actor Information:**
Name: ${user.name || 'Actor'}
${profile.bio ? `Bio: ${profile.bio}` : ''}
Age: ${profile.age || 'N/A'} (Playable range: ${profile.playableAgeMin || 'N/A'}-${profile.playableAgeMax || 'N/A'})
Gender: ${profile.gender || 'N/A'}
Union Status: ${profile.unionStatus || 'Non-Union'}
Skills: ${profile.skills.length > 0 ? profile.skills.join(', ') : 'None specified'}
Location: ${profile.city || 'N/A'}, ${profile.state || 'N/A'}

**Casting Call Details:**
Role: ${castingCall.title}
Production: ${castingCall.production}
Description: ${castingCall.description}
Type: ${castingCall.roleType}
Location: ${castingCall.location}
Compensation: ${castingCall.compensation}
Requirements:
- Age Range: ${castingCall.ageRangeMin || 'N/A'} - ${castingCall.ageRangeMax || 'N/A'}
- Gender: ${castingCall.gender || 'Any'}
- Union: ${castingCall.unionStatus || 'Any'}

**Instructions:**
Write a professional, personalized 2-3 paragraph cover letter for this actor's submission. 

- Start with a strong opening that shows genuine interest in the role and production
- Highlight 2-3 specific qualifications that match the role requirements
- If the actor has a bio, naturally weave in relevant experience
- Match any required skills or characteristics mentioned in the casting call
- Keep it concise, professional, and enthusiastic
- End with availability and eagerness to audition
- Use a warm but professional tone
- Do NOT use generic phrases like "I am writing to express my interest"
- Do NOT be overly formal or stiff
- Make it feel personal and authentic

Return ONLY the cover letter text, no additional formatting or metadata.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const coverLetter = message.content[0].type === 'text' 
      ? message.content[0].text 
      : null;

    return coverLetter;
  } catch (error) {
    console.error('Error generating cover letter for auto-submission:', error);
    return null; // Return null if generation fails, don't block submission
  }
}

/**
 * Process auto-submissions for a single user against all active casting calls
 * Used when: User logs in or updates profile
 */
export async function processUserAutoSubmissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user?.profile) {
    return { processed: 0, submitted: 0 };
  }

  const castingCalls = await prisma.castingCall.findMany({
    where: {
      status: 'ACTIVE',
      submissionDeadline: { gte: new Date() },
    },
  });

  const existingSubmissions = await prisma.submission.findMany({
    where: { profileId: user.profile.id },
    select: { castingCallId: true },
  });

  const submittedIds = new Set(existingSubmissions.map(s => s.castingCallId));
  let submitted = 0;

  for (const call of castingCalls) {
    if (submittedIds.has(call.id)) continue;

    const matchScore = calculateMatchScore(user.profile, call);

    if (matchScore >= 85) {
      // Generate cover letter
      const coverLetter = await generateCoverLetter(user.profile, user, call);

      // Generate public profile URL if available
      const profileUrl = user.profile?.isPublic && user.profile?.profileSlug
        ? `${process.env.NEXT_PUBLIC_URL}/actors/${user.profile.profileSlug}`
        : undefined;

      const submission = await prisma.submission.create({
        data: {
          profileId: user.profile.id,
          castingCallId: call.id,
          submissionMethod: 'AUTO',
          matchScore,
          status: 'PENDING',
          coverLetter: coverLetter || null,
        },
      });

      // Send emails (don't await to avoid blocking)
      Promise.all([
        sendSubmissionEmail({
          castingEmail: call.castingEmail,
          userProfile: {
            name: user.name,
            email: user.email,
            phone: user.profile.phone,
            age: user.profile.age,
            playableAgeMin: user.profile.playableAgeMin,
            playableAgeMax: user.profile.playableAgeMax,
            gender: user.profile.gender,
            city: user.profile.city,
            state: user.profile.state,
            unionStatus: user.profile.unionStatus,
            ethnicity: user.profile.ethnicity,
            skills: user.profile.skills,
            headshot: user.profile.headshot,
            fullBody: user.profile.fullBodyPhoto,
            resume: user.profile.resume,
          },
          castingCall: call,
          submissionId: submission.id,
          coverLetter: coverLetter || undefined,
          profileUrl: profileUrl,
        }),
        sendSubmissionConfirmationEmail(
          user.email,
          user.name || 'Actor',
          call,
          coverLetter || undefined
        ),
      ]).catch(err => console.error('Email sending failed:', err));

      submitted++;
    }
  }

  return { processed: castingCalls.length, submitted };
}

/**
 * Process auto-submissions for all users against a single casting call
 * Used when: New casting call is created
 */
export async function processCastingCallAutoSubmissions(castingCallId: string) {
  const castingCall = await prisma.castingCall.findUnique({
    where: { id: castingCallId },
  });

  if (!castingCall) {
    return { processed: 0, submitted: 0 };
  }

  const users = await prisma.user.findMany({
    where: {
      profile: { isNot: null },
    },
    include: { profile: true },
  });

  let submitted = 0;

  for (const user of users) {
    if (!user.profile) continue;

    // Check if already submitted
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        profileId_castingCallId: {
          profileId: user.profile.id,
          castingCallId: castingCall.id,
        },
      },
    });

    if (existingSubmission) continue;

    const matchScore = calculateMatchScore(user.profile, castingCall);

    if (matchScore >= 85) {
      // Generate cover letter
      const coverLetter = await generateCoverLetter(user.profile, user, castingCall);

      // Generate public profile URL if available
      const profileUrl = user.profile?.isPublic && user.profile?.profileSlug
        ? `${process.env.NEXT_PUBLIC_URL}/actors/${user.profile.profileSlug}`
        : undefined;

      const submission = await prisma.submission.create({
        data: {
          profileId: user.profile.id,
          castingCallId: castingCall.id,
          submissionMethod: 'AUTO',
          matchScore,
          status: 'PENDING',
          coverLetter: coverLetter || null,
        },
      });

      // Send emails (don't await to avoid blocking)
      Promise.all([
        sendSubmissionEmail({
          castingEmail: castingCall.castingEmail,
          userProfile: {
            name: user.name,
            email: user.email,
            phone: user.profile.phone,
            age: user.profile.age,
            playableAgeMin: user.profile.playableAgeMin,
            playableAgeMax: user.profile.playableAgeMax,
            gender: user.profile.gender,
            city: user.profile.city,
            state: user.profile.state,
            unionStatus: user.profile.unionStatus,
            ethnicity: user.profile.ethnicity,
            skills: user.profile.skills,
            headshot: user.profile.headshot,
            fullBody: user.profile.fullBodyPhoto,
            resume: user.profile.resume,
          },
          castingCall,
          submissionId: submission.id,
          coverLetter: coverLetter || undefined,
          profileUrl: profileUrl,
        }),
        sendSubmissionConfirmationEmail(
          user.email,
          user.name || 'Actor',
          castingCall,
          coverLetter || undefined
        ),
      ]).catch(err => console.error('Email sending failed:', err));

      submitted++;
    }
  }

  return { processed: users.length, submitted };
}
