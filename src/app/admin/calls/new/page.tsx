'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CreateCastingCallPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    production: '',
    description: '',
    roleType: 'LEAD',
    genderReq: 'ANY',
    ageMin: '',
    ageMax: '',
    ethnicityReq: 'ANY',
    location: '',
    compensation: '',
    unionReq: 'ANY',
    skillsRequired: '',
    shootDates: '',
    castingEmail: '',
    submissionDeadline: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare data
      const data = {
        ...formData,
        ageMin: formData.ageMin ? parseInt(formData.ageMin) : undefined,
        ageMax: formData.ageMax ? parseInt(formData.ageMax) : undefined,
        skillsRequired: formData.skillsRequired
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        submissionDeadline: new Date(formData.submissionDeadline).toISOString(),
      };

      const res = await fetch('/api/casting-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert('✅ Casting call created successfully!');
        router.push('/admin');
      } else {
        const result = await res.json();
        alert(`❌ ${result.error || 'Failed to create casting call'}`);
      }
    } catch (error) {
      alert('❌ Failed to create casting call. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Casting Companion</h1>
          <Link href="/admin">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Casting Call</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>

                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Lead Female Role - Feature Film"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="production">Production Name *</Label>
                  <Input
                    id="production"
                    value={formData.production}
                    onChange={(e) => updateField('production', e.target.value)}
                    placeholder="Blue Horizon"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Detailed description of the role..."
                    required
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Role Requirements */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Role Requirements</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roleType">Role Type *</Label>
                    <Select value={formData.roleType} onValueChange={(v) => updateField('roleType', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LEAD">Lead</SelectItem>
                        <SelectItem value="SUPPORTING">Supporting</SelectItem>
                        <SelectItem value="BACKGROUND">Background</SelectItem>
                        <SelectItem value="EXTRA">Extra</SelectItem>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="genderReq">Gender Requirements</Label>
                    <Select value={formData.genderReq} onValueChange={(v) => updateField('genderReq', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANY">Any</SelectItem>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="NON_BINARY">Non-Binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ageMin">Age Min</Label>
                    <Input
                      id="ageMin"
                      type="number"
                      value={formData.ageMin}
                      onChange={(e) => updateField('ageMin', e.target.value)}
                      placeholder="18"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ageMax">Age Max</Label>
                    <Input
                      id="ageMax"
                      type="number"
                      value={formData.ageMax}
                      onChange={(e) => updateField('ageMax', e.target.value)}
                      placeholder="65"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ethnicityReq">Ethnicity Requirements</Label>
                    <Select value={formData.ethnicityReq} onValueChange={(v) => updateField('ethnicityReq', v)}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="unionReq">Union Requirements</Label>
                    <Select value={formData.unionReq} onValueChange={(v) => updateField('unionReq', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANY">Any</SelectItem>
                        <SelectItem value="SAG_AFTRA">SAG-AFTRA</SelectItem>
                        <SelectItem value="NON_UNION">Non-Union</SelectItem>
                        <SelectItem value="EITHER">Either</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="skillsRequired">Required Skills (comma-separated)</Label>
                  <Input
                    id="skillsRequired"
                    value={formData.skillsRequired}
                    onChange={(e) => updateField('skillsRequired', e.target.value)}
                    placeholder="Stage Combat, Singing, Dancing"
                  />
                </div>
              </div>

              {/* Production Details */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-lg">Production Details</h3>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Los Angeles, CA"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="compensation">Compensation *</Label>
                  <Input
                    id="compensation"
                    value={formData.compensation}
                    onChange={(e) => updateField('compensation', e.target.value)}
                    placeholder="$300/day"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="shootDates">Shoot Dates</Label>
                  <Input
                    id="shootDates"
                    value={formData.shootDates}
                    onChange={(e) => updateField('shootDates', e.target.value)}
                    placeholder="Oct 20-25, 2025"
                  />
                </div>

                <div>
                  <Label htmlFor="castingEmail">Casting Director Email *</Label>
                  <Input
                    id="castingEmail"
                    type="email"
                    value={formData.castingEmail}
                    onChange={(e) => updateField('castingEmail', e.target.value)}
                    placeholder="casting@studio.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="submissionDeadline">Submission Deadline *</Label>
                  <Input
                    id="submissionDeadline"
                    type="datetime-local"
                    value={formData.submissionDeadline}
                    onChange={(e) => updateField('submissionDeadline', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Link href="/admin">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Casting Call
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
