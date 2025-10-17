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
import { US_STATES, MAJOR_CITIES_BY_STATE } from '@/lib/locations';
import { CheckCircle2, Search } from 'lucide-react';

export default function Step4Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
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
            const stateName = US_STATES.find(s => s.value === data.state)?.label || '';
            setStateSearch(stateName);
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

  const filteredStates = US_STATES.filter(state =>
    state.label.toLowerCase().includes(stateSearch.toLowerCase())
  );

  const handleStateSelect = (stateValue: string, stateLabel: string) => {
    setSelectedState(stateValue);
    setStateSearch(stateLabel);
    setShowStateDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedState) {
      alert('Please select a state');
      return;
    }
    
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

      // Redirect to dedicated payment page
      router.push('/onboarding/payment');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 py-6 md:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8 text-center">Complete Your Profile</h1>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 md:mb-12">
          <div className="flex items-center max-w-3xl w-full">
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-1 md:mb-2">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-white text-xs md:text-sm font-medium text-center">Basic Info</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-1 md:mb-2">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-white text-xs md:text-sm font-medium text-center hidden sm:inline">Media Assets</span>
              <span className="text-white text-xs font-medium text-center sm:hidden">Media</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-1 md:mb-2">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <span className="text-white text-xs md:text-sm font-medium text-center hidden sm:inline">Preferences</span>
              <span className="text-white text-xs font-medium text-center sm:hidden">Prefs</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-1 md:mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-purple-900 mb-1 md:mb-2 font-bold text-sm md:text-base">
                4
              </div>
              <span className="text-white text-xs md:text-sm font-medium text-center">Logistics</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Location & Logistics</CardTitle>
            <CardDescription className="text-sm md:text-base">Where are you based and what's your availability?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div>
                <Label htmlFor="state" className="text-base">State *</Label>
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
                      required
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
                <Label htmlFor="city" className="text-base">City *</Label>
                {availableCities.length > 0 ? (
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                    disabled={!selectedState}
                    required
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
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter city"
                    disabled={!selectedState}
                    required
                    className="h-12 text-base mt-2"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="zipCode" className="text-base">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  type="text"
                  inputMode="numeric"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  maxLength={5}
                  required
                  className="h-12 text-base mt-2"
                />
              </div>

              <div>
                <Label htmlFor="availability" className="text-base">Availability *</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => setFormData({ ...formData, availability: value })}
                  required
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
                  checked={formData.reliableTransportation}
                  onCheckedChange={(checked) => setFormData({ ...formData, reliableTransportation: checked as boolean })}
                  className="h-5 w-5"
                />
                <Label htmlFor="reliableTransportation" className="text-base cursor-pointer flex-1">I have reliable transportation</Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="travelWilling"
                  checked={formData.travelWilling}
                  onCheckedChange={(checked) => setFormData({ ...formData, travelWilling: checked as boolean })}
                  className="h-5 w-5"
                />
                <Label htmlFor="travelWilling" className="text-base cursor-pointer flex-1">Willing to travel for roles</Label>
              </div>

              <div>
                <Label htmlFor="compensationPreference" className="text-base">Compensation Preferences *</Label>
                <Select
                  value={formData.compensationPreference}
                  onValueChange={(value) => setFormData({ ...formData, compensationPreference: value })}
                  required
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
                  value={formData.compensationMin}
                  onChange={(e) => setFormData({ ...formData, compensationMin: e.target.value })}
                  placeholder="e.g., $200/day"
                  className="h-12 text-base mt-2"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm md:text-base text-blue-900">
                  <strong>⏰ Limited Offer: Only 47 spots left at $1!</strong><br/><br/>You're one step away from unlocking 14-day full access for just $1 (regular price $39.97/month). Get automatic submissions to matching roles + instant access to hundreds of casting calls. <strong>This promotional rate won't last long!</strong>
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/onboarding/step3')}
                  className="w-full h-12 text-base"
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={submitting || !selectedState}>
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
