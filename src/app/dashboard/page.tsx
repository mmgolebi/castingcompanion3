'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, Target, TrendingUp, MapPin, DollarSign, Calendar, TrendingUpIcon, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ITEMS_PER_PAGE = 10;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    activeCalls: 0,
    avgMatchScore: 0,
  });
  const [calls, setCalls] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const fetchDashboardData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.roleType !== 'all') params.append('roleType', filters.roleType);
      if (filters.location) params.append('location', filters.location);
      if (filters.unionStatus !== 'all') params.append('unionStatus', filters.unionStatus);

      const [statsRes, callsRes, submissionsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch(`/api/casting-calls?${params}`),
        fetch('/api/dashboard/recent-submissions'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (callsRes.ok) {
        const callsData = await callsRes.json();
        setCalls(callsData);
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setRecentSubmissions(submissionsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [status, filters.roleType, filters.location, filters.unionStatus]);

  const handleSubmit = async (callId: string) => {
    setSubmitting(callId);
    try {
      const res = await fetch(`/api/casting-calls/${callId}/submit`, {
        method: 'POST',
      });

      if (res.ok) {
        toast({
          title: "Success!",
          description: "Your submission has been sent to the casting director.",
        });
        await fetchDashboardData();
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.error || 'Failed to submit',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: 'An error occurred while submitting',
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  const filteredCalls = calls.filter(call =>
    call.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    call.production.toLowerCase().includes(filters.search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCalls.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCalls = filteredCalls.slice(startIndex, endIndex);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {session?.user?.name?.split(' ')[0] || 'Actor'}!</h1>
      <p className="text-gray-600 mb-8">Here's your casting activity overview</p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Auto-Submissions Enabled</h3>
            <p className="text-sm text-green-700 mt-1">
              We automatically submit your profile to casting calls that match your criteria with 85% or higher compatibility. 
              Match scores are based on: <strong>age range (30%)</strong>, <strong>gender (20%)</strong>, <strong>location (25%)</strong>, 
              <strong>union status (15%)</strong>, and <strong>ethnicity (10%)</strong>. You'll receive email notifications for all auto-submissions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
            <Send className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Target className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Calls</CardTitle>
            <Bell className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCalls}</div>
            <p className="text-xs text-gray-500 mt-1">Open opportunities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMatchScore}%</div>
            <p className="text-xs text-gray-500 mt-1">Profile compatibility</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available Casting Calls</CardTitle>
          <CardDescription>Browse and submit to open opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <Input
              placeholder="Search by title or production..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          {filteredCalls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No casting calls found matching your criteria
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedCalls.map((call) => (
                  <div key={call.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold">{call.title}</h3>
                        <p className="text-sm text-gray-600">{call.production}</p>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                        {call.roleType}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{call.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {call.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {call.compensation}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Deadline: {new Date(call.submissionDeadline).toLocaleDateString()}
                      </span>
                      {call.matchScore && (
                        <span className="flex items-center gap-1">
                          <TrendingUpIcon className="h-4 w-4" />
                          Match: {call.matchScore}%
                        </span>
                      )}
                    </div>

                    {call.hasSubmitted ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Check className="h-5 w-5" />
                        <span>Submitted</span>
                      </div>
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
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Your latest casting call applications</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No submissions yet. We'll auto-submit you to matching calls!</p>
          ) : (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{submission.call.title}</h4>
                    <p className="text-sm text-gray-600">{submission.call.production}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted {new Date(submission.createdAt).toLocaleDateString()} • 
                      Match: {submission.matchScore}%
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    submission.method === 'AUTO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {submission.method === 'AUTO' ? 'Auto' : 'Manual'}
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
