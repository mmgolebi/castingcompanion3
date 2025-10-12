export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-land-your-first-acting-role',
    title: 'How to Land Your First Acting Role in 2025',
    excerpt: 'Breaking into the acting industry can feel overwhelming. Here are proven strategies that actually work.',
    author: 'Sarah Johnson',
    date: 'October 10, 2025',
    readTime: '5 min read',
    category: 'Career Tips',
    image: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=800',
    content: `# How to Land Your First Acting Role in 2025

Getting your first acting role is often the hardest part of building an acting career. Here's what you need to know...`
  },
  {
    slug: 'building-acting-resume-no-experience',
    title: 'Building an Acting Resume When You Have Zero Experience',
    excerpt: 'Everyone starts somewhere. Here is how to create a legitimate acting resume that gets you in the door, even with no credits.',
    author: 'Sarah Johnson',
    date: 'September 28, 2025',
    readTime: '7 min read',
    category: 'Career Tips',
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
    content: `# Building an Acting Resume When You Have Zero Experience

Starting from scratch? No problem. Here is how to build a resume that opens doors...`
  }
];
