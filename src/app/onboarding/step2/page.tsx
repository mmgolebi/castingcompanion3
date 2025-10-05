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

  const handleSkip = () => {
    router.push('/onboarding/step3');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 py-6 md:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8 text-center">Complete Your Profile</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 md:mb-12">
          <div className="flex items-center max-w-3xl w-full">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-1 md:mb-2">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-white text-xs md:text-sm font-medium text-center">Basic Info</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-purple-900 mb-1 md:mb-2 font-bold text-sm md:text-base">
                2
              </div>
              <span className="text-white text-xs md:text-sm font-medium text-center hidden sm:inline">Media Assets</span>
              <span className="text-white text-xs font-medium text-center sm:hidden">Media</span>
            </div>
            <div className="flex-1 h-1 bg-purple-700 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-700 flex items-center justify-center text-white mb-1 md:mb-2 text-sm md:text-base">
                3
              </div>
              <span className="text-purple-300 text-xs md:text-sm text-center hidden sm:inline">Preferences</span>
              <span className="text-purple-300 text-xs text-center sm:hidden">Prefs</span>
            </div>
            <div className="flex-1 h-1 bg-purple-700 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-700 flex items-center justify-center text-white mb-1 md:mb-2 text-sm md:text-base">
                4
              </div>
              <span className="text-purple-300 text-xs md:text-sm text-center">Logistics</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Upload Your Materials (Optional)</CardTitle>
            <CardDescription className="text-sm md:text-base">Professional headshot, full body photo, and resume - you can add these later</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div>
                <Label className="flex items-center gap-2 mb-3 text-base">
                  <ImageIcon className="h-5 w-5" />
                  Headshot
                </Label>
                {uploads.headshot ? (
                  <div className="space-y-3">
                    <img src={uploads.headshot} alt="Headshot" className="w-full max-w-sm mx-auto h-auto object-cover rounded-lg shadow-md" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setUploads({ ...uploads, headshot: '' })} className="w-full md:w-auto h-10">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setUploads({ ...uploads, headshot: res[0].url });
                        }
                      }}
                      onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3 text-base">
                  <User className="h-5 w-5" />
                  Full Body Photo
                </Label>
                {uploads.fullBody ? (
                  <div className="space-y-3">
                    <img src={uploads.fullBody} alt="Full Body" className="w-full max-w-sm mx-auto h-auto object-cover rounded-lg shadow-md" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setUploads({ ...uploads, fullBody: '' })} className="w-full md:w-auto h-10">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setUploads({ ...uploads, fullBody: res[0].url });
                        }
                      }}
                      onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3 text-base">
                  <FileText className="h-5 w-5" />
                  Acting Resume (PDF)
                </Label>
                {uploads.resume ? (
                  <div className="space-y-3">
                    <a href={uploads.resume} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-base block p-4 bg-gray-50 rounded-lg border">
                      View Resume
                    </a>
                    <Button type="button" variant="outline" size="sm" onClick={() => setUploads({ ...uploads, resume: '' })} className="w-full md:w-auto h-10">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                    <UploadButton
                      endpoint="pdfUploader"
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setUploads({ ...uploads, resume: res[0].url });
                        }
                      }}
                      onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/onboarding/step1')} className="w-full h-12 text-base">
                  Back
                </Button>
                <Button type="button" variant="secondary" onClick={handleSkip} className="w-full h-12 text-base">
                  Skip for Now
                </Button>
                <Button type="submit" className="w-full h-12 text-base font-semibold">
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
