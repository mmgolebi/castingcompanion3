'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, TrendingUp, Zap, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function SubmissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    method: 'all',
    status: 'all',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/submissions');
        if (res.ok) {
          const data = await res.json();
          // Handle both array and object responses
          const submissionsArray = Array.isArray(data) ? data : (data.submissions || []);
          setSubmissions(submissionsArray);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchSubmissions();
    }
  }, [status]);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.call?.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      submission.call?.production?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesMethod = filters.method === 'all' || submission.method === filters.method;
    const matchesStatus = filters.status === 'all' || submission.status === filters.status;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      SENT: { label: 'Sent', className: 'bg-blue-100 text-blue-700' },
      VIEWED: { label: 'Viewed', className: 'bg-purple-100 text-purple-700' },
      CALLBACK: { label: 'Callback', className: 'bg-green-100 text-green-700' },
      BOOKED: { label: 'Booked', className: 'bg-emerald-100 text-emerald-700' },
      REJECTED: { label: 'Rejected', className: 'bg-gray-100 text-gray-700' },
    };

    const config = statusConfig[status] || statusConfig.SENT;
    return (
      <Badge className={`${config.className} text-xs md:text-sm`}>
        {config.label}
      </Badge>
    );
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      method: 'all',
      status: 'all',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.search || filters.method !== 'all' || filters.status !== 'all';

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-3xl font-bold">My Submissions</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'submission' : 'submissions'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 pb-20 md:pb-8">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Submission History</CardTitle>
            <CardDescription className="text-sm md:text-base">Track all your casting call applications</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {/* Search bar - always visible */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or production..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Mobile filter toggle */}
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full md:hidden h-12 text-base justify-between"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">Active</Badge>
                  )}
                </span>
                {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              </Button>

              <div className={`${showFilters ? 'block' : 'hidden'} md:block mt-4 space-y-3 md:space-y-0 md:flex md:gap-4 md:items-center`}>
                <Select 
                  value={filters.method} 
                  onValueChange={(value) => {
                    setFilters({ ...filters, method: value });
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-12 text-base md:w-48">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="AUTO">Auto-Submitted</SelectItem>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={filters.status} 
                  onValueChange={(value) => {
                    setFilters({ ...filters, status: value });
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-12 text-base md:w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="VIEWED">Viewed</SelectItem>
                    <SelectItem value="CALLBACK">Callback</SelectItem>
                    <SelectItem value="BOOKED">Booked</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-12 text-base w-full md:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {hasActiveFilters ? (
                  <>
                    <p className="text-base mb-4">No submissions found matching your filters</p>
                    <Button onClick={clearFilters} variant="outline" className="h-10">
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <p className="text-base">No submissions yet. Browse casting calls to get started!</p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedSubmissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg font-bold truncate">{submission.call?.title || 'Unknown'}</h3>
                            <p className="text-sm text-gray-600 truncate">{submission.call?.production || 'Unknown'}</p>
                          </div>
                          {getStatusBadge(submission.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                            {submission.call?.location || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                            {submission.matchScore || 0}% match
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className={`flex items-center gap-2 text-sm ${
                            submission.method === 'AUTO' 
                              ? 'text-amber-700' 
                              : 'text-blue-700'
                          }`}>
                            {submission.method === 'AUTO' ? (
                              <>
                                <Zap className="h-4 w-4" />
                                <span className="font-medium">Auto-Submitted</span>
                              </>
                            ) : (
                              <span className="font-medium">Manual Submission</span>
                            )}
                          </div>
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
      </div>
    </div>
  );
}
