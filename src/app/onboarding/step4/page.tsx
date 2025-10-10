'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Upload, X } from 'lucide-react';

export default function Step4Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [reelUrl, setReelUrl] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Resume must be less than 5MB');
      return;
    }

    setResume(file);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let uploadedResumeUrl = resumeUrl;

      // Upload resume if provided
      if (resume) {
        const formData = new FormData();
        formData.append('file', resume);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload resume');
        }

        const uploadData = await uploadRes.json();
        uploadedResumeUrl = uploadData.url;
      }

      // Save profile data
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeUrl: uploadedResumeUrl,
          reelUrl,
          bio,
        }),
      });

      if (res.ok) {
        // Redirect to payment/subscription setup
        router.push('/onboarding/payment');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/payment');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">Step 4 of 4</div>
          </div>
          <CardTitle className="text-3xl">Materials</CardTitle>
          <CardDescription className="text-base">
            Upload your resume and add your demo reel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>You're almost there!</strong> Once you complete this step, you'll be redirected to activate your $1 full-access trial of Casting Companion. This gives you automatic submissions to roles that match your selections, plus instant access to hundreds of new casting calls you can apply to anytime.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Resume Upload */}
            <div>
              <Label htmlFor="resume">Resume (PDF, DOC, DOCX - Max 5MB)</Label>
              <div className="mt-2">
                {resume ? (
                  <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{resume.name}</p>
                      <p className="text-xs text-gray-500">
                        {(resume.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setResume(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <label
                      htmlFor="resume"
                      className="text-sm text-primary font-medium cursor-pointer hover:underline"
                    >
                      Click to upload resume
                    </label>
                    <input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Demo Reel URL */}
            <div>
              <Label htmlFor="reelUrl">Demo Reel URL (Optional)</Label>
              <Input
                id="reelUrl"
                type="url"
                placeholder="https://vimeo.com/your-reel or https://youtube.com/watch?v=..."
                value={reelUrl}
                onChange={(e) => setReelUrl(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Link to your demo reel on Vimeo, YouTube, or other platform
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell casting directors about yourself, your training, and experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
              />
              <p className="text-sm text-gray-500 mt-1">
                This will appear on your public profile
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Continue to Payment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
