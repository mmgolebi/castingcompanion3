'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadButton } from '@/components/upload-button';
import { CheckCircle2, Upload } from 'lucide-react';

export default function Step2Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [files, setFiles] = useState({
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
          setFiles({
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

  const handleContinue = async () => {
    if (!files.headshot) {
      alert('Please upload at least a headshot to continue');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress('Saving to profile...');

      // Use the Step 2 API endpoint instead of profile PATCH
      const response = await fetch('/api/onboarding/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headshot: files.headshot,
          fullBodyPhoto: files.fullBody,
          resume: files.resume,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      router.push('/onboarding/step3');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
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
              <span className="text-green-300 text-xs md:text-sm font-medium text-center">Basic Info</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-purple-900 mb-1 md:mb-2 font-bold text-sm md:text-base">
                2
              </div>
              <span className="text-white text-xs md:text-sm text-center hidden sm:inline">Media Assets</span>
              <span className="text-white text-xs text-center sm:hidden">Media</span>
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
            <CardTitle className="text-lg md:text-xl">Upload Your Materials</CardTitle>
            <CardDescription>Add your headshot, full body photo, and resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Headshot */}
            <div>
              <Label className="text-base mb-2 block">Headshot * (Required)</Label>
              {files.headshot ? (
                <div className="space-y-3">
                  <img src={files.headshot} alt="Headshot" className="w-48 h-48 object-cover rounded-lg" />
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      setFiles({ ...files, headshot: res[0].url });
                    }}
                    onUploadError={(error: Error) => {
                      alert(`Upload error: ${error.message}`);
                    }}
                  />
                </div>
              ) : (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setFiles({ ...files, headshot: res[0].url });
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload error: ${error.message}`);
                  }}
                />
              )}
            </div>

            {/* Full Body */}
            <div>
              <Label className="text-base mb-2 block">Full Body Photo (Optional)</Label>
              {files.fullBody ? (
                <div className="space-y-3">
                  <img src={files.fullBody} alt="Full body" className="w-48 h-64 object-cover rounded-lg" />
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      setFiles({ ...files, fullBody: res[0].url });
                    }}
                    onUploadError={(error: Error) => {
                      alert(`Upload error: ${error.message}`);
                    }}
                  />
                </div>
              ) : (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setFiles({ ...files, fullBody: res[0].url });
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload error: ${error.message}`);
                  }}
                />
              )}
            </div>

            {/* Resume */}
            <div>
              <Label className="text-base mb-2 block">Resume (Optional - PDF only)</Label>
              {files.resume ? (
                <div className="space-y-3">
                  <a href={files.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View uploaded resume
                  </a>
                  <UploadButton
                    endpoint="pdfUploader"
                    onClientUploadComplete={(res) => {
                      setFiles({ ...files, resume: res[0].url });
                    }}
                    onUploadError={(error: Error) => {
                      alert(`Upload error: ${error.message}`);
                    }}
                  />
                </div>
              ) : (
                <UploadButton
                  endpoint="pdfUploader"
                  onClientUploadComplete={(res) => {
                    setFiles({ ...files, resume: res[0].url });
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload error: ${error.message}`);
                  }}
                />
              )}
            </div>

            {uploadProgress && (
              <div className="text-center text-sm text-gray-600">
                {uploadProgress}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/onboarding/step1')}
                className="flex-1 h-12 text-base"
              >
                Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={uploading || !files.headshot}
                className="flex-1 h-12 text-base font-semibold"
              >
                {uploading ? 'Saving...' : 'Continue to Step 3'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
