'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadButton } from '@/components/upload-button';
import { Camera, CheckCircle, AlertCircle, Lightbulb, ArrowLeft, Upload, Sparkles } from 'lucide-react';
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
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAnalyze = async (imageUrl: string) => {
    setAnalyzing(true);
    setCurrentImage(imageUrl);
    setAnalysis(null);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const res = await fetch('/api/headshot-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        const data = await res.json();
        // Small delay for smooth transition
        setTimeout(() => {
          setAnalysis(data);
        }, 500);
      } else {
        alert('Failed to analyze headshot. Please try again.');
        setAnalyzing(false);
        setUploadProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Error:', error);
      alert('An error occurred during analysis.');
      setAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              <Camera className="h-10 w-10 text-purple-600" />
              AI Headshot Analyzer
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Get professional feedback powered by AI in seconds
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard')} size="lg">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
        </div>

        {/* Upload Section */}
        {!analysis && !analyzing && (
          <Card className="border-2 border-dashed border-purple-200 bg-white/50 backdrop-blur shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Upload Your Headshot</CardTitle>
              <CardDescription className="text-base">
                Our AI will analyze lighting, composition, expression, and professionalism
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative group">
                {/* Decorative gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                
                {/* Upload area */}
                <div className="relative flex flex-col items-center justify-center py-16 px-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                    <Camera className="relative h-20 w-20 text-purple-500" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">Drop your headshot here</h3>
                  <p className="text-gray-500 mb-6 text-center max-w-md">
                    or click to browse your files
                  </p>

                  {/* Styled Upload Button */}
                  <div className="ut-button-container">
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
                      appearance={{
                        button: "bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl ut-ready:bg-gradient-to-r ut-ready:from-purple-600 ut-ready:to-blue-600 ut-uploading:bg-purple-400 ut-uploading:cursor-not-allowed",
                        container: "w-auto",
                        allowedContent: "hidden"
                      }}
                    />
                  </div>

                  <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>High resolution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Well-lit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Front-facing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 rounded-lg bg-purple-50">
                  <Sparkles className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">AI-Powered</h4>
                  <p className="text-xs text-gray-600 mt-1">Advanced analysis technology</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <Camera className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Professional Tips</h4>
                  <p className="text-xs text-gray-600 mt-1">Industry-standard feedback</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Instant Results</h4>
                  <p className="text-xs text-gray-600 mt-1">Analysis in 10-15 seconds</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyzing State */}
        {analyzing && !analysis && (
          <Card className="shadow-2xl border-purple-200">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                {/* Image Preview */}
                {currentImage && (
                  <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <img
                      src={currentImage}
                      alt="Analyzing"
                      className="relative w-40 h-40 object-cover rounded-full border-4 border-white shadow-xl"
                    />
                  </div>
                )}

                {/* Animated icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <Sparkles className="relative h-16 w-16 text-purple-600 animate-spin" style={{ animationDuration: '3s' }} />
                </div>

                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Analyzing Your Headshot...
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Our AI is examining lighting, composition, expression, and more
                </p>

                {/* Progress bar */}
                <div className="w-full">
                  <Progress value={uploadProgress} className="h-3 mb-2" />
                  <p className="text-sm text-gray-500 text-center">{uploadProgress}% Complete</p>
                </div>

                {/* Progress steps */}
                <div className="mt-8 space-y-3 w-full">
                  <div className={`flex items-center gap-3 transition-opacity ${uploadProgress > 0 ? 'opacity-100' : 'opacity-30'}`}>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Image uploaded</span>
                  </div>
                  <div className={`flex items-center gap-3 transition-opacity ${uploadProgress > 30 ? 'opacity-100' : 'opacity-30'}`}>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Analyzing lighting quality</span>
                  </div>
                  <div className={`flex items-center gap-3 transition-opacity ${uploadProgress > 60 ? 'opacity-100' : 'opacity-30'}`}>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Evaluating composition</span>
                  </div>
                  <div className={`flex items-center gap-3 transition-opacity ${uploadProgress > 90 ? 'opacity-100' : 'opacity-30'}`}>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Generating professional feedback</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Overall Score - Hero Card */}
            <Card className="border-2 bg-gradient-to-br from-white to-purple-50 shadow-2xl overflow-hidden">
              <CardContent className="pt-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Image */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <img
                      src={analysis.imageUrl}
                      alt="Analyzed headshot"
                      className="relative w-64 h-64 object-cover rounded-2xl shadow-2xl border-4 border-white"
                    />
                  </div>

                  {/* Score */}
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Overall Score</p>
                    <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
                      <div className={`text-7xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {getScoreLabel(analysis.overallScore)}
                        </div>
                        <div className="text-gray-500">out of 100</div>
                      </div>
                    </div>
                    
                    <Progress value={analysis.overallScore} className="h-4 mb-4" />
                    
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {analysis.overallScore >= 80 && "🎉 Excellent headshot! This is industry-ready and will make a strong impression."}
                      {analysis.overallScore >= 60 && analysis.overallScore < 80 && "👍 Good headshot with room for improvement. Follow the suggestions below to make it great!"}
                      {analysis.overallScore < 60 && "💡 Consider getting new headshots with the improvements below to maximize your opportunities."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Detailed Breakdown
                </CardTitle>
                <CardDescription>See how you scored in each category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Lighting', score: analysis.lightingScore, icon: '💡' },
                  { label: 'Composition', score: analysis.compositionScore, icon: '🎨' },
                  { label: 'Expression', score: analysis.expressionScore, icon: '😊' },
                  { label: 'Professionalism', score: analysis.professionalScore, icon: '👔' },
                  { label: 'Background', score: analysis.backgroundScore, icon: '🖼️' },
                ].map((category) => (
                  <div key={category.label} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-semibold">{category.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreColor(category.score)}`}>
                          {category.score}
                        </span>
                        <span className="text-sm text-gray-500">/100</span>
                      </div>
                    </div>
                    <Progress value={category.score} className="h-3" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Two Column Layout for Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    What's Working Well
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card className="border-yellow-200 bg-yellow-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <Lightbulb className="h-5 w-5" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Feedback */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-600" />
                  Professional Analysis
                </CardTitle>
                <CardDescription>Comprehensive feedback from our AI expert</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {analysis.detailedFeedback}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => {
                  setAnalysis(null);
                  setCurrentImage(null);
                  setAnalyzing(false);
                }}
                size="lg"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Upload className="h-5 w-5 mr-2" />
                Analyze Another Headshot
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
