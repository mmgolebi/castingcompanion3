import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: Request) {
  try {
    // Check API key first
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const session = await auth();
    if (!session?.user?.id) {
      console.error('Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await req.json();

    if (!imageUrl) {
      console.error('No image URL provided');
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 });
    }

    console.log('Fetching image from:', imageUrl);

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status);
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Determine media type from URL
    const mediaType = imageUrl.toLowerCase().endsWith('.png') 
      ? 'image/png' 
      : 'image/jpeg';

    console.log('Calling Anthropic API...');

    // Analyze with Claude Vision - using latest Sonnet model
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `You are a professional casting director and headshot photographer. Analyze this actor headshot and provide detailed, constructive feedback.

Evaluate on these criteria (score each 0-100):
1. LIGHTING: Is the lighting professional, flattering, and even? No harsh shadows?
2. COMPOSITION: Good framing, rule of thirds, appropriate headroom, eyes in focus?
3. EXPRESSION: Natural, engaging, shows personality without being over-the-top?
4. PROFESSIONALISM: Appropriate for industry standards? Clean, current look?
5. BACKGROUND: Simple, non-distracting, appropriate contrast with subject?

Respond in this EXACT JSON format:
{
  "overallScore": 85,
  "lightingScore": 90,
  "compositionScore": 85,
  "expressionScore": 80,
  "professionalScore": 90,
  "backgroundScore": 85,
  "strengths": ["Great natural lighting", "Eyes are sharp and engaging", "Professional look"],
  "improvements": ["Background slightly busy", "Could smile more naturally"],
  "detailedFeedback": "This is a strong headshot overall. The lighting is excellent - soft and flattering without harsh shadows. Your expression is warm and approachable, which works well for commercial work. The composition follows industry standards with good headroom and eye placement. However, the background has a few distracting elements that could be simplified. Consider a plain backdrop for your next session. The overall professionalism is high - this headshot would work well for submissions."
}

Be encouraging but honest. Focus on actionable improvements.`
            }
          ],
        },
      ],
    });

    console.log('Anthropic API response received');

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    console.log('Response text:', responseText.substring(0, 200));

    // Extract JSON from response (Claude sometimes adds markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse AI response - no JSON found');
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    console.log('Parsed analysis, overall score:', analysis.overallScore);

    // Save to database
    const headshotAnalysis = await prisma.headshotAnalysis.create({
      data: {
        userId: session.user.id,
        imageUrl,
        overallScore: analysis.overallScore,
        lightingScore: analysis.lightingScore,
        compositionScore: analysis.compositionScore,
        expressionScore: analysis.expressionScore,
        professionalScore: analysis.professionalScore,
        backgroundScore: analysis.backgroundScore,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        detailedFeedback: analysis.detailedFeedback,
      },
    });

    console.log('Analysis saved to database');

    return NextResponse.json(headshotAnalysis);
  } catch (error) {
    console.error('Error analyzing headshot:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze headshot' },
      { status: 500 }
    );
  }
}

// Get user's analysis history
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyses = await prisma.headshotAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}
