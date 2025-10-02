'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { US_STATES, MAJOR_CITIES_BY_STATE } from '@/lib/locations';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    zipCode: '',
    age: '',
    playableAgeMin: '',
    playableAgeMax: '',
    gender: '',
    height: '',
    weight: '',
    ethnicity: '',
    hairColor: '',
    eyeColor: '',
    visibleTattoos: false,
    headshot: '',
    fullBody: '',
    resume: '',
    demoReel: '',
    unionStatus: '',
    skills: [] as string[],
    roleTypesInterested: [] as string[],
    comfortLevels: [] as string[],
    availability: '',
    compensationPreference: '',
    compensationMin: '',
    reliableTransportation: false,
    travelWilling: false,
  });

  const availableSkills = [
    'Singing', 'Dancing', 'Musical Theatre', 'Stage Combat', 'Horseback Riding',
    'Swimming', 'Martial Arts', 'Gymnastics', 'Accent Work', 'Improvisation',
    'Voice Over', 'Stand-up Comedy', 'Puppetry', 'Juggling', 'Magic'
  ];

  const comfortOptions = [
    'Nudity', 'Intimate Scenes', 'Stunts', 'Heights', 'Water Work',
    'Fire Work', 'Animals', 'Weapons', 'Driving', 'Motorcycle'
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
          
          // Convert total height in inches to feet and inches
          if (data.height) {
            const totalInches = data.height;
            const feet = Math.floor(totalInches / 12);
            const inches = totalInches % 12;
            setHeightFeet(feet.toString());
            setHeightInches(inches.toString());
          }
          
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            age: data.age?.toString() || '',
            playableAgeMin: data.playableAgeMin?.toString() || '',
            playableAgeMax: data.playableAgeMax?.toString() || '',
            gender: data.gender || '',
            height: data.height?.toString() || '',
            weight: data.weight?.toString() || '',
            ethnicity: data.ethnicity || '',
            hairColor: data.hairColor || '',
            eyeColor: data.eyeColor || '',
            visibleTattoos: data.visibleTattoos || false,
            headshot: data.headshot || '',
            fullBody: data.fullBody || '',
            resume: data.resume || '',
            demoReel: data.demoReel || '',
            unionStatus: data.unionStatus || '',
            skills: data.skills || [],
            roleTypesInterested: data.roleTypesInterested || [],
            comfortLevels: data.comfortLevels || [],
            availability: data.availability || '',
            compensationPreference: data.compensationPreference || '',
            compensationMin: data.compensationMin || '',
            reliableTransportation: data.reliableTransportation || false,
            travelWilling: data.travelWilling || false,
          });
          if (data.state) {
            setSelectedState(data.state);
          }
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

  useEffect(() => {
    if (selectedState) {
      const cities = MAJOR_CITIES_BY_STATE[selectedState] || [];
      setAvailableCities(cities);
      if (profile.state !== selectedState) {
        setProfile({ ...profile, state: selectedState });
      }
    }
  }, [selectedState]);

  // Update total height when feet or inches change
  useEffect(() => {
    if (heightFeet || heightInches) {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      const totalHeight = (feet * 12) + inches;
      setProfile({ ...profile, height: totalHeight.toString() });
    }
  }, [heightFeet, heightInches]);

  const handleSkillToggle = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.includes(skill)
        ? profile.skills.filter(s => s !== skill)
        : [...profile.skills, skill]
    });
  };

  const handleRoleTypeToggle = (roleType: string) => {
    setProfile({
      ...profile,
      roleTypesInterested: profile.roleTypesInterested.includes(roleType)
        ? profile.roleTypesInterested.filter(r => r !== roleType)
        : [...profile.roleTypesInterested, roleType]
    });
  };

  const handleComfortToggle = (comfort: string) => {
    setProfile({
      ...profile,
      comfortLevels: profile.comfortLevels.includes(comfort)
        ? profile.comfortLevels.filter(c => c !== comfort)
        : [...profile.comfortLevels, comfort]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          age: profile.age ? parseInt(profile.age) : null,
          playableAgeMin: profile.playableAgeMin ? parseInt(profile.playableAgeMin) : null,
          playableAgeMax: profile.playableAgeMax ? parseInt(profile.playableAgeMax) : null,
          height: profile.height ? parseInt(profile.height) : null,
          weight: profile.weight ? parseInt(profile.weight) : null,
        }),
      });

      if (res.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="physical">Physical</TabsTrigger>
          <TabsTrigger value="skills">Skills & Preferences</TabsTrigger>
          <TabsTrigger value="logistics">Logistics</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="basic">
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
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={selectedState}
                      onValueChange={(value) => setSelectedState(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    {availableCities.length > 0 ? (
                      <Select
                        value={profile.city}
                        onValueChange={(value) => setProfile({ ...profile, city: value })}
                        disabled={!selectedState}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="city"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        placeholder="Enter city"
                        disabled={!selectedState}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={profile.zipCode}
                    onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                    maxLength={5}
                  />
                </div>

                <div>
                  <Label htmlFor="age">Current Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="playableAgeMin">Playable Age Range *</Label>
                    <Input
                      id="playableAgeMin"
                      type="number"
                      value={profile.playableAgeMin}
                      onChange={(e) => setProfile({ ...profile, playableAgeMin: e.target.value })}
                      placeholder="Min"
                    />
                  </div>
                  <div>
                    <Label>&nbsp;</Label>
                    <Input
                      type="number"
                      value={profile.playableAgeMax}
                      onChange={(e) => setProfile({ ...profile, playableAgeMax: e.target.value })}
                      placeholder="Max"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">The age range you can convincingly portray</p>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="NON_BINARY">Non-Binary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="demoReel">Demo Reel URL</Label>
                  <Input
                    id="demoReel"
                    type="url"
                    value={profile.demoReel}
                    onChange={(e) => setProfile({ ...profile, demoReel: e.target.value })}
                    placeholder="https://vimeo.com/..."
                  />
                </div>

                <div>
                  <Label>Uploaded Files</Label>
                  <div className="space-y-2 mt-2">
                    {profile.headshot && (
                      <div className="text-sm">
                        <span className="font-medium">Headshot:</span>{' '}
                        <a href={profile.headshot} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          View
                        </a>
                      </div>
                    )}
                    {profile.fullBody && (
                      <div className="text-sm">
                        <span className="font-medium">Full Body:</span>{' '}
                        <a href={profile.fullBody} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          View
                        </a>
                      </div>
                    )}
                    {profile.resume && (
                      <div className="text-sm">
                        <span className="font-medium">Resume:</span>{' '}
                        <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          View
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="physical">
            <Card>
              <CardHeader>
                <CardTitle>Physical Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Height</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <Input
                      type="number"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      placeholder="Feet"
                      min="0"
                      max="8"
                    />
                    <Input
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      placeholder="Inches"
                      min="0"
                      max="11"
                    />
                    <div className="flex items-center text-sm text-gray-600">
                      e.g., 5 feet 8 inches
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    placeholder="150 lbs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hairColor">Hair Color</Label>
                    <Select
                      value={profile.hairColor}
                      onValueChange={(value) => setProfile({ ...profile, hairColor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hair color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Black">Black</SelectItem>
                        <SelectItem value="Brown">Brown</SelectItem>
                        <SelectItem value="Blonde">Blonde</SelectItem>
                        <SelectItem value="Red">Red</SelectItem>
                        <SelectItem value="Gray">Gray</SelectItem>
                        <SelectItem value="White">White</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="eyeColor">Eye Color</Label>
                    <Select
                      value={profile.eyeColor}
                      onValueChange={(value) => setProfile({ ...profile, eyeColor: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select eye color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Brown">Brown</SelectItem>
                        <SelectItem value="Blue">Blue</SelectItem>
                        <SelectItem value="Green">Green</SelectItem>
                        <SelectItem value="Hazel">Hazel</SelectItem>
                        <SelectItem value="Gray">Gray</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visibleTattoos"
                    checked={profile.visibleTattoos}
                    onCheckedChange={(checked) => setProfile({ ...profile, visibleTattoos: checked as boolean })}
                  />
                  <Label htmlFor="visibleTattoos">I have visible tattoos</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="unionStatus">Union Status</Label>
                  <Select
                    value={profile.unionStatus}
                    onValueChange={(value) => setProfile({ ...profile, unionStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select union status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAG_AFTRA">SAG-AFTRA</SelectItem>
                      <SelectItem value="NON_UNION">Non-Union</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Role Types Interested In</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {['LEAD', 'SUPPORTING', 'BACKGROUND', 'EXTRA', 'COMMERCIAL'].map((roleType) => (
                      <div key={roleType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${roleType}`}
                          checked={profile.roleTypesInterested.includes(roleType)}
                          onCheckedChange={() => handleRoleTypeToggle(roleType)}
                        />
                        <Label htmlFor={`role-${roleType}`}>{roleType.charAt(0) + roleType.slice(1).toLowerCase()}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Special Skills</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {availableSkills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={profile.skills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <Label htmlFor={`skill-${skill}`}>{skill}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Comfort Levels</Label>
                  <p className="text-sm text-gray-600 mb-2">Select what you're comfortable with</p>
                  <div className="grid grid-cols-2 gap-4">
                    {comfortOptions.map((comfort) => (
                      <div key={comfort} className="flex items-center space-x-2">
                        <Checkbox
                          id={`comfort-${comfort}`}
                          checked={profile.comfortLevels.includes(comfort)}
                          onCheckedChange={() => handleComfortToggle(comfort)}
                        />
                        <Label htmlFor={`comfort-${comfort}`}>{comfort}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logistics">
            <Card>
              <CardHeader>
                <CardTitle>Logistics & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={profile.availability}
                    onValueChange={(value) => setProfile({ ...profile, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full-time (available immediately)</SelectItem>
                      <SelectItem value="PART_TIME">Part-time (flexible schedule)</SelectItem>
                      <SelectItem value="WEEKENDS">Weekends only</SelectItem>
                      <SelectItem value="EVENINGS">Evenings only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reliableTransportation"
                    checked={profile.reliableTransportation}
                    onCheckedChange={(checked) => setProfile({ ...profile, reliableTransportation: checked as boolean })}
                  />
                  <Label htmlFor="reliableTransportation">I have reliable transportation</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="travelWilling"
                    checked={profile.travelWilling}
                    onCheckedChange={(checked) => setProfile({ ...profile, travelWilling: checked as boolean })}
                  />
                  <Label htmlFor="travelWilling">Willing to travel for roles</Label>
                </div>

                <div>
                  <Label htmlFor="compensationPreference">Compensation Preferences</Label>
                  <Select
                    value={profile.compensationPreference}
                    onValueChange={(value) => setProfile({ ...profile, compensationPreference: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID_ONLY">Paid roles only</SelectItem>
                      <SelectItem value="OPEN_TO_UNPAID">Open to unpaid/student films</SelectItem>
                      <SelectItem value="NEGOTIABLE">Negotiable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="compensationMin">Minimum Day Rate (optional)</Label>
                  <Input
                    id="compensationMin"
                    value={profile.compensationMin}
                    onChange={(e) => setProfile({ ...profile, compensationMin: e.target.value })}
                    placeholder="e.g., $200/day"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
