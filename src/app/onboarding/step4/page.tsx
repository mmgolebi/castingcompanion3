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
import { US_STATES, MAJOR_CITIES_BY_STATE } from '@/lib/locations';
import { CheckCircle2 } from 'lucide-react';

export default function Step4Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    zipCode: '',
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setFormData({
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            availability: data.availability || '',
            reliableTransportation: data.reliableTransportation || false,
            travelWilling: data.travelWilling || false,
            compensationPreference: data.compensationPreference || '',
            compensationMin: data.compensationMin || '',
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
      setFormData({ ...formData, state: selectedState });
    }
  }, [selectedState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/onboarding/step4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert('Failed to save step 4');
        setSubmitting(false);
        return;
      }

      const checkoutRes = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
      });

      if (checkoutRes.ok) {
        const { url } = await checkoutRes.json();
        window.location.href = url;
      } else {
        alert('Failed to create checkout session');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
      setSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">Complete Your Profile</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-white text-sm font-medium">Basic Info</span>
          </div>
          <div className="flex-1 h-1 bg-green-500 mx-4"></div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-white text-sm font-medium">Media Assets</span>
          </div>
          <div className="flex-1 h-1 bg-green-500 mx-4"></div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-white text-sm font-medium">Preferences</span>
          </div>
          <div className="flex-1 h-1 bg-green-500 mx-4"></div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-purple-900 mb-2 font-bold">
              4
            </div>
            <span className="text-white text-sm font-medium">Logistics</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Location & Logistics</CardTitle>
            <CardDescription>Where are you based and what's your availability?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="state">State *</Label>
                <Select
                  value={selectedState}
                  onValueChange={(value) => setSelectedState(value)}
                  required
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
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                    disabled={!selectedState}
                    required
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
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    disabled={!selectedState}
                    required
                  />
                )}
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  maxLength={5}
                  required
                />
              </div>

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
                <Label htmlFor="compensationPreference">Compensation Preferences *</Label>
                <Select
                  value={formData.compensationPreference}
                  onValueChange={(value) => setFormData({ ...formData, compensationPreference: value })}
                  required
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
                  value={formData.compensationMin}
                  onChange={(e) => setFormData({ ...formData, compensationMin: e.target.value })}
                  placeholder="e.g., $200/day"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Almost there!</strong> After completing this step, you'll be redirected to set up your $1 trial subscription.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/onboarding/step3')}
                  className="flex-1"
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Processing...' : 'Complete & Continue to Payment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
