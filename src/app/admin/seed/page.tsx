'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number; details?: string } | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed-casting-calls', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          count: data.count
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to seed casting calls',
          details: data.details || JSON.stringify(data)
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: 'An error occurred while seeding',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Database Seeding</h1>

        <Card>
          <CardHeader>
            <CardTitle>Seed Casting Calls</CardTitle>
            <CardDescription>
              Add 50 realistic casting calls to the database (one for each state)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What this will do:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Create 50 casting calls (one per state)</li>
                <li>Includes diverse project types (films, TV, commercials, theater)</li>
                <li>Mix of union/non-union roles</li>
                <li>Various age ranges and experience levels</li>
                <li>Realistic shooting dates and compensation</li>
              </ul>
            </div>

            {result && (
              <div className={`rounded-lg p-4 flex items-start gap-3 ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? 'Success!' : 'Error'}
                  </p>
                  <p className={`text-sm ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.message}
                  </p>
                  {result.count !== undefined && (
                    <p className="text-sm text-green-800 mt-1">
                      {result.count} casting calls added to database
                    </p>
                  )}
                  {result.details && (
                    <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-x-auto">
                      {result.details}
                    </pre>
                  )}
                </div>
              </div>
            )}

            <Button 
              onClick={handleSeed} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                'Seed Casting Calls'
              )}
            </Button>

            <div className="text-sm text-gray-500">
              <p className="font-semibold mb-1">Note:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>This will skip any duplicate entries</li>
                <li>Safe to run multiple times</li>
                <li>All casting calls will be assigned to your account</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a href="/admin" className="text-purple-600 hover:underline">
            ← Back to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
