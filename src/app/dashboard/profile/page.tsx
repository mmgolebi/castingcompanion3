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
import { User, Image as ImageIcon, MapPin, Briefcase, Search, X, Plus, Eye, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

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
  const [copied, setCopied] = useState(false);
  
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
    profileSlug: '',
    isPublic: false,
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

  const publicProfileUrl = profile.profileSlug 
    ? `${window.location.origin}/actors/${profile.profileSlug}`
    : '';

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
          profileSlug: data.profileSlug || '',
          isPublic: data.isPublic || false,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  useEffect(() => {
    if (selectedState) {
      const cities = MAJOR_CITIES_BY_STATE[selectedState] || [];
      setAvailableCities(cities);
      setProfile(prev => ({ ...prev, state: selectedState }));
    }
  }, [selectedState]);

  useEffect(() => {
    if (heightFeet || heightInches) {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      const totalHeight = (feet * 12) + inches;
      setProfile(prev => ({ ...prev, height: totalHeight.toString() }));
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
    setProfile(prev => ({ ...prev, phone: formatted }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Public profile link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      // Auto-generate slug from name if not set
      let slug = profile.profileSlug;
      if (!slug && profile.name) {
        slug = generateSlug(profile.name);
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          profileSlug: slug,
          age: profile.age ? parseInt(profile.age) : null,
          playableAgeMin: profile.playableAgeMin ? parseInt(profile.playableAgeMin) : null,
          playableAgeMax: profile.playableAgeMax ? parseInt(profile.playableAgeMax) : null,
          height: profile.height ? parseInt(profile.height) : null,
          weight: profile.weight ? parseInt(profile.weight) : null,
        }),
      });

      if (res.ok) {
        await fetchProfile();
        
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-bold">Profile Settings</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Manage your actor profile</p>
            </div>
            {profile.isPublic && profile.profileSlug && (
              <Button
                onClick={() => window.open(publicProfileUrl, '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden md:inline">View Public Profile</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
        {/* Public Profile Settings Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>Make your profile visible to casting directors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor="isPublic" className="text-base font-semibold cursor-pointer">
                  Make profile public
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Allow others to view your profile via a shareable link
                </p>
              </div>
              <Checkbox
                id="isPublic"
                checked={profile.isPublic}
                onCheckedChange={(checked) => {
                  setProfile({ ...profile, isPublic: checked as boolean });
                  handleSave('public');
                }}
                className="h-6 w-6"
              />
            </div>

            {profile.isPublic && profile.profileSlug && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <ExternalLink className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Your public profile is live!</p>
                    <p className="text-sm text-green-700 mt-1 break-all">{publicProfileUrl}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    onClick={() => window.open(publicProfileUrl, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Profile
                  </Button>
                </div>
              </div>
            )}

            {!profile.name && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Add your name in the Basic Information tab to enable public profile
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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

          {/* Keep all your existing tab content - Basic, Media, Skills, Location */}
          {/* I'll add just the Basic tab here as an example, but keep all your existing content */}

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

                {/* ... rest of your existing basic info fields ... */}

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

          {/* Keep all other existing TabsContent sections */}
        </Tabs>
      </div>
    </div>
  );
}
