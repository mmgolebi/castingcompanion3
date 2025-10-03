'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadButton } from '@/lib/uploadthing';
import { FileText, Image as ImageIcon, User, CheckCircle2 } from 'lucide-react';

export default function Step2Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState({
    headshot: '',
    fullBody: '',
    resume: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setUploads({
            headshot: data.headshot || '',
            fullBody: data.fullBody || '',
            resume: data.resume || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploads.headshot || !uploads.fullBody || !uploads.resume) {
      alert('Please upload all required files');
      return;
    }

    try {
      const res = await fetch('/api/onboarding/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploads),
      });

      if (res.ok) {
        router.push('/onboarding/step3');
      } else {
        alert('Failed to save step 2');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-2">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <span className="text-white text-sm font-medium">Basic Info</span>
      </div>
      <div className="flex-1 h-1 bg-green-500 mx-4"></div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-purple-900 mb-2 font-bold">
          2
        </div>
        <span className="text-white text-sm font-medium">Media Assets</span>
      </div>
      <div className="flex-1 h-1 bg-gray-600 mx-4"></div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white mb-2">
          3
        </div>
        <span className="text-gray-400 text-sm">Preferences</span>
      </div>
      <div className="flex-1 h-1 bg-gray-600 mx-4"></div>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white mb-2">
          4
        </div>
        <span className="text-gray-400 text-sm">Logistics</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Complete Your Profile</h1>
        <StepIndicator />
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Materials</CardTitle>
            <CardDescription>Professional headshot, full body photo, and resume required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <ImageIcon className="h-4 w-4" />
                  Headshot *
                </Label>
                {uploads.headshot ? (
                  <div className="space-y-2">
                    <img src={uploads.headshot} alt="Headshot" className="w-48 h-48 object-cover rounded" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setUploads({ ...uploads, headshot: '' })}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setUploads({ ...uploads, headshot: res[0].url });
                      }
                    }}
                    onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                  />
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Full Body Photo *
                </Label>
                {uploads.fullBody ? (
                  <div className="space-y-2">
                    <img src={uploads.fullBody} alt="Full Body" className="w-48 h-64 object-cover rounded" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setUploads({ ...uploads, fullBody: '' })}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setUploads({ ...uploads, fullBody: res[0].url });
                      }
                    }}
                    onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                  />
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  Acting Resume (PDF) *
                </Label>
                {uploads.resume ? (
                  <div className="space-y-2">
                    <a href={uploads.resume} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      View Resume
                    </a>
                    <br />
                    <Button type="button" variant="outline" size="sm" onClick={() => setUploads({ ...uploads, resume: '' })}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <UploadButton
                    endpoint="pdfUploader"
                    onClientUploadComplete={(res) => {
                      if (res && res[0]) {
                        setUploads({ ...uploads, resume: res[0].url });
                      }
                    }}
                    onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                  />
                )}
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/onboarding/step1')} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue to Step 3
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
