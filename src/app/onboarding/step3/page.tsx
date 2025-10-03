'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

export default function Step3Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [roleTypesInterested, setRoleTypesInterested] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');

  const predefinedSkills = [
    'Singing', 'Dancing', 'Musical Theatre', 'Stage Combat', 'Horseback Riding',
    'Swimming', 'Martial Arts', 'Gymnastics', 'Accent Work', 'Improvisation',
    'Voice Over', 'Stand-up Comedy', 'Puppetry', 'Juggling', 'Magic'
  ];

  const roleTypes = [
    { value: 'LEAD', label: 'Lead' },
    { value: 'SUPPORTING', label: 'Supporting' },
    { value: 'BACKGROUND', label: 'Background' },
    { value: 'EXTRA', label: 'Extra' },
    { value: 'COMMERCIAL', label: 'Commercial' },
  ];

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
          setSkills(data.skills || []);
          setRoleTypesInterested(data.roleTypesInterested || []);
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

  const handleSkillToggle = (skill: string) => {
    setSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleRoleTypeToggle = (roleType: string) => {
    setRoleTypesInterested(prev =>
      prev.includes(roleType)
        ? prev.filter(r => r !== roleType)
        : [...prev, roleType]
    );
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const handleRemoveCustomSkill = (skill: string) => {
    // Only allow removing custom skills (not predefined ones via this method)
    if (!predefinedSkills.includes(skill)) {
      setSkills(prev => prev.filter(s => s !== skill));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (roleTypesInterested.length === 0) {
      alert('Please select at least one role type');
      return;
    }

    try {
      const res = await fetch('/api/onboarding/step3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          roleTypesInterested,
        }),
      });

      if (res.ok) {
        router.push('/onboarding/step4');
      } else {
        alert('Failed to save step 3');
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

  // Get custom skills (those not in predefined list)
  const customSkills = skills.filter(skill => !predefinedSkills.includes(skill));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <span className="text-sm font-medium text-gray-600">Step 3 of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Skills & Preferences</CardTitle>
            <CardDescription>Tell us about your abilities and interests</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Role Types Interested In *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roleTypes.map((roleType) => (
                    <div key={roleType.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${roleType.value}`}
                        checked={roleTypesInterested.includes(roleType.value)}
                        onCheckedChange={() => handleRoleTypeToggle(roleType.value)}
                      />
                      <Label htmlFor={`role-${roleType.value}`} className="font-normal cursor-pointer">
                        {roleType.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Special Skills</Label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {predefinedSkills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={skills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label htmlFor={`skill-${skill}`} className="font-normal cursor-pointer">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Label htmlFor="customSkill">Add Custom Skill</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="customSkill"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="e.g., Fire breathing, Contortionist"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddCustomSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>

                {customSkills.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm text-gray-600 mb-2 block">Custom Skills:</Label>
                    <div className="flex flex-wrap gap-2">
                      {customSkills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSkill(skill)}
                            className="hover:bg-purple-200 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/onboarding/step2')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Continue to Step 4
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
