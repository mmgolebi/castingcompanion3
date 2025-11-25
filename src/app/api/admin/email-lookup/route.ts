import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const HUNTER_API_KEY = process.env.HUNTER_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, company } = body;

    if (!name && !company) {
      return NextResponse.json({ 
        error: 'Need at least name or company to search' 
      }, { status: 400 });
    }

    if (!HUNTER_API_KEY) {
      return NextResponse.json({ 
        error: 'Hunter.io API key not configured. Add HUNTER_API_KEY to your environment variables.',
        setupInstructions: 'Get a free API key at https://hunter.io/api-keys'
      }, { status: 503 });
    }

    if (name && company) {
      const domain = extractDomain(company);
      
      if (domain) {
        const finderResult = await emailFinder(name, domain);
        if (finderResult.email) {
          return NextResponse.json(finderResult);
        }
      }
    }

    if (company) {
      const domain = extractDomain(company);
      if (domain) {
        const searchResult = await domainSearch(domain, name);
        if (searchResult.email) {
          return NextResponse.json(searchResult);
        }
      }
    }

    return NextResponse.json({ 
      error: 'Could not find email. Try adding more information or a company domain.',
      suggestions: [
        'Try searching "Casting Director Name + casting" on LinkedIn',
        'Check IMDb Pro for contact info',
        'Look up the casting company website for contact page'
      ]
    });

  } catch (error) {
    console.error('Email lookup error:', error);
    return NextResponse.json({ 
      error: 'Email lookup failed' 
    }, { status: 500 });
  }
}

async function emailFinder(fullName: string, domain: string) {
  const [firstName, ...lastNameParts] = fullName.split(' ');
  const lastName = lastNameParts.join(' ');

  const params = new URLSearchParams({
    domain,
    first_name: firstName,
    last_name: lastName || '',
    api_key: HUNTER_API_KEY!,
  });

  const response = await fetch(
    `https://api.hunter.io/v2/email-finder?${params}`
  );

  const data = await response.json();

  if (data.data?.email) {
    return {
      email: data.data.email,
      confidence: data.data.score,
      sources: data.data.sources?.map((s: any) => s.uri) || [],
      method: 'hunter-finder'
    };
  }

  return { email: null };
}

async function domainSearch(domain: string, filterName?: string) {
  const params = new URLSearchParams({
    domain,
    api_key: HUNTER_API_KEY!,
    limit: '10',
  });

  const response = await fetch(
    `https://api.hunter.io/v2/domain-search?${params}`
  );

  const data = await response.json();

  if (data.data?.emails?.length > 0) {
    let emails = data.data.emails;

    if (filterName) {
      const nameLower = filterName.toLowerCase();
      const matched = emails.find((e: any) => {
        const fullName = `${e.first_name || ''} ${e.last_name || ''}`.toLowerCase();
        return fullName.includes(nameLower) || nameLower.includes(fullName);
      });

      if (matched) {
        return {
          email: matched.value,
          confidence: matched.confidence,
          sources: matched.sources?.map((s: any) => s.uri) || [],
          method: 'hunter-domain-match'
        };
      }
    }

    const first = emails[0];
    return {
      email: first.value,
      confidence: first.confidence,
      sources: first.sources?.map((s: any) => s.uri) || [],
      method: 'hunter-domain-first',
      note: filterName ? `No exact match for "${filterName}", showing first result` : undefined
    };
  }

  return { email: null };
}

function extractDomain(company: string): string | null {
  if (company.includes('.') && !company.includes(' ')) {
    return company.toLowerCase();
  }

  const cleanName = company
    .toLowerCase()
    .replace(/casting/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  if (cleanName.length < 2) return null;

  return `${cleanName}.com`;
}
