'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="text-2xl font-bold text-white cursor-pointer">Casting Companion</div>
          </Link>
          <div className="flex gap-4">
            <Link href="/about">
              <Button variant="ghost" className="text-white hover:bg-white/10">About</Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" className="text-white hover:bg-white/10">FAQ</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-gray-300 mt-2">Last updated: January 1, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Casting Companion ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to these Terms of Service, please do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Casting Companion is an automated casting call submission service for actors. We provide a platform that matches actors with casting opportunities 
              and automatically submits their profiles to relevant casting calls based on their preferences and qualifications.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To use the Service, you must create an account and provide accurate, complete information. You are responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring all profile information (headshots, resume, etc.) is accurate and up-to-date</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>

            <h2>4. Subscription and Payment</h2>
            <p>
              Casting Companion operates on a subscription basis. By subscribing, you agree to:
            </p>
            <ul>
              <li>Pay the subscription fee of $39.97/month after your 14-day $1 trial period</li>
              <li>Automatic renewal of your subscription unless cancelled</li>
              <li>Provide accurate payment information</li>
              <li>Subscription fees are non-refundable except as required by law or as explicitly stated in our refund policy</li>
            </ul>

            <h2>5. Cancellation and Refunds</h2>
            <p>
              You may cancel your subscription at any time from your account settings. Upon cancellation:
            </p>
            <ul>
              <li>You will retain access to the Service until the end of your current billing period</li>
              <li>No refund will be provided for the remaining days of your subscription</li>
              <li>We offer a full refund within 14 days of your initial subscription if you are not satisfied with the Service</li>
            </ul>

            <h2>6. Automated Submissions</h2>
            <p>
              By using our automated submission feature, you authorize us to:
            </p>
            <ul>
              <li>Submit your profile materials (headshots, resume, reel links) to casting directors on your behalf</li>
              <li>Use your information to match you with relevant casting opportunities</li>
              <li>Send submissions using your provided contact information</li>
            </ul>
            <p>
              You understand that:
            </p>
            <ul>
              <li>Automated submissions do not guarantee auditions or bookings</li>
              <li>Casting directors make all final decisions about which actors to consider</li>
              <li>We are not responsible for the outcome of any submission</li>
            </ul>

            <h2>7. User Content and Intellectual Property</h2>
            <p>
              You retain ownership of all content you upload to the Service (headshots, resume, videos). By uploading content, you grant us:
            </p>
            <ul>
              <li>A non-exclusive, worldwide license to use, reproduce, and distribute your content for the purpose of providing the Service</li>
              <li>The right to submit your materials to casting directors and production companies</li>
              <li>Permission to display your content as examples of our service (with your explicit consent)</li>
            </ul>

            <h2>8. Prohibited Activities</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>Upload false, misleading, or inaccurate information</li>
              <li>Impersonate another person or entity</li>
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated scripts or bots (other than our provided automation)</li>
              <li>Resell or redistribute the Service</li>
            </ul>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE:
            </p>
            <ul>
              <li>That you will receive auditions or book roles</li>
              <li>The accuracy or quality of casting opportunities</li>
              <li>Uninterrupted or error-free operation of the Service</li>
              <li>That casting directors will respond to submissions</li>
            </ul>

            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CASTING COMPANION SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
              OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR OPPORTUNITIES.
            </p>

            <h2>11. Privacy and Data Protection</h2>
            <p>
              Your use of the Service is also governed by our Privacy Policy. We collect, use, and protect your personal information as described in our Privacy Policy.
            </p>

            <h2>12. Modifications to Service and Terms</h2>
            <p>
              We reserve the right to:
            </p>
            <ul>
              <li>Modify or discontinue the Service at any time</li>
              <li>Update these Terms of Service with reasonable notice</li>
              <li>Change subscription pricing with 30 days notice to existing subscribers</li>
            </ul>

            <h2>13. Termination</h2>
            <p>
              We may terminate or suspend your account immediately if you:
            </p>
            <ul>
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent activity</li>
              <li>Fail to pay subscription fees</li>
              <li>Upload inappropriate or illegal content</li>
            </ul>

            <h2>14. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, 
              without regard to its conflict of law provisions.
            </p>

            <h2>15. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please contact us at:<br />
              Email: support@castingcompanion.com
            </p>

            <div className="border-t border-gray-200 mt-8 pt-8">
              <p className="text-sm text-gray-500">
                By using Casting Companion, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-white font-bold text-xl mb-4">Casting Companion</div>
              <p className="text-sm">
                Automated casting call submissions for actors.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="hover:text-white">Login</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 Casting Companion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
