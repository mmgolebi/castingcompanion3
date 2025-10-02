'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Send, Clock, TrendingUp, MapPin, DollarSign, Calendar, Check, Search, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState('Actor');
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    activeCalls: 0,
    matchScore: 0,
  });
  const [castingCalls, setCastingCalls] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [submittedCallIds, setSubmittedCallIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleTypeFilter, setRoleTypeFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('');
  const [unionFilter, setUnionFilter] = useState('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '10',
          search: searchQuery,
          roleType: roleTypeFilter,
          location: locationFilter,
          union: unionFilter,
        });

        const [profileRes, statsRes, callsRes, submissionsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/dashboard/stats'),
          fetch(`/api/dashboard/casting-calls?${params}`),
          fetch('/api/dashboard/recent-submissions'),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserName(profileData.name || 'Actor');
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (callsRes.ok) {
          const callsData = await callsRes.json();
          setCastingCalls(callsData.calls);
          setTotalPages(callsData.totalPages);
        }

        if (submissionsRes.ok) {
          const submissionsData = await submissionsRes.json();
          setRecentSubmissions(submissionsData.recent || []);
          setSubmittedCallIds(new Set(submissionsData.allCallIds || []));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, currentPage, searchQuery, roleTypeFilter, locationFilter, unionFilter]);

  const handleSubmit = async (callId: string) => {
    setSubmitting(callId);
    try {
      const res = await fetch('/api/dashboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      });

      if (res.ok) {
        setSubmittedCallIds(prev => new Set([...prev, callId]));
        
        const [statsRes, submissionsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/recent-submissions'),
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (submissionsRes.ok) {
          const data = await submissionsRes.json();
          setRecentSubmissions(data.recent || []);
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred');
    } finally {
      setSubmitting(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const firstName = userName.split(' ')[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {firstName}!
        </h1>
        <p className="text-gray-600">Here's your casting activity overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCalls}</div>
            <p className="text-xs text-muted-foreground">Open opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.matchScore}%</div>
            <p className="text-xs text-muted-foreground">Profile compatibility</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available Casting Calls</CardTitle>
          <CardDescription>Browse and submit to open opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or production..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={roleTypeFilter} onValueChange={(value) => { setRoleTypeFilter(value); handleFilterChange(); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Role Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Role Types</SelectItem>
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="SUPPORTING">Supporting</SelectItem>
                  <SelectItem value="BACKGROUND">Background</SelectItem>
                  <SelectItem value="EXTRA">Extra</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => { setLocationFilter(e.target.value); handleFilterChange(); }}
              />

              <Select value={unionFilter} onValueChange={(value) => { setUnionFilter(value); handleFilterChange(); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Union Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Union Status</SelectItem>
                  <SelectItem value="SAG_AFTRA">SAG-AFTRA Only</SelectItem>
                  <SelectItem value="NON_UNION">Non-Union Only</SelectItem>
                  <SelectItem value="EITHER">Either</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {castingCalls.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No casting calls found</p>
            ) : (
              castingCalls.map((call) => {
                const isSubmitted = submittedCallIds.has(call.id);
                const matchScore = call.matchScore || 0;
                const wasAutoSubmitted = call.wasAutoSubmitted || false;
                
                return (
                  <div key={call.id} className="border rounded-lg p-4 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{call.title}</h3>
                        <p className="text-sm text-gray-600">{call.production}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={call.roleType === 'LEAD' ? 'default' : 'secondary'}>
                          {call.roleType}
                        </Badge>
                        {wasAutoSubmitted && (
                          <Badge variant="default" className="bg-green-600">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Auto-Submitted
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{call.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {call.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {call.compensation}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Deadline: {new Date(call.submissionDeadline).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        Match: {matchScore}%
                      </div>
                    </div>

                    {isSubmitted ? (
                      <Button size="sm" disabled variant="secondary" className="cursor-not-allowed">
                        <Check className="h-4 w-4 mr-2" />
                        Submitted
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubmit(call.id)}
                        disabled={submitting === call.id}
                        size="sm"
                      >
                        {submitting === call.id ? 'Submitting...' : 'Submit to This Call'}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="py-2 px-4 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Your latest casting call submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{submission.call.title}</h4>
                      <p className="text-sm text-gray-600">{submission.call.production}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={submission.method === 'AUTO' ? 'default' : 'secondary'}>
                        {submission.method === 'AUTO' ? 'Auto-Submitted' : 'Manual'}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Match: {submission.matchScore}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
