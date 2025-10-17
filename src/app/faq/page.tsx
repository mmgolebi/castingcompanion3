'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Casting Companion work?",
      answer: "Once you create your profile with your photos, resume, and preferences, our algorithm continuously scans for new casting calls. When we find roles that match your criteria with 85% or higher compatibility, we automatically submit your materials to the casting director and notify you via email."
    },
    {
      question: "What types of roles do you submit to?",
      answer: "We submit to all types of roles including lead, supporting, background, extra, commercial, voiceover, theater, and more. Our system works with union (SAG-AFTRA) and non-union opportunities across film, TV, commercials, and new media."
    },
    {
      question: "How is my match score calculated?",
      answer: "Our algorithm considers multiple factors including your age, location, gender, ethnicity, union status, special skills, physical attributes, and role preferences. A 85%+ match means you meet most of the casting requirements and have a strong chance of being considered."
    },
    {
      question: "Can I still manually apply to roles?",
      answer: "Absolutely! Your dashboard shows all available casting calls, and you can manually submit to any role at any time. Auto-submissions are just an added bonus to ensure you never miss opportunities."
    },
    {
      question: "How much does it cost?",
      answer: "We offer a 14-day trial for $1, then $39.97/month after that. You can cancel anytime with no long-term commitment. There are no hidden fees or per-submission charges."
    },
    {
      question: "Will casting directors know I used an automated service?",
      answer: "No. Your submissions appear exactly as if you submitted them manually. Casting directors see your professional headshot, resume, and reel with a personalized cover letter. They have no way of knowing the submission was automated."
    },
    {
      question: "What if I want to stop auto-submissions temporarily?",
      answer: "You can pause auto-submissions at any time from your dashboard settings. This is useful if you're booked on a project or taking a break from auditioning."
    },
    {
      question: "Do you submit to scams or low-quality productions?",
      answer: "Never. We manually vet all casting calls before adding them to our system. We filter out anything suspicious, unprofessional, or that asks for money upfront. Your safety and career are our priority."
    },
    {
      question: "What locations do you cover?",
      answer: "We currently serve actors across the United States, with the most opportunities in major markets like Los Angeles, New York, Atlanta, Chicago, Miami, and Austin. We're constantly expanding to new cities."
    },
    {
      question: "Can I update my profile after signing up?",
      answer: "Yes! You can update your photos, resume, reel links, preferences, and availability anytime. Changes take effect immediately and improve your match scores for future submissions."
    },
    {
      question: "What happens if I book a role?",
      answer: "Congratulations! You can update your availability status in your profile settings so we don't submit you to conflicting shoot dates. You can also pause auto-submissions temporarily."
    },
    {
      question: "Is there a limit to how many submissions you make?",
      answer: "No limits! We'll submit you to every casting call that matches your profile at 85% or higher. Some actors get submitted to 2-3 roles per week, others get 10+, depending on their location and how in-demand their look is."
    },
    {
      question: "What if I'm not getting many auto-submissions?",
      answer: "This usually means your profile needs optimization. Make sure all your information is complete and accurate. Consider expanding your acceptable role types or locations. Our support team can review your profile and suggest improvements."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! You can cancel your subscription anytime from your account settings. There are no cancellation fees or penalties. If you cancel, you'll have access until the end of your billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a full refund within 14 days if you're not satisfied. Just email support@castingcompanion.com and we'll process your refund immediately."
    }
  ];

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
          <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about Casting Companion
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-2 border-gray-200">
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold pr-8">{faq.question}</h3>
                    <ChevronDown 
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-xl text-gray-600 mb-8">
            We're here to help! Email us at{' '}
            <a href="mailto:support@castingcompanion.com" className="text-purple-600 hover:underline">
              support@castingcompanion.com
            </a>
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-purple-600 text-white hover:bg-purple-700">
              Get Started Today
            </Button>
          </Link>
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
