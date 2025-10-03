'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  });
  const [phoneError, setPhoneError] = useState('');

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
          setFormData({
            name: data.name || '',
            age: data.age?.toString() || '',
            playableAgeMin: data.playableAgeMin?.toString() || '',
            playableAgeMax: data.playableAgeMax?.toString() || '',
            gender: data.gender || '',
            ethnicity: data.ethnicity || '',
            unionStatus: data.unionStatus || '',
            phone: data.phone || '',
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

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    // Must be exactly 10 digits (US/Canada without country code) or 11 digits starting with 1
    return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
  };

  const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits, spaces, hyphens, parentheses, and plus sign
    const filtered = value.replace(/[^\d\s\-\(\)\+]/g, '');
    
    // Limit to reasonable length (max 15 characters for formatted number)
    if (filtered.length <= 20) {
      setFormData({ ...formData, phone: filtered });
      
      // Validate as user types
      const cleaned = filtered.replace(/\D/g, '');
      if (cleaned.length > 0 && cleaned.length < 10) {
        setPhoneError('Phone number must be at least 10 digits');
      } else if (cleaned.length > 11) {
        setPhoneError('Phone number is too long');
      } else if (cleaned.length === 11 && cleaned[0] !== '1') {
        setPhoneError('11-digit numbers must start with 1');
      } else {
        setPhoneError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid 10-digit US or Canadian phone number');
      return;
    }

    // Validate age range
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
          age: parseInt(formData.age),
          playableAgeMin: parseInt(formData.playableAgeMin),
          playableAgeMax: parseInt(formData.playableAgeMax),
          gender: formData.gender,
          ethnicity: formData.ethnicity,
          unionStatus: formData.unionStatus,
          phone: formatPhone(formData.phone),
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <span className="text-sm font-medium text-gray-600">Step 1 of 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <div>
                    <Input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.playableAgeMin}
                      onChange={(e) => setFormData({ ...formData, playableAgeMin: e.target.value })}
                      placeholder="Min age"
                      required
                    />
                  </div>
                  <div>
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
                    <SelectItem value="NON_UNION">Non-Union</SelectItem>
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
