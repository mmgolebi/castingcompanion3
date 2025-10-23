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
            <Link href="/auth/register">
              <Button className="bg-white text-purple-600 hover:bg-gray-100">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your privacy matters to us
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                We at CastingCompanion.com ("Casting Companion") believe in the importance of fully informing our visitors about the use of their personal information. This Privacy Policy demonstrates our commitment to transparency and explains how we collect, use, share, and protect your information.
              </p>
              
              <p className="text-gray-700 font-semibold mb-8">
                IF YOU DO NOT AGREE TO THIS PRIVACY POLICY, YOU MAY NOT ACCESS OR OTHERWISE USE THE SITE OR SERVICE.
              </p>

              <p className="text-gray-700 mb-8">
                We value the trust you place in us and want you to understand what information we gather about you, how we use it, and the safeguards we have in place to protect it.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">How We Ensure Your Information Is Secure</h2>
              <p className="text-gray-700 mb-4">
                Casting Companion uses physical, electronic, and administrative safeguards to maintain the security, integrity, and confidentiality of customer information.
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Access is restricted to employees who need the information to perform business functions.</li>
                <li>Employees are trained on data protection and bound by confidentiality obligations.</li>
                <li>We review and update our security practices in line with industry standards.</li>
              </ul>
              <p className="text-gray-700 mb-8">
                Please note: emails sent to subscribers are not encrypted and therefore carry the same level of protection as standard email.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Information We Collect</h2>
              
              <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Non-Personal Information</h3>
              <p className="text-gray-700 mb-6">
                When you visit our site, we may collect non-identifying information using cookies or similar technologies. These help with site navigation, user experience, and analytics. Cookies do not generate personal data or read personal data from your machine. You may disable cookies in your browser, though some site features may not function properly.
              </p>

              <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Personal Information</h3>
              <p className="text-gray-700 mb-4">When you subscribe or register, we may collect:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Name</li>
                <li>Address</li>
                <li>Telephone number</li>
                <li>Email address</li>
                <li>Billing or payment information</li>
              </ul>
              <p className="text-gray-700 mb-8">
                This information is required to provide services, manage your account, and communicate important updates.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">Casting Companion may use your personal information to:</p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Provide and improve our services</li>
                <li>Process transactions and manage your account</li>
                <li>Communicate about opportunities, offers, or services that may interest you</li>
                <li>Share with trusted third-party service providers (e.g., marketing, verification, data management)</li>
                <li>Deliver targeted advertising</li>
              </ul>
              <p className="text-gray-700 mb-8">
                By providing your information, you expressly consent to be contacted by Casting Companion and/or our partners via phone, text, or email, including through automated technology. Consent to be contacted is not a condition of registration, and you may opt out at any time.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Sharing and Selling of Personal Data</h2>
              <p className="text-gray-700 mb-4">
                Casting Companion may share or sell customer information to trusted partners, advertisers, or service providers. Once shared, your information is also subject to their respective privacy policies.
              </p>
              <p className="text-gray-700 mb-8">
                You have the right to opt out of the sale of your personal information at any time (see Your Privacy Rights section below).
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Ownership of Submitted Information</h2>
              <p className="text-gray-700 mb-8">
                All information submitted to Casting Companion becomes the property of Casting Companion once received. This includes names, email addresses, phone numbers, and mailing addresses.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 mb-8">
                Our website and services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we learn that such information has been collected, we will delete it promptly.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Do Not Call Policy (TCPA Compliance)</h2>
              <p className="text-gray-700 mb-4">
                Casting Companion respects your right to privacy. Consumers may request, by phone or email, to be placed on our company-specific Do Not Call list. Requests are honored within 7 business days and remain active for at least 6 years.
              </p>
              <p className="text-gray-700 mb-8">
                Additionally, you may register with the National Do Not Call Registry at <a href="http://www.donotcall.gov" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">www.donotcall.gov</a> or by calling 888-382-1222.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Your Privacy Rights (GDPR & CCPA)</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have specific rights under data protection laws, including:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li><strong>Right to Access</strong> – You may request details of the personal data we hold about you.</li>
                <li><strong>Right to Correction</strong> – You may request corrections to inaccurate or incomplete information.</li>
                <li><strong>Right to Deletion</strong> – You may request deletion of your personal information, subject to legal and contractual restrictions.</li>
                <li><strong>Right to Opt Out of Sale</strong> – You may opt out of the sale of your personal information to third parties.</li>
                <li><strong>Right to Data Portability</strong> – You may request a copy of your personal data in a portable format.</li>
                <li><strong>Right to Withdraw Consent</strong> – Where consent is required for processing, you may withdraw it at any time.</li>
              </ul>
              <p className="text-gray-700 mb-8">
                To exercise these rights, contact us at <a href="mailto:info@castingcompanion.com" className="text-purple-600 hover:underline">info@castingcompanion.com</a> or call us at <a href="tel:+18449894574" className="text-purple-600 hover:underline">(844) 989-4574</a>.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                Casting Companion may use cookies, tracking pixels, and similar technologies to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                <li>Measure site performance and usage</li>
                <li>Deliver personalized experiences</li>
                <li>Support targeted advertising</li>
              </ul>
              <p className="text-gray-700 mb-8">
                You may disable cookies through your browser settings, though some features may not be available.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Third-Party Advertising</h2>
              <p className="text-gray-700 mb-8">
                We may work with advertising partners that use cookies or similar tools to deliver targeted ads. Casting Companion does not control third-party cookies.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Choice/Opt-Out</h2>
              <p className="text-gray-700 mb-8">
                Users may opt out of receiving promotional emails, text messages, or marketing communications at any time. Instructions are included in every communication, or you may contact us directly.
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions, requests, or to exercise your privacy rights, please contact us:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-700 space-y-2">
                <li>Email: <a href="mailto:info@castingcompanion.com" className="text-purple-600 hover:underline">info@castingcompanion.com</a></li>
                <li>Phone: <a href="tel:+18449894574" className="text-purple-600 hover:underline">(844) 989-4574</a></li>
              </ul>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700 mb-8">
                Casting Companion may update this Privacy Policy periodically to reflect changes in technology, law, or business practices. Updates will be posted here, and we encourage you to review this policy regularly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
