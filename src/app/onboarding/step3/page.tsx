'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, CheckCircle2, Plus } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const customSkills = skills.filter(skill => !predefinedSkills.includes(skill));

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
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-1 md:mb-2">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-white text-xs md:text-sm font-medium text-center hidden sm:inline">Media Assets</span>
              <span className="text-white text-xs font-medium text-center sm:hidden">Media</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-purple-900 mb-1 md:mb-2 font-bold text-sm md:text-base">
                3
              </div>
              <span className="text-white text-xs md:text-sm font-medium text-center hidden sm:inline">Preferences</span>
              <span className="text-white text-xs font-medium text-center sm:hidden">Prefs</span>
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
            <CardTitle className="text-lg md:text-xl">Skills & Preferences</CardTitle>
            <CardDescription className="text-sm md:text-base">Tell us about your abilities and interests</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div>
                <Label className="text-base font-semibold mb-4 block">Role Types Interested In *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {roleTypes.map((roleType) => (
                    <div key={roleType.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`role-${roleType.value}`}
                        checked={roleTypesInterested.includes(roleType.value)}
                        onCheckedChange={() => handleRoleTypeToggle(roleType.value)}
                        className="h-5 w-5"
                      />
                      <Label htmlFor={`role-${roleType.value}`} className="font-normal cursor-pointer text-base flex-1">
                        {roleType.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-4 block">Special Skills</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {predefinedSkills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={skills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                        className="h-5 w-5"
                      />
                      <Label htmlFor={`skill-${skill}`} className="font-normal cursor-pointer text-base flex-1">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Label htmlFor="customSkill" className="text-base mb-2 block">Add Custom Skill</Label>
                  <div className="flex gap-2">
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
                      className="h-12 text-base flex-1"
                    />
                    <Button type="button" onClick={handleAddCustomSkill} variant="outline" className="h-12 px-6">
                      <Plus className="h-5 w-5" />
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
                          className="flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm md:text-base"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSkill(skill)}
                            className="hover:bg-purple-200 rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/onboarding/step2')}
                  className="w-full h-12 text-base"
                >
                  Back
                </Button>
                <Button type="submit" className="w-full h-12 text-base font-semibold">
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
