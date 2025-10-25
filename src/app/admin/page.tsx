'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Edit, ArrowLeft } from 'lucide-react';
import { UploadButton } from '@/components/upload-button';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [castingCalls, setCastingCalls] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('manage');
  const [formData, setFormData] = useState({
    title: '',
    production: '',
    description: '',
    roleType: 'LEAD',
    location: '',
    compensation: '',
    submissionDeadline: '',
    shootingDates: '',
    ageRangeMin: '',
    ageRangeMax: '',
    gender: 'ANY',
    ethnicity: 'ANY',
    unionStatus: 'EITHER',
    castingEmail: '',
    featuredImage: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const res = await fetch('/api/admin/check');
        if (res.ok) {
          setIsAdmin(true);
          await fetchCastingCalls();
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      checkAdminAndFetch();
    }
  }, [status, router]);

  const fetchCastingCalls = async () => {
    try {
      const res = await fetch('/api/admin/casting-calls');
      if (res.ok) {
        const data = await res.json();
        setCastingCalls(data);
      }
    } catch (error) {
      console.error('Error fetching casting calls:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/admin/casting-calls/${editingId}` : '/api/admin/casting-calls';
      const method = editingId ? 'PUT' : 'POST';

      // Convert date string to ISO DateTime
      const submissionDeadline = formData.submissionDeadline 
        ? new Date(formData.submissionDeadline + 'T00:00:00.000Z').toISOString()
        : new Date().toISOString();

      const submitData = {
        ...formData,
        submissionDeadline,
        ageRangeMin: formData.ageRangeMin ? parseInt(formData.ageRangeMin) : null,
        ageRangeMax: formData.ageRangeMax ? parseInt(formData.ageRangeMax) : null,
        gender: formData.gender === 'ANY' ? null : formData.gender,
        ethnicity: formData.ethnicity === 'ANY' ? null : formData.ethnicity,
        shootingDates: formData.shootingDates || null,
        featuredImage: formData.featuredImage || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        alert(editingId ? 'Casting call updated!' : 'Casting call created!');
        resetForm();
        await fetchCastingCalls();
        setActiveTab('manage');
      } else {
        const error = await res.json();
        alert(`Failed to save casting call: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  const handleEdit = (call: any) => {
    setEditingId(call.id);
    setFormData({
      title: call.title,
      production: call.production,
      description: call.description,
      roleType: call.roleType,
      location: call.location,
      compensation: call.compensation,
      submissionDeadline: call.submissionDeadline.split('T')[0],
      shootingDates: call.shootingDates || '',
      ageRangeMin: call.ageRangeMin?.toString() || '',
      ageRangeMax: call.ageRangeMax?.toString() || '',
      gender: call.gender || 'ANY',
      ethnicity: call.ethnicity || 'ANY',
      unionStatus: call.unionStatus,
      castingEmail: call.castingEmail,
      featuredImage: call.featuredImage || '',
    });
    setActiveTab('create');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this casting call?')) return;

    try {
      const res = await fetch(`/api/admin/casting-calls/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Casting call deleted!');
        await fetchCastingCalls();
      } else {
        alert('Failed to delete casting call');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      production: '',
      description: '',
      roleType: 'LEAD',
      location: '',
      compensation: '',
      submissionDeadline: '',
      shootingDates: '',
      ageRangeMin: '',
      ageRangeMax: '',
      gender: 'ANY',
      ethnicity: 'ANY',
      unionStatus: 'EITHER',
      castingEmail: '',
      featuredImage: '',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="create">Create/Edit Casting Call</TabsTrigger>
          <TabsTrigger value="manage">Manage Casting Calls</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit' : 'Create'} Casting Call</CardTitle>
              <CardDescription>
                {editingId ? 'Update the casting call details below' : 'Fill in the details for your new casting opportunity'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Role Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Leading Role - Sarah"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="production">Production Name *</Label>
                  <Input
                    id="production"
                    value={formData.production}
                    onChange={(e) => setFormData({ ...formData, production: e.target.value })}
                    placeholder="e.g., Netflix Series 'The Crown'"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed role description..."
                    rows={4}
                    required
                  />
                </div>

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
                      <SelectItem value="GUEST_STAR">Guest Star</SelectItem>
                      <SelectItem value="CO_STAR">Co-Star</SelectItem>
                      <SelectItem value="BACKGROUND">Background</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Los Angeles, CA"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="compensation">Compensation *</Label>
                    <Input
                      id="compensation"
                      value={formData.compensation}
                      onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                      placeholder="e.g., $500/day"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="shootingDates">Shooting Dates</Label>
                    <Input
                      id="shootingDates"
                      value={formData.shootingDates}
                      onChange={(e) => setFormData({ ...formData, shootingDates: e.target.value })}
                      placeholder="e.g., January 15-20, 2024"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ageRangeMin">Age Range Min</Label>
                    <Input
                      id="ageRangeMin"
                      type="number"
                      value={formData.ageRangeMin}
                      onChange={(e) => setFormData({ ...formData, ageRangeMin: e.target.value })}
                      placeholder="18"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ageRangeMax">Age Range Max</Label>
                    <Input
                      id="ageRangeMax"
                      type="number"
                      value={formData.ageRangeMax}
                      onChange={(e) => setFormData({ ...formData, ageRangeMax: e.target.value })}
                      placeholder="35"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANY">Any</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-Binary">Non-Binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ethnicity">Ethnicity</Label>
                    <Select
                      value={formData.ethnicity}
                      onValueChange={(value) => setFormData({ ...formData, ethnicity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANY">Any</SelectItem>
                        <SelectItem value="Caucasian">White/Caucasian</SelectItem>
                        <SelectItem value="African American">Black/African American</SelectItem>
                        <SelectItem value="Hispanic">Hispanic/Latino</SelectItem>
                        <SelectItem value="Asian">Asian</SelectItem>
                        <SelectItem value="Native American">Native American</SelectItem>
                        <SelectItem value="Middle Eastern">Middle Eastern</SelectItem>
                        <SelectItem value="Pacific Islander">Pacific Islander</SelectItem>
                        <SelectItem value="Mixed">Mixed/Multiracial</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="unionStatus">Union Status *</Label>
                  <Select
                    value={formData.unionStatus}
                    onValueChange={(value) => setFormData({ ...formData, unionStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNION">Union Only</SelectItem>
                      <SelectItem value="NON_UNION">Non-Union Only</SelectItem>
                      <SelectItem value="EITHER">Either</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label>Featured Image (Optional)</Label>
                  {formData.featuredImage && (
                    <div className="mb-2">
                      <img 
                        src={formData.featuredImage} 
                        alt="Featured" 
                        className="w-48 h-32 object-cover rounded"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => setFormData({ ...formData, featuredImage: '' })}
                        className="mt-2"
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                  <UploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={(res: any) => {
                      if (res?.[0]) {
                        setFormData({ ...formData, featuredImage: res[0].url });
                        alert('Image uploaded!');
                      }
                    }}
                    onUploadError={(error: Error) => {
                      alert(`Upload failed: ${error.message}`);
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingId ? 'Update' : 'Create'} Casting Call
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Existing Casting Calls</CardTitle>
              <CardDescription>Manage your casting opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {castingCalls.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No casting calls yet</p>
              ) : (
                <div className="space-y-4">
                  {castingCalls.map((call) => (
                    <div key={call.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {call.featuredImage && (
                            <img 
                              src={call.featuredImage} 
                              alt={call.title}
                              className="w-32 h-20 object-cover rounded mb-2"
                            />
                          )}
                          <h3 className="text-xl font-bold">{call.title}</h3>
                          <p className="text-sm text-gray-600">{call.production}</p>
                          <p className="text-sm mt-2">{call.description}</p>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Location: {call.location}</p>
                            <p>Deadline: {new Date(call.submissionDeadline).toLocaleDateString()}</p>
                            <p>Compensation: {call.compensation}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(call)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(call.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
