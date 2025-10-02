'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditCastingCallPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
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
    unionReq: 'EITHER',
    shootDates: '',
    castingEmail: '',
    submissionDeadline: '',
  });

  useEffect(() => {
    const fetchCall = async () => {
      try {
        const res = await fetch(`/api/admin/casting-calls/${params.id}`);
        if (res.ok) {
          const call = await res.json();
          setFormData({
            title: call.title,
            production: call.production,
            description: call.description,
            roleType: call.roleType,
            genderReq: call.genderReq,
            ageMin: call.ageMin.toString(),
            ageMax: call.ageMax.toString(),
            ethnicityReq: call.ethnicityReq,
            location: call.location,
            compensation: call.compensation,
            unionReq: call.unionReq,
            shootDates: call.shootDates,
            castingEmail: call.castingEmail,
            submissionDeadline: new Date(call.submissionDeadline).toISOString().split('T')[0],
          });
        }
      } catch (error) {
        console.error('Error fetching call:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCall();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/casting-calls/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Casting call updated successfully!');
        router.push('/admin');
      } else {
        const error = await res.json();
        alert('Failed to update: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this casting call? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/casting-calls/${params.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Casting call deleted successfully!');
        router.push('/admin');
      } else {
        alert('Failed to delete casting call');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            <CardTitle>Edit Casting Call</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Role Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="production">Production Name *</Label>
                <Input
                  id="production"
                  value={formData.production}
                  onChange={(e) => setFormData({ ...formData, production: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  required
                />
              </div>

              <div>
                <Label htmlFor="compensation">Compensation *</Label>
                <Input
                  id="compensation"
                  value={formData.compensation}
                  onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
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
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete Call
                </Button>
                <div className="flex-1" />
                <Link href="/admin">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
