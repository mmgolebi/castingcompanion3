'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadButton } from '@/lib/uploadthing';

export default function OnboardingStep2() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    headshot: '',
    fullBody: '',
    resume: '',
    demoReel: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/onboarding/step3');
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-white">✓</span>
              </div>
              <div className="bg-green-500 h-1 w-24"></div>
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-primary">2</span>
              </div>
              <div className="bg-gray-300 h-1 w-24"></div>
              <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-gray-500">3</span>
              </div>
              <div className="bg-gray-300 h-1 w-24"></div>
              <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-gray-500">4</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-white text-xs">
            <div>Basic Info</div>
            <div className="font-semibold">Media Assets</div>
            <div>Preferences</div>
            <div>Logistics</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Media Assets</CardTitle>
            <CardDescription>Upload your professional materials (optional - you can add these later)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Headshot (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      setFormData({ ...formData, headshot: res[0].url });
                    }}
                    onUploadError={(error: Error) => {
                      alert(`Upload failed: ${error.message}`);
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2">Professional headshot (JPG, PNG, up to 4MB)</p>
                </div>
              </div>

              <div>
                <Label>Full Body Shot (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      setFormData({ ...formData, fullBody: res[0].url });
                    }}
                    onUploadError={(error: Error) => {
                      alert(`Upload failed: ${error.message}`);
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2">Full body photo (JPG, PNG, up to 4MB)</p>
                </div>
              </div>

              <div>
                <Label>Resume (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      setFormData({ ...formData, resume: res[0].url });
                    }}
                    onUploadError={(error: Error) => {
                      alert(`Upload failed: ${error.message}`);
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2">Acting resume (PDF, up to 4MB)</p>
                </div>
              </div>

              <div>
                <Label htmlFor="demoReel">Demo Reel Link (Optional)</Label>
                <Input
                  id="demoReel"
                  value={formData.demoReel}
                  onChange={(e) => setFormData({ ...formData, demoReel: e.target.value })}
                  placeholder="https://vimeo.com/your-reel"
                />
                <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or other video platform</p>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/onboarding/step1')} className="flex-1">
                  Back
                </Button>
                <Button type="button" variant="ghost" onClick={() => router.push('/onboarding/step3')} className="flex-1">
                  Skip for Now
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
