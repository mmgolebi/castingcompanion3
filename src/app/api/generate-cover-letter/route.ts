import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profileId, castingCallId } = await req.json();

    if (!profileId || !castingCallId) {
      return NextResponse.json(
        { error: 'Profile ID and Casting Call ID required' },
        { status: 400 }
      );
    }

    // Fetch profile with user data
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });

    if (!profile || profile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch casting call
    const castingCall = await prisma.castingCall.findUnique({
      where: { id: castingCallId },
    });

    if (!castingCall) {
      return NextResponse.json({ error: 'Casting call not found' }, { status: 404 });
    }

    // Build the prompt for Claude
    const prompt = `You are a professional casting assistant writing a personalized cover letter for an actor submitting to a casting call.

**Actor Information:**
Name: ${profile.user.name || 'Actor'}
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
${castingCall.skillsRequired.length > 0 ? `- Skills: ${castingCall.skillsRequired.join(', ')}` : ''}

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

    console.log('Generating cover letter with Claude...');

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
      : '';

    if (!coverLetter) {
      throw new Error('Failed to generate cover letter');
    }

    console.log('Cover letter generated successfully');

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}
