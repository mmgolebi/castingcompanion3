import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  let isAdmin = false;
  if (session?.user) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { isAdmin: true },
      });
      isAdmin = user?.isAdmin || false;
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-primary">
            Casting Companion
          </Link>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline">Admin Panel</Button>
              </Link>
            )}
            <Link href="/dashboard/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <Link href="/auth/signout">
              <Button variant="ghost">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
