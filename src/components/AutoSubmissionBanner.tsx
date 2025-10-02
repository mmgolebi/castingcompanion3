'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';

export function AutoSubmissionBanner() {
  return (
    <Alert className="mb-6 border-green-200 bg-green-50">
      <Sparkles className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Auto-Submissions Enabled</AlertTitle>
      <AlertDescription className="text-green-700">
        We automatically submit your profile to casting calls that match your criteria with 85% or higher compatibility. 
        Match scores are based on: <strong>age range (30%)</strong>, <strong>gender (20%)</strong>, <strong>location (25%)</strong>, 
        <strong>union status (15%)</strong>, and <strong>ethnicity (10%)</strong>. You'll receive email notifications for all auto-submissions.
      </AlertDescription>
    </Alert>
  );
}
