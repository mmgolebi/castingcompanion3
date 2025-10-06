'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Copy, ExternalLink, Check } from 'lucide-react';

interface PublicProfileSettingsProps {
  currentSlug?: string;
  isPublic: boolean;
  userName: string;
}

export function PublicProfileSettings({ currentSlug, isPublic, userName }: PublicProfileSettingsProps) {
  const [slug, setSlug] = useState(currentSlug || '');
  const [publicProfile, setPublicProfile] = useState(isPublic);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const profileUrl = `${window.location.origin}/actor/${slug}`;

  const handleSave = async () => {
    if (!slug.trim()) {
      toast({
        title: "Error",
        description: "Please enter a profile URL",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile/slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, isPublic: publicProfile }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update');
      }

      toast({
        title: "Success!",
        description: "Your public profile settings have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Profile URL copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Public Profile</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Create a shareable profile link for casting directors and agents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="public-toggle" className="text-base font-medium cursor-pointer">
              Make Profile Public
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              Allow others to view your profile via a public link
            </p>
          </div>
          <Switch
            id="public-toggle"
            checked={publicProfile}
            onCheckedChange={setPublicProfile}
          />
        </div>

        {publicProfile && (
          <>
            <div>
              <Label htmlFor="slug" className="text-base">Your Profile URL</Label>
              <div className="mt-2 flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    /actor/
                  </span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder={userName.toLowerCase().replace(/\s+/g, '-')}
                    className="h-12 text-base pl-16"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use letters, numbers, and hyphens only
              </p>
            </div>

            {slug && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <Label className="text-sm text-gray-600 mb-2 block">Your Public Profile Link:</Label>
                <div className="flex gap-2">
                  <Input
                    value={profileUrl}
                    readOnly
                    className="font-mono text-sm bg-white"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="shrink-0"
                  >
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <Button 
          onClick={handleSave} 
          disabled={saving || (publicProfile && !slug.trim())}
          className="w-full h-12 text-base font-semibold"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
