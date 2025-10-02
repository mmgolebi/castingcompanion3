'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OnboardingStep4() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    availability: '',
    reliableTransportation: false,
    travelWilling: false,
    compensationPreference: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
    hairColor: '',
    eyeColor: '',
    visibleTattoos: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.availability || !formData.compensationPreference) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const heightInInches = (parseInt(formData.heightFeet) || 0) * 12 + (parseInt(formData.heightInches) || 0);
      
      const res = await fetch('/api/onboarding/step4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          height: heightInInches || null,
        }),
      });

      if (res.ok) {
        router.push('/onboarding/payment');
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
              <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-white">✓</span>
              </div>
              <div className="bg-green-500 h-1 w-24"></div>
              <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                <span className="font-bold text-primary">4</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-white text-xs">
            <div>Basic Info</div>
            <div>Media Assets</div>
            <div>Preferences</div>
            <div className="font-semibold">Logistics</div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logistics & Physical Attributes</CardTitle>
            <CardDescription>Final details to complete your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="availability">Availability *</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => setFormData({ ...formData, availability: value })}
                  required
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
                  checked={formData.reliableTransportation}
                  onCheckedChange={(checked) => setFormData({ ...formData, reliableTransportation: !!checked })}
                />
                <Label htmlFor="reliableTransportation" className="font-normal cursor-pointer">
                  I have reliable transportation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="travelWilling"
                  checked={formData.travelWilling}
                  onCheckedChange={(checked) => setFormData({ ...formData, travelWilling: !!checked })}
                />
                <Label htmlFor="travelWilling" className="font-normal cursor-pointer">
                  Willing to travel for roles
                </Label>
              </div>

              <div>
                <Label htmlFor="compensationPreference">Compensation Preferences *</Label>
                <Select
                  value={formData.compensationPreference}
                  onValueChange={(value) => setFormData({ ...formData, compensationPreference: value })}
                  required
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
                <Label className="text-base font-semibold">Physical Attributes</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Height</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={formData.heightFeet}
                      onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                      placeholder="Feet"
                    />
                    <Input
                      type="number"
                      value={formData.heightInches}
                      onChange={(e) => setFormData({ ...formData, heightInches: e.target.value })}
                      placeholder="Inches"
                      max={11}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">e.g., 5 feet 8 inches</p>
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
                  checked={formData.visibleTattoos}
                  onCheckedChange={(checked) => setFormData({ ...formData, visibleTattoos: !!checked })}
                />
                <Label htmlFor="visibleTattoos" className="font-normal cursor-pointer">
                  I have visible tattoos
                </Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/onboarding/step3')} className="flex-1">
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
    </div>
  );
}
