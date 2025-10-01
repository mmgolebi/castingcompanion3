'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Send, CheckCircle, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { getMatchTier } from '@/lib/matching';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalSubmissions: 0,
    responseRate: 0,
    thisWeek: 0,
  });
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [autoSubmitCount, setAutoSubmitCount] = useState(0);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch profile to check completeness
      const profileRes = await fetch('/api/profile');
      if (profileRes.ok) {
        const { profile } = await profileRes.json();
        setProfileComplete(!!profile?.headshotUrl && !!profile?.age && !!profile?.gender);
      }

      // Fetch submissions for stats
      const submissionsRes = await fetch('/api/submissions?pageSize=100');
      if (submissionsRes.ok) {
        const { submissions } = await submissionsRes.json();
        
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const thisWeekSubs = submissions.filter(
          (s: any) => new Date(s.createdAt) >= weekAgo
        );
        const recentAutoSubs = submissions.filter(
          (s: any) => s.method === 'AUTO' && new Date(s.createdAt) >= dayAgo
        );
        const responded = submissions.filter((s: any) => s.status === 'RESPONDED');
        const sent = submissions.filter((s: any) => ['SENT', 'RESPONDED', 'REJECTED'].includes(s.status));

        setStats({
          totalMatches: 0, // Will calculate from calls
          totalSubmissions: submissions.length,
          responseRate: sent.length > 0 ? Math.round((responded.length / sent.length) * 100) : 0,
          thisWeek: thisWeekSubs.length,
        });
        setAutoSubmitCount(recentAutoSubs.length);
      }

      // Fetch recent casting calls
      const callsRes = await fetch('/api/casting-calls?pageSize=5&sort=deadline');
      if (callsRes.ok) {
        const { calls } = await callsRes.json();
        setRecentCalls(calls);
        
        // Count matches (score > 0)
        const matches = calls.filter((c: any) => c.matchScore > 0);
        setStats(prev => ({ ...prev, totalMatches: matches.length }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Casting Companion</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <Link href="/api/auth/signout">
              <Button variant="outline">Log out</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Auto-Submit Banner */}
        {autoSubmitCount > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">
                ✅ We auto-submitted you to {autoSubmitCount} high-quality{' '}
                {autoSubmitCount === 1 ? 'opportunity' : 'opportunities'} (≥85% match)
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Check your email for confirmation and track all submissions in your history.
              </p>
            </div>
            <Link href="/dashboard/history">
              <Button variant="outline" size="sm">
                View History
              </Button>
            </Link>
          </div>
        )}

        {/* Profile Incomplete Banner */}
        {!profileComplete && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Complete your profile to get better matches</h3>
              <p className="text-sm text-amber-700 mt-1">
                Add your headshot, age, and gender to receive personalized casting opportunities.
              </p>
            </div>
            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm">
                Complete Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <p className="text-xs text-muted-foreground">Active casting calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSubmissions === 0 ? 'No submissions yet' : 'From sent submissions'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
              <p className="text-xs text-muted-foreground">New submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Casting Calls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Casting Calls</CardTitle>
                <CardDescription>Top opportunities matching your profile</CardDescription>
              </div>
              <Link href="/dashboard/calls">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentCalls.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No casting calls available at the moment</p>
                <Button onClick={() => router.push('/dashboard/calls')}>Browse Opportunities</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCalls.map((call) => {
                  const { label, variant } = getMatchTier(call.matchScore);
                  return (
                    <div key={call.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{call.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{call.production}</p>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <span className="text-muted-foreground">📍 {call.location}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">💰 {call.compensation}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">📅 Deadline: {formatDate(call.submissionDeadline)}</span>
                            </div>
                          </div>
                          <Badge variant={variant as any}>
                            {call.matchScore}% {label}
                          </Badge>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link href={`/dashboard/calls?id=${call.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
