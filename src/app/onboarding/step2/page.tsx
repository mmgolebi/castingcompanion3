'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ImageIcon, UserIcon, FileTextIcon, UploadIcon } from 'lucide-react';

export default function Step2Page() {
  const router = useRouter();
  const [headshot, setHeadshot] = useState<File | null>(null);
  const [fullBody, setFullBody] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    setter(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // TODO: Upload files to UploadThing
      // For now, just proceed to next step
      router.push('/onboarding/step3');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
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
          {/* Headshot Upload */}
          <div>
            <label className="flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 mb-3">
              <ImageIcon className="w-5 h-5" />
              Headshot
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                id="headshot"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setHeadshot)}
                className="hidden"
              />
              <label
                htmlFor="headshot"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <UploadIcon className="w-10 h-10 text-gray-400" />
                {headshot ? (
                  <span className="text-purple-600 font-medium">
                    {headshot.name}
                  </span>
                ) : (
                  <>
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

          {/* Full Body Photo Upload */}
          <div>
            <label className="flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 mb-3">
              <UserIcon className="w-5 h-5" />
              Full Body Photo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                id="fullbody"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setFullBody)}
                className="hidden"
              />
              <label
                htmlFor="fullbody"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <UploadIcon className="w-10 h-10 text-gray-400" />
                {fullBody ? (
                  <span className="text-purple-600 font-medium">
                    {fullBody.name}
                  </span>
                ) : (
                  <>
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

          {/* Resume Upload */}
          <div>
            <label className="flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 mb-3">
              <FileTextIcon className="w-5 h-5" />
              Acting Resume (PDF)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                id="resume"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, setResume)}
                className="hidden"
              />
              <label
                htmlFor="resume"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <UploadIcon className="w-10 h-10 text-gray-400" />
                {resume ? (
                  <span className="text-purple-600 font-medium">
                    {resume.name}
                  </span>
                ) : (
                  <>
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

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/onboarding/step1')}
              className="w-full sm:w-auto h-12 text-base"
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
              {uploading ? 'Uploading...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
