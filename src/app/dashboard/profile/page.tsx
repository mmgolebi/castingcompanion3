'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadButton } from '@/components/upload-button';
import { US_STATES, MAJOR_CITIES_BY_STATE } from '@/lib/locations';
import { User, Image as ImageIcon, MapPin, Briefcase, Settings, Search, X, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    playableAgeMin: '',
    playableAgeMax: '',
    gender: '',
    ethnicity: '',
    unionStatus: '',
    height: '',
    weight: '',
    hairColor: '',
    eyeColor: '',
    visibleTattoos: false,
    headshot: '',
    fullBody: '',
    resume: '',
    city: '',
    state: '',
    zipCode: '',
    availability: '',
    reliableTransportation: false,
    travelWilling: false,
    compensationPreference: '',
    compensationMin: '',
    skills: [] as string[],
    roleTypesInterested: [] as string[],
  });

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
    const handleClickOutside = (event: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          
          if (data.height) {
            const totalInches = data.height;
            const feet = Math.floor(totalInches / 12);
            const inches = totalInches % 12;
            setHeightFeet(feet.toString());
            setHeightInches(inches.toString());
          }

          if (data.state) {
            setSelectedState(data.state);
            const stateName = US_STATES.find(s => s.value === data.state)?.label || '';
            setStateSearch(stateName);
          }
          
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            age: data.age?.toString() || '',
            playableAgeMin: data.playableAgeMin?.toString() || '',
            playableAgeMax: data.playableAgeMax?.toString() || '',
            gender: data.gender || '',
            ethnicity: data.ethnicity || '',
            unionStatus: data.unionStatus || '',
            height: data.height?.toString() || '',
            weight: data.weight?.toString() || '',
            hairColor: data.hairColor || '',
            eyeColor: data.eyeColor || '',
            visibleTattoos: data.visibleTattoos || false,
            headshot: data.headshot || '',
            fullBody: data.fullBody || '',
            resume: data.resume || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            availability: data.availability || '',
            reliableTransportation: data.reliableTransportation || false,
            travelWilling: data.travelWilling || false,
            compensationPreference: data.compensationPreference || '',
            compensationMin: data.compensationMin || '',
            skills: data.skills || [],
            roleTypesInterested: data.roleTypesInterested || [],
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

  useEffect(() => {
    if (selectedState) {
      const cities = MAJOR_CITIES_BY_STATE[selectedState] || [];
      setAvailableCities(cities);
      setProfile({ ...profile, state: selectedState });
    }
  }, [selectedState]);

  useEffect(() => {
    if (heightFeet || heightInches) {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      const totalHeight = (feet * 12) + inches;
      setProfile({ ...profile, height: totalHeight.toString() });
    }
  }, [heightFeet, heightInches]);

  const filteredStates = US_STATES.filter(state =>
    state.label.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleStateSelect = (stateValue: string, stateLabel: string) => {
    setSelectedState(stateValue);
    setStateSearch(stateLabel);
    setShowStateDropdown(false);
  };

  const handleSkillToggle = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleRoleTypeToggle = (roleType: string) => {
    setProfile(prev => ({
      ...prev,
      roleTypesInterested: prev.roleTypesInterested.includes(roleType)
        ? prev.roleTypesInterested.filter(r => r !== roleType)
        : [...prev.roleTypesInterested, roleType]
    }));
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setCustomSkill('');
    }
  };

  const handleRemoveCustomSkill = (skill: string) => {
    if (!predefinedSkills.includes(skill)) {
      setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    }
  };

  const formatPhoneAsYouType = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneAsYouType(value);
    setProfile({ ...profile, phone: formatted });
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
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
        toast({
          title: "Success!",
          description: "Your profile has been updated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving",
        variant: "destructive",
      });
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

  const customSkills = profile.skills.filter(skill => !predefinedSkills.includes(skill));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-3xl font-bold">Profile Settings</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Manage your actor profile</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto mb-6">
            <TabsTrigger value="basic" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3">
              <User className="h-4 w-4" />
              <span className="text-xs md:text-sm">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3">
              <ImageIcon className="h-4 w-4" />
              <span className="text-xs md:text-sm">Media</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3">
              <Briefcase className="h-4 w-4" />
              <span className="text-xs md:text-sm">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3">
              <MapPin className="h-4 w-4" />
              <span className="text-xs md:text-sm">Location</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Basic Information</CardTitle>
                <CardDescription className="text-sm md:text-base">Your personal and physical details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-base">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="h-12 text-base mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="h-12 text-base mt-2 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-base">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={profile.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-12 text-base mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-base">Current Age</Label>
                  <Input
                    id="age"
                    type="number"
                    inputMode="numeric"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="h-12 text-base mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base">Playable Age Range</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={profile.playableAgeMin}
                      onChange={(e) => setProfile({ ...profile, playableAgeMin: e.target.value })}
                      placeholder="Min age"
                      className="h-12 text-base"
                    />
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={profile.playableAgeMax}
                      onChange={(e) => setProfile({ ...profile, playableAgeMax: e.target.value })}
                      placeholder="Max age"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender" className="text-base">Gender</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger className="h-12 text-base mt-2">
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
                  <Label className="text-base">Height</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      placeholder="Feet"
                      className="h-12 text-base"
                    />
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      placeholder="Inches"
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weight" className="text-base">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    inputMode="numeric"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="h-12 text-base mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="ethnicity" className="text-base">Ethnicity</Label>
                  <Select
                    value={profile.ethnicity}
                    onValueChange={(value) => setProfile({ ...profile, ethnicity: value })}
                  >
                    <SelectTrigger className="h-12 text-base mt-2">
                      <SelectValue placeholder="Select ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WHITE">White/Caucasian</SelectItem>
                      <SelectItem value="BLACK">Black/African American</SelectItem>
                      <SelectItem value="HISPANIC">Hispanic/Latino</SelectItem>
                      <SelectItem value="ASIAN">Asian</SelectItem>
                      <SelectItem value="NATIVE_AMERICAN">Native American</SelectItem>
                      <SelectItem value="MIDDLE_EASTERN">Middle Eastern</SelectItem>
                      <SelectItem value="PACIFIC_ISLANDER">Pacific Islander</SelectItem>
                      <SelectItem value="MIXED">Mixed/Multiracial</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hairColor" className="text-base">Hair Color</Label>
                    <Select
                      value={profile.hairColor}
                      onValueChange={(value) => setProfile({ ...profile, hairColor: value })}
                    >
                      <SelectTrigger className="h-12 text-base mt-2">
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
                    <Label htmlFor="eyeColor" className="text-base">Eye Color</Label>
                    <Select
                      value={profile.eyeColor}
                      onValueChange={(value) => setProfile({ ...profile, eyeColor: value })}
                    >
                      <SelectTrigger className="h-12 text-base mt-2">
                        <SelectValue placeholder="Select eye color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BROWN">Brown</SelectItem>
                        <SelectItem value="BLUE">Blue</SelectItem>
                        <SelectItem value="GREEN">Green</SelectItem>
                        <SelectItem value="HAZEL">Hazel</SelectItem>
                        <SelectItem value="GRAY">Gray</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="visibleTattoos"
                    checked={profile.visibleTattoos}
                    onCheckedChange={(checked) => setProfile({ ...profile, visibleTattoos: checked as boolean })}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="visibleTattoos" className="text-base cursor-pointer flex-1">I have visible tattoos</Label>
                </div>

                <div>
                  <Label htmlFor="unionStatus" className="text-base">Union Status</Label>
                  <Select
                    value={profile.unionStatus}
                    onValueChange={(value) => setProfile({ ...profile, unionStatus: value })}
                  >
                    <SelectTrigger className="h-12 text-base mt-2">
                      <SelectValue placeholder="Select union status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAG_AFTRA">SAG-AFTRA</SelectItem>
                      <SelectItem value="AEA">AEA (Actors' Equity)</SelectItem>
                      <SelectItem value="AGVA">AGVA</SelectItem>
                      <SelectItem value="ACTRA">ACTRA (Canadian)</SelectItem>
                      <SelectItem value="NON_UNION">Non-Union</SelectItem>
                      <SelectItem value="ELIGIBLE">Union Eligible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => handleSave('basic')} 
                  disabled={saving}
                  className="w-full h-12 text-base font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Media Assets</CardTitle>
                <CardDescription className="text-sm md:text-base">Your headshots, photos, and resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="flex items-center gap-2 mb-3 text-base">
                    <ImageIcon className="h-5 w-5" />
                    Headshot
                  </Label>
                  {profile.headshot ? (
                    <div className="space-y-3">
                      <img src={profile.headshot} alt="Headshot" className="w-full max-w-sm mx-auto h-auto object-cover rounded-lg shadow-md" />
                      <Button type="button" variant="outline" size="sm" onClick={() => setProfile({ ...profile, headshot: '' })} className="w-full md:w-auto h-10">
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            setProfile({ ...profile, headshot: res[0].url });
                          }
                        }}
                        onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3 text-base">
                    <User className="h-5 w-5" />
                    Full Body Photo
                  </Label>
                  {profile.fullBody ? (
                    <div className="space-y-3">
                      <img src={profile.fullBody} alt="Full Body" className="w-full max-w-sm mx-auto h-auto object-cover rounded-lg shadow-md" />
                      <Button type="button" variant="outline" size="sm" onClick={() => setProfile({ ...profile, fullBody: '' })} className="w-full md:w-auto h-10">
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            setProfile({ ...profile, fullBody: res[0].url });
                          }
                        }}
                        onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3 text-base">
                    Resume (PDF)
                  </Label>
                  {profile.resume ? (
                    <div className="space-y-3">
                      <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-base block p-4 bg-gray-50 rounded-lg border">
                        View Resume
                      </a>
                      <Button type="button" variant="outline" size="sm" onClick={() => setProfile({ ...profile, resume: '' })} className="w-full md:w-auto h-10">
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      <UploadButton
                        endpoint="pdfUploader"
                        onClientUploadComplete={(res) => {
                          if (res && res[0]) {
                            setProfile({ ...profile, resume: res[0].url });
                          }
                        }}
                        onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
                      />
                    </div>
                  )}
                </div>

                <Button 
                  onClick={() => handleSave('media')} 
                  disabled={saving}
                  className="w-full h-12 text-base font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Skills & Preferences</CardTitle>
                <CardDescription className="text-sm md:text-base">Your talents and role interests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-4 block">Role Types Interested In</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roleTypes.map((roleType) => (
                      <div key={roleType.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={`role-${roleType.value}`}
                          checked={profile.roleTypesInterested.includes(roleType.value)}
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
                          checked={profile.skills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                          className="h-5 w-5"
                        />
                        <Label htmlFor={`skill-${skill}`} className="font-normal cursor-pointer text-base flex-1">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="customSkill" className="text-base mb-2 block">Add Custom Skill</Label>
                    <div className="flex gap-2">
                      <Input
                        id="customSkill"
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        placeholder="e.g., Fire breathing"
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

                <Button 
                  onClick={() => handleSave('preferences')} 
                  disabled={saving}
                  className="w-full h-12 text-base font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Location & Logistics</CardTitle>
                <CardDescription className="text-sm md:text-base">Your location and availability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="state" className="text-base">State</Label>
                  <div ref={stateDropdownRef} className="relative mt-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search for your state..."
                        value={stateSearch}
                        onChange={(e) => {
                          setStateSearch(e.target.value);
                          setShowStateDropdown(true);
                        }}
                        onFocus={() => setShowStateDropdown(true)}
                        className="h-12 text-base pl-10"
                      />
                    </div>
                    {showStateDropdown && filteredStates.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredStates.map((state) => (
                          <button
                            key={state.value}
                            type="button"
                            onClick={() => handleStateSelect(state.value, state.label)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 text-base border-b last:border-b-0"
                          >
                            {state.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="city" className="text-base">City</Label>
                  {availableCities.length > 0 ? (
                    <Select
                      value={profile.city}
                      onValueChange={(value) => setProfile({ ...profile, city: value })}
                      disabled={!selectedState}
                    >
                      <SelectTrigger className="h-12 text-base mt-2">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
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
                      className="h-12 text-base mt-2"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode" className="text-base">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    type="text"
                    inputMode="numeric"
                    value={profile.zipCode}
                    onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
                    maxLength={5}
                    className="h-12 text-base mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="availability" className="text-base">Availability</Label>
                  <Select
                    value={profile.availability}
                    onValueChange={(value) => setProfile({ ...profile, availability: value })}
                  >
                    <SelectTrigger className="h-12 text-base mt-2">
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

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="reliableTransportation"
                    checked={profile.reliableTransportation}
                    onCheckedChange={(checked) => setProfile({ ...profile, reliableTransportation: checked as boolean })}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="reliableTransportation" className="text-base cursor-pointer flex-1">I have reliable transportation</Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="travelWilling"
                    checked={profile.travelWilling}
                    onCheckedChange={(checked) => setProfile({ ...profile, travelWilling: checked as boolean })}
                    className="h-5 w-5"
                  />
                  <Label htmlFor="travelWilling" className="text-base cursor-pointer flex-1">Willing to travel for roles</Label>
                </div>

                <div>
                  <Label htmlFor="compensationPreference" className="text-base">Compensation Preferences</Label>
                  <Select
                    value={profile.compensationPreference}
                    onValueChange={(value) => setProfile({ ...profile, compensationPreference: value })}
                  >
                    <SelectTrigger className="h-12 text-base mt-2">
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
                  <Label htmlFor="compensationMin" className="text-base">Minimum Day Rate (optional)</Label>
                  <Input
                    id="compensationMin"
                    value={profile.compensationMin}
                    onChange={(e) => setProfile({ ...profile, compensationMin: e.target.value })}
                    placeholder="e.g., $200/day"
                    className="h-12 text-base mt-2"
                  />
                </div>

                <Button 
                  onClick={() => handleSave('location')} 
                  disabled={saving}
                  className="w-full h-12 text-base font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
