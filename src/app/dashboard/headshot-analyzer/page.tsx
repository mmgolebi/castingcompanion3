'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadButton } from '@/components/upload-button';
import { Camera, CheckCircle, AlertCircle, Lightbulb, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Analysis {
  id: string;
  imageUrl: string;
  overallScore: number;
  lightingScore: number;
  compositionScore: number;
  expressionScore: number;
  professionalScore: number;
  backgroundScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  createdAt: string;
}

export default function HeadshotAnalyzerPage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleAnalyze = async (imageUrl: string) => {
    setAnalyzing(true);
    setCurrentImage(imageUrl);
    setAnalysis(null);

    try {
      const res = await fetch('/api/headshot-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      } else {
        alert('Failed to analyze headshot. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Camera className="h-8 w-8 text-purple-600" />
            AI Headshot Analyzer
          </h1>
          <p className="text-gray-600 mt-1">
            Get professional feedback on your headshots in seconds
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {!analysis && !analyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Headshot</CardTitle>
            <CardDescription>
              Our AI will analyze lighting, composition, expression, and professionalism
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
              <Camera className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Upload a clear headshot photo</p>
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res: any) => {
                  if (res?.[0]) {
                    handleAnalyze(res[0].url);
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`Upload failed: ${error.message}`);
                }}
              />
              <p className="text-sm text-gray-500 mt-4">
                Best results: High resolution, well-lit, front-facing photos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {analyzing && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-lg font-semibold">Analyzing your headshot...</p>
              <p className="text-gray-600 mt-2">This may take 10-15 seconds</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <img
                  src={analysis.imageUrl}
                  alt="Analyzed headshot"
                  className="w-48 h-48 object-cover rounded-lg"
                />
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Overall Score</p>
                      <p className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={analysis.overallScore} 
                    className="h-3"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    {analysis.overallScore >= 80 && "Excellent headshot! Industry-ready."}
                    {analysis.overallScore >= 60 && analysis.overallScore < 80 && "Good headshot with room for improvement."}
                    {analysis.overallScore < 60 && "Consider getting new headshots with these improvements."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Lighting', score: analysis.lightingScore },
                { label: 'Composition', score: analysis.compositionScore },
                { label: 'Expression', score: analysis.expressionScore },
                { label: 'Professionalism', score: analysis.professionalScore },
                { label: 'Background', score: analysis.backgroundScore },
              ].map((category) => (
                <div key={category.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{category.label}</span>
                    <span className={`text-sm font-bold ${getScoreColor(category.score)}`}>
                      {category.score}/100
                    </span>
                  </div>
                  <Progress value={category.score} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                What's Working Well
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {analysis.detailedFeedback}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={() => {
                setAnalysis(null);
                setCurrentImage(null);
              }}
              className="flex-1"
            >
              Analyze Another Headshot
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
