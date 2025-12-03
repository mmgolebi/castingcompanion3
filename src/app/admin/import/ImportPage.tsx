'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ScrapedData {
  sourceUrl?: string;
  scrapedAt?: string;
  title?: string;
  production?: string;
  castingDirector?: string;
  company?: string;
  description?: string;
  roleType?: string;
  location?: string;
  compensation?: string;
  unionStatus?: string;
  deadline?: string;
  ageRange?: string;
  gender?: string;
  ethnicity?: string;
  rawContent?: string;
  shootingDates?: string;
}

interface EmailResult {
  email?: string;
  confidence?: number;
  sources?: string[];
  error?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState<ScrapedData>({});
  const [email, setEmail] = useState('');
  const [emailLookupResult, setEmailLookupResult] = useState<EmailResult | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRawContent, setShowRawContent] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataParam));
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse scraped data:', e);
      }
    }
  }, [searchParams]);

  const updateField = (field: keyof ScrapedData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const lookupEmail = async () => {
    if (!formData.castingDirector && !formData.company) {
      setEmailLookupResult({ error: 'Need casting director name or company to look up email' });
      return;
    }

    setIsLookingUp(true);
    setEmailLookupResult(null);

    try {
      const response = await fetch('/api/admin/email-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.castingDirector,
          company: formData.company,
        }),
      });

      const result = await response.json();
      
      if (result.email) {
        setEmail(result.email);
        setEmailLookupResult(result);
      } else {
        setEmailLookupResult({ error: result.error || 'No email found' });
      }
    } catch (error) {
      setEmailLookupResult({ error: 'Failed to look up email' });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/admin/import-casting-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          castingDirectorEmail: email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      } else {
        setSaveError(result.error || 'Failed to save');
      }
    } catch (error) {
      setSaveError('Failed to save casting call');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              CC
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Import Casting Call</h1>
          </div>
          {formData.sourceUrl && (
            <p className="text-sm text-gray-500">
              Source: <a href={formData.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{formData.sourceUrl}</a>
            </p>
          )}
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✓ Casting call saved successfully! Redirecting...
          </div>
        )}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            ✗ {saveError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Role title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Production</label>
              <input
                type="text"
                value={formData.production || ''}
                onChange={(e) => updateField('production', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Film/TV show name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Type</label>
              <select
                value={formData.roleType || ''}
                onChange={(e) => updateField('roleType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select type...</option>
                <option value="LEAD">Lead</option>
                <option value="SUPPORTING">Supporting</option>
                <option value="DAY_PLAYER">Day Player</option>
                <option value="RECURRING">Recurring</option>
                <option value="GUEST_STAR">Guest Star</option>
                <option value="CO_STAR">Co-Star</option>
                <option value="BACKGROUND">Background/Extra</option>
                <option value="VOICE_OVER">Voice Over</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City, State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compensation</label>
              <input
                type="text"
                value={formData.compensation || ''}
                onChange={(e) => updateField('compensation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="$XXX/day, SAG rates, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Union Status</label>
              <select
                value={formData.unionStatus || ''}
                onChange={(e) => updateField('unionStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select...</option>
                <option value="SAG_AFTRA">SAG-AFTRA</option>
                <option value="NON_UNION">Non-Union</option>
                <option value="EITHER">Either</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="text"
                value={formData.deadline || ''}
                onChange={(e) => updateField('deadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Application deadline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shooting Dates</label>
              <input
                type="text"
                value={formData.shootingDates || ''}
                onChange={(e) => updateField('shootingDates', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Dec 4-5, 2025"
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                <input
                  type="text"
                  value={formData.ageRange || ''}
                  onChange={(e) => updateField('ageRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., 25-35"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Any</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="NON_BINARY">Non-Binary</option>
                  <option value="ANY">Any</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ethnicity</label>
                <input
                  type="text"
                  value={formData.ethnicity || ''}
                  onChange={(e) => updateField('ethnicity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Open, specific, etc."
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Role description..."
            />
          </div>

          <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 Casting Director Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Casting Director Name</label>
                <input
                  type="text"
                  value={formData.castingDirector || ''}
                  onChange={(e) => updateField('castingDirector', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Casting company"
                />
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="casting@example.com"
                />
              </div>

              <button
                onClick={lookupEmail}
                disabled={isLookingUp || (!formData.castingDirector && !formData.company)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLookingUp ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Looking up...
                  </>
                ) : (
                  <>🔍 Find Email</>
                )}
              </button>
            </div>

            {emailLookupResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${emailLookupResult.email ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {emailLookupResult.email ? (
                  <>
                    ✓ Found: <strong>{emailLookupResult.email}</strong>
                    {emailLookupResult.confidence && ` (${emailLookupResult.confidence}% confidence)`}
                  </>
                ) : (
                  <>⚠ {emailLookupResult.error}</>
                )}
              </div>
            )}
          </div>

          {formData.rawContent && (
            <div className="mb-8">
              <button
                onClick={() => setShowRawContent(!showRawContent)}
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                {showRawContent ? '▼' : '▶'} View Raw Scraped Content
              </button>
              {showRawContent && (
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  {formData.rawContent}
                </pre>
              )}
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.title}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>💾 Save Casting Call</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
