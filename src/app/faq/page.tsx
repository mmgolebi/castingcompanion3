'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Footer from '@/components/Footer';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does Casting Companion work?",
      answer: "Once you create your profile with your photos, resume, and preferences, our algorithm continuously scans for new casting calls. When we find roles that match your criteria with 85% or higher compatibility, we automatically submit your materials to the casting director and notify you via email."
    },
    {
      question: "How much does it cost?",
      answer: "We offer a 14-day trial for just $1, then $39/month after that. You can cancel anytime during the trial period for a full refund."
    },
    {
      question: "What types of roles do you submit for?",
      answer: "We submit to TV shows, films, commercials, web series, and theater productions. You can customize which types of roles you're interested in through your profile settings."
    },
    {
      question: "Do I need professional photos?",
      answer: "While professional headshots are recommended for the best results, we accept all quality photos. Your profile strength will be indicated, and we can provide guidance on improving your materials."
    },
    {
      question: "Can I see what roles I've been submitted to?",
      answer: "Yes! Every time we submit you to a role, you'll receive an email notification with details about the casting call, the production, and why we matched you."
    },
    {
      question: "What if I book a role?",
      answer: "Congratulations! We love hearing success stories. There are no additional fees - your subscription covers unlimited submissions. We just ask that you let us know so we can celebrate with you!"
    },
    {
      question: "Can I pause my subscription?",
      answer: "Yes, you can pause your subscription for up to 3 months if you're unavailable for auditions. Contact support to arrange a pause."
    },
    {
      question: "How do you match me with roles?",
      answer: "Our algorithm considers your age range, gender, ethnicity, location, union status, special skills, and availability. We only submit when there's an 85% or higher match to ensure quality over quantity."
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
          <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about Casting Companion
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-2 hover:border-purple-300 transition-colors">
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full text-left p-6 flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-8">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`h-5 w-5 text-purple-600 transition-transform flex-shrink-0 ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Contact us at info@castingcompanion.com or sign up to see how it works
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
