export function isAdmin(session: any): boolean {
  return session?.user?.role === 'ADMIN';
}

export function isCastingDirector(session: any): boolean {
  return session?.user?.role === 'CASTING_DIRECTOR';
}

export function isActor(session: any): boolean {
  return session?.user?.role === 'ACTOR';
}
