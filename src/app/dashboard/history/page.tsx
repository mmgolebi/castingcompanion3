'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { maskEmail, formatDateTime } from '@/lib/utils';

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchQuery && { q: searchQuery }),
        ...(methodFilter && { method: methodFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/submissions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSubmissions(1);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'default';
      case 'RESPONDED':
        return 'success';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
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
            <Link href="/dashboard/calls">
              <Button variant="ghost">Browse Calls</Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Submission History</h1>
          <p className="text-muted-foreground">Track all your casting submissions in one place</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or production..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Methods</SelectItem>
                  <SelectItem value="AUTO">Automatic</SelectItem>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="RESPONDED">Responded</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="w-full">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No submissions found</p>
              <Link href="/dashboard/calls">
                <Button>Browse Casting Calls</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-slate-50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Title</th>
                        <th className="text-left p-4 font-semibold">Production</th>
                        <th className="text-left p-4 font-semibold">Casting Director</th>
                        <th className="text-left p-4 font-semibold">Method</th>
                        <th className="text-left p-4 font-semibold">Match</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="border-b hover:bg-slate-50">
                          <td className="p-4 font-medium">{sub.castingCall.title}</td>
                          <td className="p-4 text-sm text-muted-foreground">{sub.castingCall.production}</td>
                          <td className="p-4 text-sm">{maskEmail(sub.castingEmail)}</td>
                          <td className="p-4">
                            <Badge variant={sub.method === 'AUTO' ? 'success' : 'default'}>
                              {sub.method}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{sub.matchScore}%</Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant={getStatusVariant(sub.status) as any}>
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {formatDateTime(sub.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {submissions.map((sub) => (
                <Card key={sub.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{sub.castingCall.title}</CardTitle>
                    <CardDescription>{sub.castingCall.production}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Casting Director:</span>
                      <span>{maskEmail(sub.castingEmail)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Method:</span>
                      <Badge variant={sub.method === 'AUTO' ? 'success' : 'default'}>
                        {sub.method}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Match Score:</span>
                      <Badge variant="outline">{sub.matchScore}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={getStatusVariant(sub.status) as any}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Submitted {formatDateTime(sub.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchSubmissions(pagination.page - 1)}
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
                  onClick={() => fetchSubmissions(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
