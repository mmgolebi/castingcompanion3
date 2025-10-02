import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    redirect('/dashboard');
  }

  return session;
}
