'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OnboardingStep1() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
    zipCode: '',
    age: '',
    playableAgeMin: '',
    playableAgeMax: '',
    gender: '',
    ethnicity: '',
    unionStatus: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: formatPhoneNumber(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/onboarding/step2');
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
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-primary">1</span>
              </div>
              <div className="bg-gray-300 h-1 w-24"></div>
              <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-gray-500">2</span>
              </div>
              <div className="bg-gray-300 h-1 w-24"></div>
              <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-gray-500">3</span>
              </div>
              <div className="bg-gray-300 h-1 w-24"></div>
              <div className="bg-gray-300 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-gray-500">4</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-white text-xs">
            <div className="font-semibold">Basic Info</div>
            <div>Media Assets</div>
            <div>Preferences</div>
            <div>Logistics</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
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
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Los Angeles"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setFormData({ ...formData, zipCode: value });
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
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="25"
                  min={18}
                  required
                />
              </div>

              <div>
                <Label>Playable Age Range *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    value={formData.playableAgeMin}
                    onChange={(e) => setFormData({ ...formData, playableAgeMin: e.target.value })}
                    placeholder="Min (e.g., 18)"
                    required
                  />
                  <Input
                    type="number"
                    value={formData.playableAgeMax}
                    onChange={(e) => setFormData({ ...formData, playableAgeMax: e.target.value })}
                    placeholder="Max (e.g., 30)"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">The age range you can convincingly portray</p>
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
                    <SelectItem value="ANY">Other</SelectItem>
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
                    <SelectItem value="EITHER">Either</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
