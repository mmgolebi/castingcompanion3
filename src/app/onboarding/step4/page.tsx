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

export default function Step4Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    heightFeet: '',
    heightInches: '',
    weight: '',
    ethnicity: '',
    hairColor: '',
    eyeColor: '',
    visibleTattoos: false,
    availability: '',
    reliableTransportation: false,
    travelWilling: false,
    compensationPreference: '',
    compensationMin: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalHeight = (parseInt(formData.heightFeet) * 12) + parseInt(formData.heightInches);
      
      const res = await fetch('/api/onboarding/step4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: totalHeight,
          weight: parseInt(formData.weight),
          ethnicity: formData.ethnicity,
          hairColor: formData.hairColor,
          eyeColor: formData.eyeColor,
          visibleTattoos: formData.visibleTattoos,
          availability: formData.availability,
          reliableTransportation: formData.reliableTransportation,
          travelWilling: formData.travelWilling,
          compensationPreference: formData.compensationPreference,
          compensationMin: formData.compensationMin,
        }),
      });

      if (res.ok) {
        router.push('/onboarding/payment');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Logistics & Physical Attributes</CardTitle>
          <CardDescription>Step 4 of 4 - Final details to complete your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Availability *</Label>
              <Select
                value={formData.availability}
                onValueChange={(value) => setFormData({ ...formData, availability: value })}
                required
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
                checked={formData.reliableTransportation}
                onCheckedChange={(checked) => setFormData({ ...formData, reliableTransportation: checked as boolean })}
              />
              <Label htmlFor="reliableTransportation">I have reliable transportation</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="travelWilling"
                checked={formData.travelWilling}
                onCheckedChange={(checked) => setFormData({ ...formData, travelWilling: checked as boolean })}
              />
              <Label htmlFor="travelWilling">Willing to travel for roles</Label>
            </div>

            <div>
              <Label>Compensation Preferences *</Label>
              <Select
                value={formData.compensationPreference}
                onValueChange={(value) => setFormData({ ...formData, compensationPreference: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select compensation preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID_ONLY">Paid roles only</SelectItem>
                  <SelectItem value="OPEN_TO_UNPAID">Open to unpaid/student films</SelectItem>
                  <SelectItem value="NEGOTIABLE">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <hr className="my-6" />

            <h3 className="text-lg font-semibold">Physical Attributes</h3>

            <div>
              <Label>Height</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Input
                  type="number"
                  value={formData.heightFeet}
                  onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                  placeholder="Feet"
                  min="0"
                  max="8"
                />
                <Input
                  type="number"
                  value={formData.heightInches}
                  onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                  placeholder="Inches"
                  min="0"
                  max="11"
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">e.g., 5 feet 8 inches</p>
            </div>

            <div>
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="150 lbs"
              />
            </div>

            <div>
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <Select
                value={formData.ethnicity}
                onValueChange={(value) => setFormData({ ...formData, ethnicity: value })}
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.push('/onboarding/step3')}>
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Continue to Payment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
