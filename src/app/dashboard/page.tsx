'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, Target, TrendingUp, MapPin, DollarSign, Calendar, TrendingUpIcon, Check, ChevronLeft, ChevronRight, Search, ArrowRight, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ITEMS_PER_PAGE = 10;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
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
  const [showFilters, setShowFilters] = useState(false);
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

      const [profileRes, statsRes, callsRes, submissionsRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/dashboard/stats'),
        fetch(`/api/casting-calls?${params}`),
        fetch('/api/dashboard/recent-submissions'),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUserName(profileData.name || '');
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (callsRes.ok) {
        const callsData = await callsRes.json();
        setCalls(Array.isArray(callsData) ? callsData : []);
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setRecentSubmissions(Array.isArray(submissionsData.submissions) ? submissionsData.submissions : []);
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
      setCurrentPage(1);
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

  const filteredCalls = (calls || []).filter(call =>
    call.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    call.production.toLowerCase().includes(filters.search.toLowerCase())
  );

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

  const displayName = userName || session?.user?.name?.split(' ')[0] || 'Actor';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-3xl font-bold">Welcome back, {displayName}!</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Your casting activity overview</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
        {/* Auto-submission banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 text-sm md:text-base">Auto-Submissions Enabled</h3>
              <p className="text-xs md:text-sm text-green-700 mt-1">
                We automatically submit your profile to casting calls that match your criteria with 85% or higher compatibility. 
                You'll receive email notifications for all auto-submissions.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - 2x2 on mobile, 4x1 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Total</CardTitle>
              <Send className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-gray-500 mt-1">Submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Pending</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.pendingSubmissions}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Active</CardTitle>
              <Bell className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.activeCalls}</div>
              <p className="text-xs text-gray-500 mt-1">Open calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">Avg Match</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.avgMatchScore > 0 ? `${stats.avgMatchScore}%` : '0%'}</div>
              <p className="text-xs text-gray-500 mt-1">Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Casting Calls Section */}
        <Card className="mb-6 md:mb-8">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Available Casting Calls</CardTitle>
            <CardDescription className="text-sm">Browse and submit to open opportunities</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {/* Search bar - always visible */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or production..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Collapsible filters on mobile */}
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full md:hidden h-12 text-base justify-between"
              >
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>

              <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-4 space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-4`}>
                <Select value={filters.roleType} onValueChange={(value) => setFilters({ ...filters, roleType: value })}>
                  <SelectTrigger className="h-12 text-base">
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
                  className="h-12 text-base"
                />
                <Select value={filters.unionStatus} onValueChange={(value) => setFilters({ ...filters, unionStatus: value })}>
                  <SelectTrigger className="h-12 text-base">
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
                    <div key={call.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex flex-col md:flex-row gap-4">
                        {call.featuredImage && (
                          <img 
                            src={call.featuredImage} 
                            alt={call.title}
                            className="w-full md:w-32 h-48 md:h-24 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2 md:mb-3">
                            <div className="flex-1 pr-2">
                              <h3 className="text-lg md:text-xl font-bold">{call.title}</h3>
                              <p className="text-sm text-gray-600">{call.production}</p>
                            </div>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs md:text-sm font-medium whitespace-nowrap">
                              {call.roleType}
                            </span>
                          </div>
                          
                          <p className="text-sm md:text-base text-gray-700 mb-3 line-clamp-2">{call.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                              {call.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
                              {call.compensation}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                              {new Date(call.submissionDeadline).toLocaleDateString()}
                            </span>
                            {call.matchScore && (
                              <span className="flex items-center gap-1">
                                <TrendingUpIcon className="h-3 w-3 md:h-4 md:w-4" />
                                Match: {call.matchScore}%
                              </span>
                            )}
                          </div>

                          {call.hasSubmitted ? (
                            call.submissionMethod === 'AUTO' ? (
                              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 md:py-1.5 rounded-md w-fit text-sm md:text-base">
                                <Zap className="h-4 w-4 md:h-5 md:w-5" />
                                <span className="font-medium">Auto-Submitted</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500 text-sm md:text-base">
                                <Check className="h-4 w-4 md:h-5 md:w-5" />
                                <span>Submitted</span>
                              </div>
                            )
                          ) : (
                            <Button 
                              onClick={() => handleSubmit(call.id)}
                              disabled={submitting === call.id}
                              size="sm"
                              className="w-full md:w-auto h-10 md:h-9 text-base md:text-sm"
                            >
                              {submitting === call.id ? 'Submitting...' : 'Submit to This Call'}
                            </Button>
                          )}
                        </div>
                      </div>
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
                      className="h-10 px-4"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden md:inline ml-1">Previous</span>
                    </Button>
                    <span className="text-sm text-gray-600 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-10 px-4"
                    >
                      <span className="hidden md:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
            <div>
              <CardTitle className="text-lg md:text-xl">Recent Submissions</CardTitle>
              <CardDescription className="text-sm">Your latest casting call applications</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard/submissions')}
              className="h-9"
            >
              <span className="hidden md:inline">View All</span>
              <ArrowRight className="h-4 w-4 md:ml-2" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {recentSubmissions.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm md:text-base">
                No submissions yet. We'll auto-submit you to matching calls!
              </p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {recentSubmissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base">{submission.call.title}</h4>
                      <p className="text-sm text-gray-600">{submission.call.production}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(submission.createdAt).toLocaleDateString()} • 
                        Match: {submission.matchScore}%
                      </p>
                    </div>
                    <div className={`px-3 py-1.5 md:py-1 rounded-full text-sm font-medium w-fit ${
                      submission.method === 'AUTO' 
                        ? 'bg-amber-100 text-amber-700 flex items-center gap-1' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {submission.method === 'AUTO' ? (
                        <>
                          <Zap className="h-4 w-4" />
                          Auto
                        </>
                      ) : (
                        'Manual'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
