'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewCastingCallPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    unionReq: 'EITHER',
    shootDates: '',
    castingEmail: '',
    submissionDeadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/casting-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Casting call created successfully!');
        router.push('/admin');
      } else {
        const error = await res.json();
        alert('Failed to create casting call: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin">
            <Button variant="ghost">← Back to Admin</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Casting Call</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Role Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Lead Role - Drama Series"
                  required
                />
              </div>

              <div>
                <Label htmlFor="production">Production Name *</Label>
                <Input
                  id="production"
                  value={formData.production}
                  onChange={(e) => setFormData({ ...formData, production: e.target.value })}
                  placeholder="Breaking Bad"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Seeking talented actor for..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roleType">Role Type *</Label>
                  <Select
                    value={formData.roleType}
                    onValueChange={(value) => setFormData({ ...formData, roleType: value })}
                  >
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
                  <Label htmlFor="genderReq">Gender Requirement *</Label>
                  <Select
                    value={formData.genderReq}
                    onValueChange={(value) => setFormData({ ...formData, genderReq: value })}
                  >
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ageMin">Min Age *</Label>
                  <Input
                    id="ageMin"
                    type="number"
                    value={formData.ageMin}
                    onChange={(e) => setFormData({ ...formData, ageMin: e.target.value })}
                    placeholder="18"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ageMax">Max Age *</Label>
                  <Input
                    id="ageMax"
                    type="number"
                    value={formData.ageMax}
                    onChange={(e) => setFormData({ ...formData, ageMax: e.target.value })}
                    placeholder="65"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Los Angeles, CA"
                  required
                />
              </div>

              <div>
                <Label htmlFor="compensation">Compensation *</Label>
                <Input
                  id="compensation"
                  value={formData.compensation}
                  onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                  placeholder="$5,000/episode"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unionReq">Union Requirement *</Label>
                <Select
                  value={formData.unionReq}
                  onValueChange={(value) => setFormData({ ...formData, unionReq: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAG_AFTRA">SAG-AFTRA Only</SelectItem>
                    <SelectItem value="NON_UNION">Non-Union Only</SelectItem>
                    <SelectItem value="EITHER">Either</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="shootDates">Shoot Dates *</Label>
                <Input
                  id="shootDates"
                  value={formData.shootDates}
                  onChange={(e) => setFormData({ ...formData, shootDates: e.target.value })}
                  placeholder="January - March 2025"
                  required
                />
              </div>

              <div>
                <Label htmlFor="castingEmail">Casting Director Email *</Label>
                <Input
                  id="castingEmail"
                  type="email"
                  value={formData.castingEmail}
                  onChange={(e) => setFormData({ ...formData, castingEmail: e.target.value })}
                  placeholder="casting@production.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="submissionDeadline">Submission Deadline *</Label>
                <Input
                  id="submissionDeadline"
                  type="date"
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Link href="/admin" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Casting Call'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
