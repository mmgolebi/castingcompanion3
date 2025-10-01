'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [profile, setProfile] = useState<any>({});
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || {});
        setFormData(data.profile || {});
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('✅ Profile updated successfully! Matches have been recalculated.');
        fetchProfile();
      } else {
        const data = await res.json();
        alert(`❌ ${data.error || 'Failed to update profile'}`);
      }
    } catch (error) {
      alert('❌ Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'physical', label: 'Physical' },
    { id: 'roles', label: 'Roles & Skills' },
    { id: 'media', label: 'Media' },
    { id: 'logistics', label: 'Logistics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-primary">
            Casting Companion
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/dashboard/calls">
              <Button variant="ghost">Browse Calls</Button>
            </Link>
            <Link href="/dashboard/history">
              <Button variant="ghost">History</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">Update your information to get better matches</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className="whitespace-nowrap"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => updateField('age', parseInt(e.target.value))}
                      placeholder="28"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender || ''} onValueChange={(v) => updateField('gender', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="NON_BINARY">Non-Binary</SelectItem>
                        <SelectItem value="ANY">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ethnicity">Ethnicity *</Label>
                    <Select value={formData.ethnicity || ''} onValueChange={(v) => updateField('ethnicity', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ethnicity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANY">Any</SelectItem>
                        <SelectItem value="ASIAN">Asian</SelectItem>
                        <SelectItem value="BLACK">Black</SelectItem>
                        <SelectItem value="HISPANIC">Hispanic</SelectItem>
                        <SelectItem value="MIDDLE_EASTERN">Middle Eastern</SelectItem>
                        <SelectItem value="NATIVE_AMERICAN">Native American</SelectItem>
                        <SelectItem value="PACIFIC_ISLANDER">Pacific Islander</SelectItem>
                        <SelectItem value="WHITE">White</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="unionStatus">Union Status *</Label>
                    <Select value={formData.unionStatus || ''} onValueChange={(v) => updateField('unionStatus', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select union status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAG_AFTRA">SAG-AFTRA</SelectItem>
                        <SelectItem value="NON_UNION">Non-Union</SelectItem>
                        <SelectItem value="EITHER">Either</SelectItem>
                        <SelectItem value="ANY">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="agency">Agency (Optional)</Label>
                    <Input
                      id="agency"
                      value={formData.agency || ''}
                      onChange={(e) => updateField('agency', e.target.value)}
                      placeholder="Your agency name"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Location *</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="locationCity">City</Label>
                      <Input
                        id="locationCity"
                        value={formData.locationCity || ''}
                        onChange={(e) => updateField('locationCity', e.target.value)}
                        placeholder="Los Angeles"
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationState">State</Label>
                      <Input
                        id="locationState"
                        value={formData.locationState || ''}
                        onChange={(e) => updateField('locationState', e.target.value)}
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationZip">ZIP Code</Label>
                      <Input
                        id="locationZip"
                        value={formData.locationZip || ''}
                        onChange={(e) => updateField('locationZip', e.target.value)}
                        placeholder="90001"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="playableAgeMin">Playable Age Min</Label>
                    <Input
                      id="playableAgeMin"
                      type="number"
                      value={formData.playableAgeMin || ''}
                      onChange={(e) => updateField('playableAgeMin', parseInt(e.target.value))}
                      placeholder="22"
                    />
                  </div>
                  <div>
                    <Label htmlFor="playableAgeMax">Playable Age Max</Label>
                    <Input
                      id="playableAgeMax"
                      type="number"
                      value={formData.playableAgeMax || ''}
                      onChange={(e) => updateField('playableAgeMax', parseInt(e.target.value))}
                      placeholder="32"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Physical Tab */}
            {activeTab === 'physical' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="heightCm">Height (cm)</Label>
                    <Input
                      id="heightCm"
                      type="number"
                      value={formData.heightCm || ''}
                      onChange={(e) => updateField('heightCm', parseInt(e.target.value))}
                      placeholder="175"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weightKg">Weight (kg)</Label>
                    <Input
                      id="weightKg"
                      type="number"
                      value={formData.weightKg || ''}
                      onChange={(e) => updateField('weightKg', parseInt(e.target.value))}
                      placeholder="70"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hairColor">Hair Color</Label>
                    <Input
                      id="hairColor"
                      value={formData.hairColor || ''}
                      onChange={(e) => updateField('hairColor', e.target.value)}
                      placeholder="Brown"
                    />
                  </div>

                  <div>
                    <Label htmlFor="eyeColor">Eye Color</Label>
                    <Input
                      id="eyeColor"
                      value={formData.eyeColor || ''}
                      onChange={(e) => updateField('eyeColor', e.target.value)}
                      placeholder="Blue"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="visibleTattoos">Visible Tattoos</Label>
                    <Select 
                      value={formData.visibleTattoos ? 'true' : 'false'} 
                      onValueChange={(v) => updateField('visibleTattoos', v === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Roles & Skills Tab */}
            {activeTab === 'roles' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Role Preferences & Skills</h3>
                
                <div>
                  <Label>Role Interests (Select multiple)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {['LEAD', 'SUPPORTING', 'BACKGROUND', 'EXTRA', 'COMMERCIAL'].map((role) => (
                      <label key={role} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.roleInterests?.includes(role) || false}
                          onChange={(e) => {
                            const current = formData.roleInterests || [];
                            if (e.target.checked) {
                              updateField('roleInterests', [...current, role]);
                            } else {
                              updateField('roleInterests', current.filter((r: string) => r !== role));
                            }
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialSkills">Special Skills (comma-separated)</Label>
                  <Input
                    id="specialSkills"
                    value={formData.specialSkills?.join(', ') || ''}
                    onChange={(e) => updateField('specialSkills', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                    placeholder="Stage Combat, Singing, Dancing, Driving"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Examples: Stage Combat, Singing, Dancing, Sports, Accents</p>
                </div>

                <div>
                  <Label>Comfort Levels</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      { id: 'stunts', label: 'Comfortable with Stunts' },
                      { id: 'intimacy', label: 'Comfortable with Intimacy Scenes' },
                      { id: 'nudity', label: 'Comfortable with Nudity' },
                      { id: 'minors', label: 'Comfortable Working with Minors' },
                    ].map((comfort) => (
                      <label key={comfort.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.comfortLevels?.includes(comfort.id) || false}
                          onChange={(e) => {
                            const current = formData.comfortLevels || [];
                            if (e.target.checked) {
                              updateField('comfortLevels', [...current, comfort.id]);
                            } else {
                              updateField('comfortLevels', current.filter((c: string) => c !== comfort.id));
                            }
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="text-sm">{comfort.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Media & Materials</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="headshotUrl">Headshot URL *</Label>
                    <Input
                      id="headshotUrl"
                      type="url"
                      value={formData.headshotUrl || ''}
                      onChange={(e) => updateField('headshotUrl', e.target.value)}
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">Upload to UploadThing or use any image URL</p>
                  </div>

                  <div>
                    <Label htmlFor="fullBodyUrl">Full Body Shot URL</Label>
                    <Input
                      id="fullBodyUrl"
                      type="url"
                      value={formData.fullBodyUrl || ''}
                      onChange={(e) => updateField('fullBodyUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="resumeUrl">Resume URL</Label>
                    <Input
                      id="resumeUrl"
                      type="url"
                      value={formData.resumeUrl || ''}
                      onChange={(e) => updateField('resumeUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="reelLink">Demo Reel Link</Label>
                    <Input
                      id="reelLink"
                      type="url"
                      value={formData.reelLink || ''}
                      onChange={(e) => updateField('reelLink', e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Social Media</h4>
                  
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      type="url"
                      value={formData.instagram || ''}
                      onChange={(e) => updateField('instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      type="url"
                      value={formData.tiktok || ''}
                      onChange={(e) => updateField('tiktok', e.target.value)}
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      type="url"
                      value={formData.youtube || ''}
                      onChange={(e) => updateField('youtube', e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Logistics Tab */}
            {activeTab === 'logistics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Logistics & Preferences</h3>
                
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    value={formData.availability || ''}
                    onChange={(e) => updateField('availability', e.target.value)}
                    placeholder="Weekdays, Weekends, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="compPrefs">Compensation Preferences</Label>
                  <Input
                    id="compPrefs"
                    value={formData.compPrefs || ''}
                    onChange={(e) => updateField('compPrefs', e.target.value)}
                    placeholder="Day rate, Copy/Credit/Meals, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="transportation">Have Reliable Transportation?</Label>
                  <Select 
                    value={formData.transportation ? 'true' : 'false'} 
                    onValueChange={(v) => updateField('transportation', v === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="travelWillingness">Willing to Travel?</Label>
                  <Select 
                    value={formData.travelWillingness ? 'true' : 'false'} 
                    onValueChange={(v) => updateField('travelWillingness', v === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button variant="outline" onClick={fetchProfile}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
                