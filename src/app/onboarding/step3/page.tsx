'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function OnboardingStep3() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [formData, setFormData] = useState({
    roleTypesInterested: [] as string[],
    skills: [] as string[],
    comfortLevels: [] as string[],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const toggleRoleType = (role: string) => {
    const updated = formData.roleTypesInterested.includes(role)
      ? formData.roleTypesInterested.filter(r => r !== role)
      : [...formData.roleTypesInterested, role];
    setFormData({ ...formData, roleTypesInterested: updated });
  };

  const toggleSkill = (skill: string) => {
    const updated = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    setFormData({ ...formData, skills: updated });
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, customSkill.trim()] });
      setCustomSkill('');
    }
  };

  const toggleComfortLevel = (level: string) => {
    const updated = formData.comfortLevels.includes(level)
      ? formData.comfortLevels.filter(l => l !== level)
      : [...formData.comfortLevels, level];
    setFormData({ ...formData, comfortLevels: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.roleTypesInterested.length === 0) {
      alert('Please select at least one role type');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/onboarding/step3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/onboarding/step4');
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-white">✓</span>
              </div>
              <div className="bg-green-500 h-1 w-24"></div>
              <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-white">✓</span>
              </div>
              <div className="bg-green-500 h-1 w-24"></div>
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-primary">3</span>
              </div>
              <div className="bg-gray-300 h-1 w-24"></div>
              <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-gray-500">4</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-white text-xs">
            <div>Basic Info</div>
            <div>Media Assets</div>
            <div className="font-semibold">Preferences</div>
            <div>Logistics</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preferences & Skills</CardTitle>
            <CardDescription>Tell us about your interests and abilities</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Role Types Interested In *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['Lead', 'Supporting', 'Background', 'Extra', 'Commercial'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={formData.roleTypesInterested.includes(role.toUpperCase())}
                        onCheckedChange={() => toggleRoleType(role.toUpperCase())}
                      />
                      <Label htmlFor={`role-${role}`} className="font-normal cursor-pointer">
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Special Skills</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['Singing', 'Dancing', 'Musical Theatre', 'Stage Combat', 'Horseback Riding', 'Swimming', 
                    'Martial Arts', 'Gymnastics', 'Accent Work', 'Improvisation', 'Voice Over', 'Stand-up Comedy',
                    'Puppetry', 'Juggling', 'Magic'].map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={formData.skills.includes(skill)}
                        onCheckedChange={() => toggleSkill(skill)}
                      />
                      <Label htmlFor={`skill-${skill}`} className="font-normal cursor-pointer">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Input
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add custom skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addCustomSkill}>Add</Button>
                </div>
              </div>

              <div>
                <Label>Comfort Levels</Label>
                <p className="text-sm text-gray-500 mb-2">Select what you're comfortable with</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Nudity', 'Intimate Scenes', 'Stunts', 'Heights', 'Water Work', 'Fire Work',
                    'Animals', 'Weapons', 'Driving', 'Motorcycle'].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`comfort-${level}`}
                        checked={formData.comfortLevels.includes(level)}
                        onCheckedChange={() => toggleComfortLevel(level)}
                      />
                      <Label htmlFor={`comfort-${level}`} className="font-normal cursor-pointer">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.push('/onboarding/step2')} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : 'Continue to Logistics'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
