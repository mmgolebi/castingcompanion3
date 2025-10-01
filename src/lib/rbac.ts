export function assertAdmin(session: any): asserts session is { user: { id: string; role: string } } {
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
}

export function assertAuthenticated(session: any): asserts session is { user: { id: string; role: string } } {
  if (!session?.user) {
    throw new Error('UNAUTHORIZED');
  }
}

export function isAdmin(session: any): boolean {
  return session?.user?.role === 'ADMIN';
}