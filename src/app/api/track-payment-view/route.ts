import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addGHLTag } from '@/lib/ghl';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add GHL tag with all cumulative tags (non-blocking)
    addGHLTag(
      session.user.email, 
      'payment-page-viewed',
      ['registered', 'euphoria-applicant', 'step4-complete', 'payment-page-viewed'] // Send all tags
    ).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking payment view:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}
