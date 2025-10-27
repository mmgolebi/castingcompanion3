'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';

interface SubmissionPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  castingCall: any;
  profileId: string;
  onConfirm: (coverLetter: string) => void;
}

export function SubmissionPreviewModal({
  open,
  onOpenChange,
  castingCall,
  profileId,
  onConfirm,
}: SubmissionPreviewModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Generate cover letter when modal opens
  useEffect(() => {
    if (open && castingCall && !coverLetter) {
      generateCoverLetter();
    }
  }, [open, castingCall]);

  const generateCoverLetter = async () => {
    if (!castingCall) return;
    
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          castingCallId: castingCall.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoverLetter(data.coverLetter);
      } else {
        setCoverLetter(''); // Allow user to write their own if generation fails
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setCoverLetter(''); // Allow user to write their own
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = () => {
    setLoading(true);
    onConfirm(coverLetter);
  };

  const handleClose = () => {
    if (!loading) {
      setCoverLetter('');
      onOpenChange(false);
    }
  };

  if (!castingCall) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Review Your Submission
          </DialogTitle>
          <DialogDescription>
            Review and edit your AI-generated cover letter before submitting to {castingCall.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Casting Call Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold">{castingCall.title}</h4>
            <p className="text-sm text-gray-600">{castingCall.production}</p>
            <p className="text-sm text-gray-700 line-clamp-2">{castingCall.description}</p>
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Cover Letter</label>
              {generating && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating...
                </span>
              )}
            </div>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Your cover letter will appear here..."
              rows={12}
              disabled={generating}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Feel free to edit this cover letter before submitting
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || generating || !coverLetter.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Confirm & Submit'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
