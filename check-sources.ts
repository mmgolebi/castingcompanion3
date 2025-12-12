import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sources = await prisma.user.groupBy({
    by: ['source'],
    _count: { source: true },
    orderBy: { _count: { source: 'desc' } }
  });
  console.log('Source values in database:');
  sources.forEach(s => console.log(`  ${s.source || '(null)'}: ${s._count.source} users`));
}

main().then(() => prisma.$disconnect());
