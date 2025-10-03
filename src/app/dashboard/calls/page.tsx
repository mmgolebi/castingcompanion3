'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BrowseCallsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    roleType: 'all',
    location: '',
    unionStatus: 'all',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.roleType !== 'all') params.append('roleType', filters.roleType);
        if (filters.location) params.append('location', filters.location);
        if (filters.unionStatus !== 'all') params.append('unionStatus', filters.unionStatus);

        const res = await fetch(`/api/casting-calls?${params}`);
        if (res.ok) {
          const data = await res.json();
          setCalls(data);
        }
      } catch (error) {
        console.error('Error fetching calls:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchCalls();
    }
  }, [status, filters.roleType, filters.location, filters.unionStatus]);

  const filteredCalls = calls.filter(call =>
    call.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    call.production.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Casting Calls</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search by title or production..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <Select value={filters.roleType} onValueChange={(value) => setFilters({ ...filters, roleType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="All Role Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Role Types</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
            <SelectItem value="SUPPORTING">Supporting</SelectItem>
            <SelectItem value="BACKGROUND">Background</SelectItem>
            <SelectItem value="EXTRA">Extra</SelectItem>
            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by location..."
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <Select value={filters.unionStatus} onValueChange={(value) => setFilters({ ...filters, unionStatus: value })}>
          <SelectTrigger>
            <SelectValue placeholder="All Union Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Union Status</SelectItem>
            <SelectItem value="UNION">Union</SelectItem>
            <SelectItem value="NON_UNION">Non-Union</SelectItem>
            <SelectItem value="EITHER">Either</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCalls.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No casting calls found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCalls.map((call) => (
            <Card key={call.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{call.title}</CardTitle>
                    <CardDescription>{call.production}</CardDescription>
                  </div>
                  {call.matchScore && (
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      call.matchScore >= 85 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {call.matchScore}%
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Role:</strong> {call.roleType}</p>
                  <p><strong>Location:</strong> {call.location}</p>
                  <p><strong>Compensation:</strong> {call.compensation}</p>
                  {call.hasSubmitted && (
                    <p className="text-green-600 font-semibold">✓ Already Submitted</p>
                  )}
                </div>
                <Button 
                  className="mt-4 w-full" 
                  onClick={() => router.push(`/dashboard/calls/${call.id}`)}
                  variant={call.hasSubmitted ? 'outline' : 'default'}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
