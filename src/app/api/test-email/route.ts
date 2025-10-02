import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: 'noreply@updates.castingcompanion.com', // Replace with your actual email
      subject: 'Test Email from Casting Companion',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>',
    });

    return NextResponse.json({ 
      success: true, 
      result,
      from: process.env.RESEND_FROM_EMAIL,
      apiKey: process.env.RESEND_API_KEY ? 'Set' : 'Missing'
    });
  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      from: process.env.RESEND_FROM_EMAIL,
      apiKey: process.env.RESEND_API_KEY ? 'Set' : 'Missing'
    }, { status: 500 });
  }
}
