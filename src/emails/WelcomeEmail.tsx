import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
}

export default function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#7c3aed', fontSize: '28px', marginBottom: '20px' }}>
        Welcome to Casting Companion, {userName}!
      </h1>
      
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151' }}>
        We're thrilled to have you join our community of talented actors and performers.
      </p>
      
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151' }}>
        Your profile is now complete and you're ready to start discovering casting opportunities 
        tailored just for you.
      </p>
      
      <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#1f2937' }}>
          What's Next?
        </h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px', color: '#374151' }}>
            ✅ Browse casting calls matched to your profile
          </li>
          <li style={{ marginBottom: '10px', color: '#374151' }}>
            ✅ Submit to roles with one click
          </li>
          <li style={{ marginBottom: '10px', color: '#374151' }}>
            ✅ Track your submissions and responses
          </li>
          <li style={{ marginBottom: '10px', color: '#374151' }}>
            ✅ Update your profile anytime
          </li>
        </ul>
      </div>
      
      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#374151' }}>
        Your 14-day free trial has started. You won't be charged until the trial ends, 
        and you can cancel anytime.
      </p>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#ede9fe', borderRadius: '8px' }}>
        <p style={{ fontSize: '14px', color: '#5b21b6', margin: 0 }}>
          Questions? Reply to this email or visit our help center. We're here to help you succeed!
        </p>
      </div>
      
      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '30px' }}>
        Break a leg!<br/>
        The Casting Companion Team
      </p>
    </div>
  );
}
