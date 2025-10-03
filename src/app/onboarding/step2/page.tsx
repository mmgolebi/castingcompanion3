'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadButton } from '@/lib/uploadthing';
import { FileText, Image as ImageIcon, User } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-600 mb-1">Step 2 of 4</div>
              <div className="text-xs text-gray-500">Photos & Resume</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
          </div>
        </div>

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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUploads({ ...uploads, headshot: '' })}
                    >
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
                    onUploadError={(error) => {
                      alert(`Upload failed: ${error.message}`);
                    }}
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUploads({ ...uploads, fullBody: '' })}
                    >
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
                    onUploadError={(error) => {
                      alert(`Upload failed: ${error.message}`);
                    }}
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
                    
                      href={uploads.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View Resume
                    </a>
                    <br />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUploads({ ...uploads, resume: '' })}
                    >
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
                    onUploadError={(error) => {
                      alert(`Upload failed: ${error.message}`);
                    }}
                  />
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/onboarding/step1')}
                  className="flex-1"
                >
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
