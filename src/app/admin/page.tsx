import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboard() {
  await requireAdmin();

  const [totalUsers, totalCalls, totalSubmissions, allCalls] = await Promise.all([
    prisma.user.count(),
    prisma.castingCall.count(),
    prisma.submission.count(),
    prisma.castingCall.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Casting Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalCalls}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalSubmissions}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>All Casting Calls ({allCalls.length})</CardTitle>
            <Link href="/admin/casting-calls/new">
              <Button>Add New Call</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allCalls.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No casting calls yet. Create your first one!</p>
              ) : (
                allCalls.map((call) => (
                  <div key={call.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{call.title}</h3>
                      <p className="text-sm text-gray-600">{call.production} • {call.location}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {call._count.submissions} submissions • Deadline: {new Date(call.submissionDeadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/casting-calls/${call.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
