import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Casting Companion</h1>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-white hover:text-white/90">
              Log in
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-primary hover:bg-primary/90">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Find Your Next Role,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Effortlessly
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            The smart casting platform that automatically matches you with perfect opportunities
            and submits on your behalf. Never miss an audition again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                Start 14-Day Free Trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-400">
            $1 today, then $39.97/month after your 14-day trial • Cancel anytime
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-3">Smart Matching</h3>
            <p className="text-slate-300">
              Our algorithm analyzes casting calls and your profile to find perfect matches automatically.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-3">Auto-Submit</h3>
            <p className="text-slate-300">
              Get automatically submitted to high-quality opportunities that match 85% or higher.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-3">Track Everything</h3>
            <p className="text-slate-300">
              Monitor all your submissions, response rates, and opportunities in one beautiful dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
