'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ImageIcon, UserIcon, FileTextIcon, UploadIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';

export default function Step2Page() {
  const router = useRouter();
  const [headshot, setHeadshot] = useState<File | null>(null);
  const [fullBody, setFullBody] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const { startUpload: uploadImage } = useUploadThing("imageUploader");
  const { startUpload: uploadPdf } = useUploadThing("pdfUploader");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    setter(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const uploadData: any = {};

      if (headshot) {
        setUploadProgress('Uploading headshot...');
        const res = await uploadImage([headshot]);
        if (res?.[0]?.url) {
          uploadData.headshot = res[0].url;
        }
      }

      if (fullBody) {
        setUploadProgress('Uploading full body photo...');
        const res = await uploadImage([fullBody]);
        if (res?.[0]?.url) {
          uploadData.fullBodyPhoto = res[0].url;
        }
      }

      if (resume) {
        setUploadProgress('Uploading resume...');
        const res = await uploadPdf([resume]);
        if (res?.[0]?.url) {
          uploadData.resume = res[0].url;
        }
      }

      if (Object.keys(uploadData).length > 0) {
        setUploadProgress('Saving to profile...');
        const profileResponse = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadData),
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to save profile');
        }
      }

      router.push('/onboarding/step3');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/step3');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Upload Your Materials (Optional)
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Professional headshot, full body photo, and resume - you can add these later
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 mb-3">
              <ImageIcon className="w-5 h-5" />
              Headshot
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              headshot 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-purple-500'
            }`}>
              <input
                type="file"
                id="headshot"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setHeadshot)}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="headshot"
                className={`flex flex-col items-center gap-3 ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {headshot ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                    <span className="text-green-700 font-semibold">
                      {headshot.name}
                    </span>
                    <span className="text-green-600 text-sm">
                      {formatFileSize(headshot.size)} • Click to change
                    </span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-10 h-10 text-gray-400" />
                    <span className="text-purple-600 font-medium text-base md:text-lg">
                      Choose File
                    </span>
                    <span className="text-gray-500 text-sm">
                      Image (4MB max)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 mb-3">
              <UserIcon className="w-5 h-5" />
              Full Body Photo
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              fullBody 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-purple-500'
            }`}>
              <input
                type="file"
                id="fullbody"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setFullBody)}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="fullbody"
                className={`flex flex-col items-center gap-3 ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {fullBody ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                    <span className="text-green-700 font-semibold">
                      {fullBody.name}
                    </span>
                    <span className="text-green-600 text-sm">
                      {formatFileSize(fullBody.size)} • Click to change
                    </span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-10 h-10 text-gray-400" />
                    <span className="text-purple-600 font-medium text-base md:text-lg">
                      Choose File
                    </span>
                    <span className="text-gray-500 text-sm">
                      Image (4MB max)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 mb-3">
              <FileTextIcon className="w-5 h-5" />
              Acting Resume (PDF)
            </label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              resume 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-purple-500'
            }`}>
              <input
                type="file"
                id="resume"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, setResume)}
                className="hidden"
                disabled={uploading}
              />
              <label
                htmlFor="resume"
                className={`flex flex-col items-center gap-3 ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {resume ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                    <span className="text-green-700 font-semibold">
                      {resume.name}
                    </span>
                    <span className="text-green-600 text-sm">
                      {formatFileSize(resume.size)} • Click to change
                    </span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-10 h-10 text-gray-400" />
                    <span className="text-purple-600 font-medium text-base md:text-lg">
                      Choose File
                    </span>
                    <span className="text-gray-500 text-sm">
                      PDF (4MB max)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          {uploading && uploadProgress && (
            <div className="flex items-center justify-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span className="text-purple-700 font-medium">{uploadProgress}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/onboarding/step1')}
              className="w-full sm:w-auto h-12 text-base"
              disabled={uploading}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="w-full sm:w-auto h-12 text-base"
              disabled={uploading}
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              className="w-full sm:flex-1 h-12 text-base bg-purple-600 hover:bg-purple-700"
              disabled={uploading}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
