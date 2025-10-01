'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, CheckCircle, X } from 'lucide-react';
import { getMatchTier } from '@/lib/matching';
import { formatDate } from '@/lib/utils';

function CastingCallsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleType, setRoleType] = useState('');
  const [location, setLocation] = useState('');
  const [unionReq, setUnionReq] = useState('');
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const callId = searchParams?.get('id');
    if (callId) {
      fetchCallDetail(callId);
    }
    fetchCalls();
  }, [searchParams]);

  const fetchCalls = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        ...(searchQuery && { q: searchQuery }),
        ...(roleType && { roleType }),
        ...(location && { location }),
        ...(unionReq && { unionReq }),
      });

      const res = await fetch(`/api/casting-calls?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCallDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/casting-calls/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCall(data);
      }
    } catch (error) {
      console.error('Failed to fetch call detail:', error);
    }
  };

  const handleSubmit = async (callId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      });

      if (res.ok) {
        alert('✅ Submitted successfully! Your materials have been sent to the casting director.');
        setSelectedCall(null);
        fetchCalls(pagination.page);
      } else {
        const data = await res.json();
        alert(`❌ ${data.error || 'Submission failed'}`);
      }
    } catch (error) {
      alert('❌ Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = () => {
    fetchCalls(1);
  };

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
            <Link href="/dashboard/history">
              <Button variant="ghost">History</Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Casting Calls</h1>
          <p className="text-muted-foreground">Find your next role from {pagination.total} opportunities</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, production, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select value={roleType} onValueChange={setRoleType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Role Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="LEAD">Lead</SelectItem>
                  <SelectItem value="SUPPORTING">Supporting</SelectItem>
                  <SelectItem value="BACKGROUND">Background</SelectItem>
                  <SelectItem value="EXTRA">Extra</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={unionReq} onValueChange={setUnionReq}>
                <SelectTrigger>
                  <SelectValue placeholder="All Union Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="SAG_AFTRA">SAG-AFTRA</SelectItem>
                  <SelectItem value="NON_UNION">Non-Union</SelectItem>
                  <SelectItem value="EITHER">Either</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="w-full">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Casting Calls List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading casting calls...</p>
          </div>
        ) : calls.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No casting calls found matching your criteria</p>
              <Button onClick={() => { setSearchQuery(''); setRoleType(''); setLocation(''); setUnionReq(''); fetchCalls(1); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {calls.map((call) => {
                const { label, variant } = getMatchTier(call.matchScore);
                const isPastDeadline = new Date(call.submissionDeadline) < new Date();

                return (
                  <Card key={call.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-xl mb-1">{call.title}</h3>
                              <p className="text-muted-foreground mb-2">{call.production}</p>
                              <div className="flex flex-wrap gap-3 text-sm">
                                <span>📍 {call.location}</span>
                                <span>•</span>
                                <Badge variant="outline">{call.roleType}</Badge>
                                <span>•</span>
                                <span>💰 {call.compensation}</span>
                                <span>•</span>
                                <span>📅 {formatDate(call.submissionDeadline)}</span>
                              </div>
                            </div>
                            <Badge variant={variant as any}>
                              {call.matchScore}% {label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {call.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchCallDetail(call.id)}
                        >
                          View Details
                        </Button>
                        {isPastDeadline ? (
                          <Button size="sm" disabled>
                            Deadline Passed
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              if (confirm(`Submit to "${call.title}"?`)) {
                                handleSubmit(call.id);
                              }
                            }}
                          >
                            Submit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCalls(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCalls(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        {selectedCall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCall(null)}>
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{selectedCall.call?.title}</CardTitle>
                    <CardDescription>{selectedCall.call?.production}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCall(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedCall.call?.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Location:</span> {selectedCall.call?.location}
                  </div>
                  <div>
                    <span className="font-semibold">Compensation:</span> {selectedCall.call?.compensation}
                  </div>
                  <div>
                    <span className="font-semibold">Role Type:</span> {selectedCall.call?.roleType}
                  </div>
                  <div>
                    <span className="font-semibold">Union:</span> {selectedCall.call?.unionReq}
                  </div>
                  {selectedCall.call?.shootDates && (
                    <div className="col-span-2">
                      <span className="font-semibold">Shoot Dates:</span> {selectedCall.call?.shootDates}
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-semibold">Submission Deadline:</span> {formatDate(selectedCall.call?.submissionDeadline)}
                  </div>
                </div>
                {selectedCall.call?.skillsRequired?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCall.call.skillsRequired.map((skill: string) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t">
                  {selectedCall.hasSubmitted ? (
                    <Button disabled className="flex-1">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Already Submitted
                    </Button>
                  ) : new Date(selectedCall.call?.submissionDeadline) < new Date() ? (
                    <Button disabled className="flex-1">
                      Deadline Passed
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => handleSubmit(selectedCall.call.id)}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit to This Role'}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedCall(null)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CastingCallsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="text-2xl font-bold text-primary">Casting Companion</div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading casting calls...</p>
          </div>
        </div>
      </div>
    }>
      <CastingCallsContent />
    </Suspense>
  );
}