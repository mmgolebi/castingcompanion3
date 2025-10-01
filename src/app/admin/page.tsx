'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleType, setRoleType] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchQuery && { q: searchQuery }),
        ...(roleType && { roleType }),
        ...(location && { location }),
      });

      const res = await fetch(`/api/casting-calls?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls);
        setPagination(data.pagination);
      } else if (res.status === 403) {
        alert('Access denied. Admin only.');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete casting call "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/casting-calls/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Casting call deleted successfully');
        fetchCalls(pagination.page);
      } else {
        alert('❌ Failed to delete casting call');
      }
    } catch (error) {
      alert('❌ Failed to delete casting call');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">Casting Companion</h1>
            <Badge variant="destructive">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Actor View</Button>
            </Link>
            <Link href="/api/auth/signout">
              <Button variant="outline">Log out</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Casting Calls</h1>
            <p className="text-muted-foreground">{pagination.total} total opportunities</p>
          </div>
          <Link href="/admin/calls/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Call
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, production, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCalls(1)}
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

              <Button onClick={() => fetchCalls(1)} className="w-full">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calls Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading casting calls...</p>
          </div>
        ) : calls.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No casting calls found</p>
              <Link href="/admin/calls/new">
                <Button>Create First Call</Button>
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
                        <th className="text-left p-4 font-semibold">Role Type</th>
                        <th className="text-left p-4 font-semibold">Location</th>
                        <th className="text-left p-4 font-semibold">Deadline</th>
                        <th className="text-left p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((call) => (
                        <tr key={call.id} className="border-b hover:bg-slate-50">
                          <td className="p-4 font-medium">{call.title}</td>
                          <td className="p-4 text-sm text-muted-foreground">{call.production}</td>
                          <td className="p-4">
                            <Badge variant="outline">{call.roleType}</Badge>
                          </td>
                          <td className="p-4 text-sm">{call.location}</td>
                          <td className="p-4 text-sm">{formatDate(call.submissionDeadline)}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/admin/calls/${call.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/admin/calls/${call.id}/edit`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(call.id, call.title)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
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
              {calls.map((call) => (
                <Card key={call.id}>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{call.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{call.production}</p>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Role Type:</span>
                        <Badge variant="outline">{call.roleType}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{call.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Deadline:</span>
                        <span>{formatDate(call.submissionDeadline)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/admin/calls/${call.id}/edit`)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(call.id, call.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
      </div>
    </div>
  );
}
