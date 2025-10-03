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
import { CheckCircle2 } from 'lucide-react';

export default function Step1Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    playableAgeMin: '',
    playableAgeMax: '',
    gender: '',
    ethnicity: '',
    unionStatus: '',
    phone: '',
    height: '',
    weight: '',
    hairColor: '',
    eyeColor: '',
    visibleTattoos: false,
  });
  const [phoneError, setPhoneError] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');

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
          
          setFormData({
            name: data.name || '',
            age: data.age?.toString() || '',
            playableAgeMin: data.playableAgeMin?.toString() || '',
            playableAgeMax: data.playableAgeMax?.toString() || '',
            gender: data.gender || '',
            ethnicity: data.ethnicity || '',
            unionStatus: data.unionStatus || '',
            phone: data.phone || '',
            height: data.height?.toString() || '',
            weight: data.weight?.toString() || '',
            hairColor: data.hairColor || '',
            eyeColor: data.eyeColor || '',
            visibleTattoos: data.visibleTattoos || false,
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
    if (heightFeet || heightInches) {
      const feet = parseInt(heightFeet) || 0;
      const inches = parseInt(heightInches) || 0;
      const totalHeight = (feet * 12) + inches;
      setFormData({ ...formData, height: totalHeight.toString() });
    }
  }, [heightFeet, heightInches]);

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

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneAsYouType(value);
    setFormData({ ...formData, phone: formatted });
    
    const cleaned = formatted.replace(/\D/g, '');
    if (cleaned.length > 0 && cleaned.length < 10) {
      setPhoneError('Phone number must be 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid 10-digit US or Canadian phone number');
      return;
    }

    if (formData.playableAgeMin && formData.playableAgeMax) {
      if (parseInt(formData.playableAgeMin) > parseInt(formData.playableAgeMax)) {
        alert('Minimum playable age cannot be greater than maximum');
        return;
      }
    }

    try {
      const res = await fetch('/api/onboarding/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          age: parseInt(formData.age),
          playableAgeMin: parseInt(formData.playableAgeMin),
          playableAgeMax: parseInt(formData.playableAgeMax),
          gender: formData.gender,
          ethnicity: formData.ethnicity,
          unionStatus: formData.unionStatus,
          height: formData.height ? parseInt(formData.height) : null,
          weight: formData.weight ? parseInt(formData.weight) : null,
          hairColor: formData.hairColor || null,
          eyeColor: formData.eyeColor || null,
          visibleTattoos: formData.visibleTattoos,
        }),
      });

      if (res.ok) {
        router.push('/onboarding/step2');
      } else {
        alert('Failed to save step 1');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 py-6 md:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8 text-center">Complete Your Profile</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 md:mb-12">
          <div className="flex items-center max-w-3xl w-full">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-purple-900 mb-1 md:mb-2 font-bold text-sm md:text-base">
                1
              </div>
              <span className="text-white text-xs md:text-sm font-medium text-center">Basic Info</span>
            </div>
            <div className="flex-1 h-1 bg-purple-700 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-700 flex items-center justify-center text-white mb-1 md:mb-2 text-sm md:text-base">
                2
              </div>
              <span className="text-purple-300 text-xs md:text-sm text-center hidden sm:inline">Media Assets</span>
              <span className="text-purple-300 text-xs text-center sm:hidden">Media</span>
            </div>
            <div className="flex-1 h-1 bg-purple-700 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-700 flex items-center justify-center text-white mb-1 md:mb-2 text-sm md:text-base">
                3
              </div>
              <span className="text-purple-300 text-xs md:text-sm text-center hidden sm:inline">Preferences</span>
              <span className="text-purple-300 text-xs text-center sm:hidden">Prefs</span>
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
            <CardTitle className="text-lg md:text-xl">Basic Information & Physical Attributes</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                  className={phoneError ? 'border-red-500' : ''}
                />
                {phoneError && <p className="text-sm text-red-600 mt-1">{phoneError}</p>}
                <p className="text-xs text-gray-500 mt-1">US and Canadian numbers only (10 digits)</p>
              </div>

              <div>
                <Label htmlFor="age">Current Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Playable Age Range *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.playableAgeMin}
                    onChange={(e) => setFormData({ ...formData, playableAgeMin: e.target.value })}
                    placeholder="Min age"
                    required
                  />
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.playableAgeMax}
                    onChange={(e) => setFormData({ ...formData, playableAgeMax: e.target.value })}
                    placeholder="Max age"
                    required
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">The age range you can convincingly portray</p>
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  required
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
                <Label>Height</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
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
                </div>
              </div>

              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="150"
                />
              </div>

              <div>
                <Label htmlFor="ethnicity">Ethnicity *</Label>
                <Select
                  value={formData.ethnicity}
                  onValueChange={(value) => setFormData({ ...formData, ethnicity: value })}
                  required
                >
                  <SelectTrigger>
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
                  <Label htmlFor="hairColor">Hair Color</Label>
                  <Select
                    value={formData.hairColor}
                    onValueChange={(value) => setFormData({ ...formData, hairColor: value })}
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
                    value={formData.eyeColor}
                    onValueChange={(value) => setFormData({ ...formData, eyeColor: value })}
                  >
                    <SelectTrigger>
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="visibleTattoos"
                  checked={formData.visibleTattoos}
                  onCheckedChange={(checked) => setFormData({ ...formData, visibleTattoos: checked as boolean })}
                />
                <Label htmlFor="visibleTattoos">I have visible tattoos</Label>
              </div>

              <div>
                <Label htmlFor="unionStatus">Union Status *</Label>
                <Select
                  value={formData.unionStatus}
                  onValueChange={(value) => setFormData({ ...formData, unionStatus: value })}
                  required
                >
                  <SelectTrigger>
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
                type="submit" 
                className="w-full"
                disabled={!!phoneError}
              >
                Continue to Step 2
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
