'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-gray-300 mt-2">Last updated: January 1, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>1. Introduction</h2>
            <p>
              Casting Companion ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our service.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>Personal Information</h3>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Name, email address, and phone number</li>
              <li>Profile information (age, gender, ethnicity, physical attributes)</li>
              <li>Professional information (headshots, resume, demo reel links, special skills)</li>
              <li>Location data (city, state, ZIP code)</li>
              <li>Union status and professional affiliations</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>When you use our Service, we automatically collect:</p>
            <ul>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain the Service</li>
              <li>Match you with relevant casting opportunities</li>
              <li>Submit your profile to casting directors on your behalf</li>
              <li>Send you notifications about submissions and account activity</li>
              <li>Process payments and maintain billing records</li>
              <li>Improve and optimize our matching algorithm</li>
              <li>Communicate with you about service updates and support</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. How We Share Your Information</h2>
            
            <h3>Casting Directors and Production Companies</h3>
            <p>
              When we submit you to a casting call, we share your profile information (headshot, resume, reel links, contact information) 
              with the relevant casting director or production company. This is the core function of our Service.
            </p>

            <h3>Service Providers</h3>
            <p>We share information with third-party service providers who perform services on our behalf:</p>
            <ul>
              <li>Payment processing (Stripe)</li>
              <li>Email delivery (Resend)</li>
              <li>Cloud hosting and storage (Vercel, AWS)</li>
              <li>Analytics (Meta Pixel)</li>
            </ul>

            <h3>Legal Requirements</h3>
            <p>We may disclose your information if required by law or in response to valid legal requests.</p>

            <h3>Business Transfers</h3>
            <p>
              If Casting Companion is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your information, including:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure payment processing through PCI-compliant providers</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
            </ul>
            <p>
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security of your information.
            </p>

            <h2>6. Your Rights and Choices</h2>
            
            <h3>Access and Update</h3>
            <p>You can access and update your profile information at any time through your account settings.</p>

            <h3>Delete Your Account</h3>
            <p>You may request deletion of your account by contacting support@castingcompanion.com. We will delete your information within 30 days.</p>

            <h3>Opt-Out of Communications</h3>
            <p>You can unsubscribe from marketing emails by clicking the unsubscribe link. You cannot opt-out of service-related emails 
            (e.g., submission notifications) while maintaining an active account.</p>

            <h3>Do Not Track</h3>
            <p>Our Service does not respond to Do Not Track signals.</p>

            <h2>7. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Maintain your session and keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze service usage and performance</li>
              <li>Track marketing campaign effectiveness</li>
            </ul>
            <p>You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features.</p>

            <h2>8. Third-Party Links</h2>
            <p>
              Our Service may contain links to third-party websites (e.g., casting director websites, production company sites). 
              We are not responsible for the privacy practices of these sites.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our Service is not intended for children under 18. We do not knowingly collect information from children under 18. 
              If you are a parent and believe your child has provided us with personal information, please contact us.
            </p>

            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. 
              By using the Service, you consent to such transfers.
            </p>

            <h2>11. California Privacy Rights</h2>
            <p>
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including:
            </p>
            <ul>
              <li>Right to know what personal information is collected</li>
              <li>Right to request deletion of personal information</li>
              <li>Right to opt-out of the sale of personal information (we do not sell your information)</li>
              <li>Right to non-discrimination for exercising your rights</li>
            </ul>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by email or through the Service. 
              Your continued use of the Service after changes constitute acceptance of the updated policy.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:<br />
              Email: support@castingcompanion.com
            </p>

            <div className="border-t border-gray-200 mt-8 pt-8">
              <p className="text-sm text-gray-500">
                By using Casting Companion, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
