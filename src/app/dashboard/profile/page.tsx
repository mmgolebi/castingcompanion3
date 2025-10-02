'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadButton } from '@/lib/uploadthing';
import Image from 'next/image';
import { X } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [customSkill, setCustomSkill] = useState('');

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
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (customSkill.trim() && !profile.skills?.includes(customSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...(profile.skills || []), customSkill.trim()]
      });
      setCustomSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s: string) => s !== skillToRemove)
    });
  };

  const toggleRoleType = (role: string) => {
    const current = profile.roleTypesInterested || [];
    const updated = current.includes(role)
      ? current.filter((r: string) => r !== role)
      : [...current, role];
    setProfile({ ...profile, roleTypesInterested: updated });
  };

  const toggleComfortLevel = (level: string) => {
    const current = profile.comfortLevels || [];
    const updated = current.includes(level)
      ? current.filter((l: string) => l !== level)
      : [...current, level];
    setProfile({ ...profile, comfortLevels: updated });
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setProfile({ ...profile, phone: formatted });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-primary">
            Casting Companion
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/calls">
              <Button variant="ghost">Browse Calls</Button>
            </Link>
            <Link href="/dashboard/history">
              <Button variant="ghost">History</Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={profile.phone || ''}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={profile.city || ''}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="Los Angeles"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={profile.state || ''}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    placeholder="CA"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={profile.zipCode || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setProfile({ ...profile, zipCode: value });
                  }}
                  maxLength={5}
                  placeholder="90001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="age">Current Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })}
                  min={18}
                  max={100}
                  placeholder="25"
                  required
                />
              </div>

              <div>
                <Label>Playable Age Range *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    value={profile.playableAgeMin || ''}
                    onChange={(e) => setProfile({ ...profile, playableAgeMin: parseInt(e.target.value) || null })}
                    placeholder="Min (e.g., 18)"
                  />
                  <Input
                    type="number"
                    value={profile.playableAgeMax || ''}
                    onChange={(e) => setProfile({ ...profile, playableAgeMax: parseInt(e.target.value) || null })}
                    placeholder="Max (e.g., 30)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">The age range you can convincingly portray</p>
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={profile.gender || ''}
                  onValueChange={(value) => setProfile({ ...profile, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="NON_BINARY">Non-Binary</SelectItem>
                    <SelectItem value="ANY">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ethnicity">Ethnicity *</Label>
                <Select
                  value={profile.ethnicity || ''}
                  onValueChange={(value) => setProfile({ ...profile, ethnicity: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAUCASIAN">Caucasian</SelectItem>
                    <SelectItem value="AFRICAN_AMERICAN">African American</SelectItem>
                    <SelectItem value="ASIAN">Asian</SelectItem>
                    <SelectItem value="HISPANIC">Hispanic/Latino</SelectItem>
                    <SelectItem value="MIDDLE_EASTERN">Middle Eastern</SelectItem>
                    <SelectItem value="NATIVE_AMERICAN">Native American</SelectItem>
                    <SelectItem value="PACIFIC_ISLANDER">Pacific Islander</SelectItem>
                    <SelectItem value="MULTIRACIAL">Multiracial</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unionStatus">Union Status *</Label>
                <Select
                  value={profile.unionStatus || ''}
                  onValueChange={(value) => setProfile({ ...profile, unionStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select union status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAG_AFTRA">SAG-AFTRA</SelectItem>
                    <SelectItem value="NON_UNION">Non-Union</SelectItem>
                    <SelectItem value="EITHER">Either</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Media Assets */}
          <Card>
            <CardHeader>
              <CardTitle>Media Assets</CardTitle>
              <CardDescription>Upload your professional materials (optional - you can add these later)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Headshot (Optional)</Label>
                {profile.headshot && (
                  <div className="mt-2 mb-4">
                    <Image
                      src={profile.headshot}
                      alt="Headshot"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover border"
                    />
                  </div>
                )}
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setProfile({ ...profile, headshot: res[0].url });
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload failed: ${error.message}`);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Professional headshot (JPG, PNG, up to 4MB)</p>
              </div>

              <div>
                <Label>Full Body Shot (Optional)</Label>
                {profile.fullBody && (
                  <div className="mt-2 mb-4">
                    <Image
                      src={profile.fullBody}
                      alt="Full Body Shot"
                      width={200}
                      height={300}
                      className="rounded-lg object-cover border"
                    />
                  </div>
                )}
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setProfile({ ...profile, fullBody: res[0].url });
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload failed: ${error.message}`);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Full body photo (JPG, PNG, up to 4MB)</p>
              </div>

              <div>
                <Label>Resume (Optional)</Label>
                {profile.resume && (
                  <p className="text-sm text-gray-600 mt-1 mb-2">
                    Current: <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.resume.split('/').pop()}</a>
                  </p>
                )}
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setProfile({ ...profile, resume: res[0].url });
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Upload failed: ${error.message}`);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Acting resume (PDF, up to 4MB)</p>
              </div>

              <div>
                <Label htmlFor="demoReel">Demo Reel Link (Optional)</Label>
                <Input
                  id="demoReel"
                  value={profile.demoReel || ''}
                  onChange={(e) => setProfile({ ...profile, demoReel: e.target.value })}
                  placeholder="https://vimeo.com/your-reel"
                />
                <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or other video platform</p>
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences & Skills</CardTitle>
              <CardDescription>Tell us about your interests and abilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Role Types Interested In *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['Lead', 'Supporting', 'Background', 'Extra', 'Commercial'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={profile.roleTypesInterested?.includes(role.toUpperCase()) || false}
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
                <div className="grid grid-cols-2 gap-3 mt-2 mb-3">
                  {['Singing', 'Dancing', 'Musical Theatre', 'Stage Combat', 'Horseback Riding', 'Swimming', 
                    'Martial Arts', 'Gymnastics', 'Accent Work', 'Improvisation', 'Voice Over', 'Stand-up Comedy',
                    'Puppetry', 'Juggling', 'Magic'].map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={profile.skills?.includes(skill) || false}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setProfile({ ...profile, skills: [...(profile.skills || []), skill] });
                          } else {
                            removeSkill(skill);
                          }
                        }}
                      />
                      <Label htmlFor={`skill-${skill}`} className="font-normal cursor-pointer">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.skills?.filter((s: string) => 
                    !['Singing', 'Dancing', 'Musical Theatre', 'Stage Combat', 'Horseback Riding', 'Swimming', 
                      'Martial Arts', 'Gymnastics', 'Accent Work', 'Improvisation', 'Voice Over', 'Stand-up Comedy',
                      'Puppetry', 'Juggling', 'Magic'].includes(s)
                  ).map((skill: string) => (
                    <div key={skill} className="bg-primary text-white px-3 py-1 rounded-full flex items-center gap-2">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:bg-primary-dark rounded-full">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add custom skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill}>Add</Button>
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
                        checked={profile.comfortLevels?.includes(level) || false}
                        onCheckedChange={() => toggleComfortLevel(level)}
                      />
                      <Label htmlFor={`comfort-${level}`} className="font-normal cursor-pointer">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logistics & Physical Attributes */}
          <Card>
            <CardHeader>
              <CardTitle>Logistics & Physical Attributes</CardTitle>
              <CardDescription>Final details to complete your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="availability">Availability *</Label>
                <Select
                  value={profile.availability || ''}
                  onValueChange={(value) => setProfile({ ...profile, availability: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMMEDIATELY">Immediately</SelectItem>
                    <SelectItem value="WITHIN_MONTH">Within a Month</SelectItem>
                    <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reliableTransportation"
                  checked={profile.reliableTransportation || false}
                  onCheckedChange={(checked) => setProfile({ ...profile, reliableTransportation: !!checked })}
                />
                <Label htmlFor="reliableTransportation" className="font-normal cursor-pointer">
                  I have reliable transportation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="travelWilling"
                  checked={profile.travelWilling || false}
                  onCheckedChange={(checked) => setProfile({ ...profile, travelWilling: !!checked })}
                />
                <Label htmlFor="travelWilling" className="font-normal cursor-pointer">
                  Willing to travel for roles
                </Label>
              </div>

              <div>
                <Label htmlFor="compensationPreference">Compensation Preferences *</Label>
                <Select
                  value={profile.compensationPreference || ''}
                  onValueChange={(value) => setProfile({ ...profile, compensationPreference: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select compensation preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID_ONLY">Paid Only</SelectItem>
                    <SelectItem value="PAID_OR_DEFERRED">Paid or Deferred</SelectItem>
                    <SelectItem value="ANY">Any (Including Unpaid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Physical Attributes</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="heightFeet" className="text-sm">Height</Label>
                    <div className="flex gap-2">
                      <Input
                        id="heightFeet"
                        type="number"
                        value={Math.floor((profile.height || 0) / 12) || ''}
                        onChange={(e) => {
                          const feet = parseInt(e.target.value) || 0;
                          const inches = (profile.height || 0) % 12;
                          setProfile({ ...profile, height: feet * 12 + inches });
                        }}
                        placeholder="Feet"
                      />
                      <Input
                        type="number"
                        value={(profile.height || 0) % 12 || ''}
                        onChange={(e) => {
                          const feet = Math.floor((profile.height || 0) / 12);
                          const inches = parseInt(e.target.value) || 0;
                          setProfile({ ...profile, height: feet * 12 + inches });
                        }}
                        placeholder="Inches"
                        max={11}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">e.g., 5 feet 8 inches</p>
                  </div>

                  <div>
                    <Label htmlFor="weight" className="text-sm">Weight</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profile.weight || ''}
                      onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) || null })}
                      placeholder="150 lbs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hairColor">Hair Color</Label>
                  <Select
                    value={profile.hairColor || ''}
                    onValueChange={(value) => setProfile({ ...profile, hairColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hair color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BLACK">Black</SelectItem>
                      <SelectItem value="BROWN">Brown</SelectItem>
                      <SelectItem value="BLONDE">Blonde</SelectItem>
                      <SelectItem value="RED">Red</SelectItem>
                      <SelectItem value="GRAY">Gray</SelectItem>
                      <SelectItem value="WHITE">White</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="eyeColor">Eye Color</Label>
                  <Select
                    value={profile.eyeColor || ''}
                    onValueChange={(value) => setProfile({ ...profile, eyeColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select eye color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BLUE">Blue</SelectItem>
                      <SelectItem value="BROWN">Brown</SelectItem>
                      <SelectItem value="GREEN">Green</SelectItem>
                      <SelectItem value="HAZEL">Hazel</SelectItem>
                      <SelectItem value="GRAY">Gray</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visibleTattoos"
                  checked={profile.visibleTattoos || false}
                  onCheckedChange={(checked) => setProfile({ ...profile, visibleTattoos: !!checked })}
                />
                <Label htmlFor="visibleTattoos" className="font-normal cursor-pointer">
                  I have visible tattoos
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
}
