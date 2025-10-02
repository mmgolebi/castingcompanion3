'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
}

const steps = [
  { number: 1, title: 'Basic Info', description: 'Your profile details' },
  { number: 2, title: 'Media Assets', description: 'Photos and resume' },
  { number: 3, title: 'Preferences', description: 'Roles and skills' },
  { number: 4, title: 'Logistics', description: 'Availability and travel' },
];

export default function OnboardingLayout({ children, currentStep }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white mb-4 inline-block">
            Casting Companion
          </Link>
          <p className="text-white/80">Complete your profile to start finding roles</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep > step.number
                        ? 'bg-green-500 border-green-500'
                        : currentStep === step.number
                        ? 'bg-purple-600 border-purple-400'
                        : 'bg-slate-700 border-slate-600'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : (
                      <span className="text-white font-semibold">{step.number}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="text-xs text-white/60">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
