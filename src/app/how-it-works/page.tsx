import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, X, Search, FileText, Video } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'How Casting Companion Works - Not a Scam, Real Actor Software | Casting Companion',
  description: 'Is Casting Companion a scam? Learn how our AI-powered platform helps actors find auditions automatically. We\'re not an agency - we\'re legitimate actor software. Read reviews and see how it works.',
  keywords: 'casting companion, casting companion review, is casting companion a scam, what is casting companion, casting companion legitimate, actor audition software, automated casting submissions',
  openGraph: {
    title: 'How Casting Companion Works - Legitimate AI Actor Software',
    description: 'Not an agency, not a scam. Casting Companion is AI-powered software that helps actors find and submit to casting calls automatically.',
    type: 'website',
    url: 'https://castingcompanion.com/how-it-works',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Casting Companion Works - Not a Scam',
    description: 'AI-powered software for actors. Find auditions, submit automatically, get feedback. No commissions, no agency fees.',
  },
  alternates: {
    canonical: 'https://castingcompanion.com/how-it-works',
  },
};

export default function HowItWorksPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Casting Companion?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Casting Companion is an AI-powered software platform that helps actors find and submit to casting calls automatically. We are not a talent agency - we're a technology company that provides tools for independent actors."
        }
      },
      {
        "@type": "Question",
        "name": "Is Casting Companion a scam?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, Casting Companion is not a scam. We are a legitimate software-as-a-service (SaaS) company. We never charge actors to attend auditions, we don't take commissions from your earnings, and we're not a modeling or talent agency. We provide technology tools that help actors manage their casting submissions."
        }
      },
      {
        "@type": "Question",
        "name": "Do I have to pay Casting Companion to attend auditions?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. We never sell audition access. Our platform finds publicly available casting calls and helps you apply professionally with AI-generated cover letters and automated submissions."
        }
      },
      {
        "@type": "Question",
        "name": "How is Casting Companion different from talent agencies?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlike talent agencies, Casting Companion doesn't take commissions, doesn't require exclusive contracts, and doesn't control your career. We're software that empowers you to find and submit to roles independently using AI technology."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Casting Companion
          </Link>
          <div className="flex gap-4">
            <Link href="/about">
              <Button variant="ghost">About</Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost">FAQ</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            How Casting Companion Works
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            At Casting Companion, we've built something different. We're not a talent agency. 
            We're not a modeling agency. And we'll never charge you to attend auditions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <p className="text-lg text-gray-700 mb-8">
            Casting Companion is an AI-powered platform that makes it easier for actors and performers to:
          </p>
          <ul className="space-y-3 mb-12">
            <li className="flex items-start gap-3">
              <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <span className="text-lg">Find the right casting calls automatically</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <span className="text-lg">Submit polished, tailored applications instantly</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              <span className="text-lg">Get AI feedback on headshots and audition reels</span>
            </li>
          </ul>

          {/* Not a Scam Section */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">
              🚫 Not an Agency. Not a Scam.
            </h2>
            <div className="space-y-4 text-lg">
              <p className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <span><strong>Casting Companion is NOT a talent or modeling agency.</strong></span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <span><strong>We do NOT sell auditions.</strong></span>
              </p>
              <p className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <span><strong>We are a technology company.</strong></span>
              </p>
            </div>
            <p className="mt-6 text-gray-700">
              We created Casting Companion to empower actors with software tools—not to replace 
              agents, managers, or casting directors.
            </p>
          </div>

          {/* How It Works Steps */}
          <div className="space-y-12 mb-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-blue-100 rounded-full p-4 flex-shrink-0">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">
                  🔎 Step 1: Our Proprietary Algorithms Combined with AI Finds the Right Auditions for You
                </h3>
                <p className="text-gray-700 mb-4">
                  Our algorithm continuously scans casting calls and auditions across the web. 
                  Instead of manually searching through hundreds of listings, you'll see only the 
                  roles that match your profile.
                </p>
                <p className="text-blue-600 font-semibold">
                  ✨ Think of it as a "casting search engine" built specifically for you.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-green-100 rounded-full p-4 flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">
                  ✍️ Step 2: Tailored Submissions That Stand Out
                </h3>
                <p className="text-gray-700 mb-4">
                  For every opportunity, our AI:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Writes a custom cover letter designed to highlight your strengths</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Formats your application in a professional, eye-catching way</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Submits everything correctly—saving you hours of guesswork</span>
                  </li>
                </ul>
                <p className="text-green-600 font-semibold">
                  📌 Result: Your submission looks polished and gets noticed.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-purple-100 rounded-full p-4 flex-shrink-0">
                <Video className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">
                  🎥 Step 3: Instant Feedback on Your Materials
                </h3>
                <p className="text-gray-700 mb-4">
                  Upload your materials, and our AI acting agent gives you insights in seconds:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Headshots:</strong> Feedback on angles, expressions, and presentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Audition reels:</strong> Notes on delivery, tone, and areas for improvement</span>
                  </li>
                </ul>
                <p className="text-purple-600 font-semibold">
                  It's like having a personal acting coach available 24/7.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">
              💡 Why Choose Casting Companion?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>We're SaaS, not an agency</strong> – no commissions, no contracts</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>No "pay to audition" schemes</strong> – we don't sell audition access</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>AI-powered support</strong> – smarter searches, stronger submissions, better feedback</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <span><strong>Control stays with you</strong> – you own your career, we provide the tech</span>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">
              📊 Casting Companion vs. Traditional Agencies
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-4 text-left font-semibold">Feature</th>
                    <th className="border border-gray-300 p-4 text-center font-semibold bg-blue-50">
                      Casting Companion (Us)
                    </th>
                    <th className="border border-gray-300 p-4 text-center font-semibold">
                      Talent/Modeling Agencies
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-4">Charges for auditions?</td>
                    <td className="border border-gray-300 p-4 text-center bg-green-50">
                      <div className="flex items-center justify-center gap-2">
                        <X className="h-5 w-5 text-red-500" />
                        <span className="font-semibold">Never</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 text-center bg-red-50">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-5 w-5 text-red-500" />
                        <span>Often disguised as "fees"</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-4">Takes a cut of your earnings?</td>
                    <td className="border border-gray-300 p-4 text-center bg-green-50">
                      <div className="flex items-center justify-center gap-2">
                        <X className="h-5 w-5 text-red-500" />
                        <span className="font-semibold">No</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 text-center bg-red-50">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-5 w-5 text-red-500" />
                        <span>Yes (commissions)</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-4">Uses AI to match roles?</td>
                    <td className="border border-gray-300 p-4 text-center bg-green-50">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Yes</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 text-center bg-red-50">
                      <div className="flex items-center justify-center gap-2">
                        <X className="h-5 w-5 text-red-500" />
                        <span>No</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-4">Provides instant reel/headshot feedback?</td>
                    <td className="border border-gray-300 p-4 text-center bg-green-50">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">Yes</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 text-center bg-red-50">
                      <div className="flex items-center justify-center gap-2">
                        <X className="h-5 w-5 text-red-500" />
                        <span>No</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-4">Who controls your career?</td>
                    <td className="border border-gray-300 p-4 text-center bg-green-50">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="font-semibold">You</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-4 text-center bg-red-50">
                      <div className="flex items-center justify-center gap-2">
                        <X className="h-5 w-5 text-red-500" />
                        <span>Mostly them</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">
              ❓ Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">
                  Q: Do I have to pay Casting Companion to attend auditions?
                </h3>
                <p className="text-gray-700">
                  <strong>A:</strong> No. We never sell audition access. Our platform finds what's already 
                  out there and helps you apply professionally.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">
                  Q: Are you an agency or management company?
                </h3>
                <p className="text-gray-700">
                  <strong>A:</strong> No. We're a software company. You remain independent and in control.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">
                  Q: Can Casting Companion guarantee me roles?
                </h3>
                <p className="text-gray-700">
                  <strong>A:</strong> No one can guarantee roles. What we guarantee is better access, 
                  better applications, and better feedback.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">
                  Q: How is this different from subscription casting sites?
                </h3>
                <p className="text-gray-700">
                  <strong>A:</strong> Instead of making you search manually, our AI does the heavy lifting—finding, 
                  filtering, and tailoring submissions automatically.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join hundreds of actors who are landing more auditions with Casting Companion
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Your Free Trial
                </Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  View All FAQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
