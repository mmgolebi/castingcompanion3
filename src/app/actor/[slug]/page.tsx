import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, Download } from 'lucide-react';

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const profile = await prisma.profile.findUnique({
    where: { profileSlug: slug },
    include: { user: true },
  });

  if (!profile || !profile.isPublic) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-32"></div>
          
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
              {profile.headshot ? (
                <img
                  src={profile.headshot}
                  alt={profile.user.name || 'Actor'}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover mx-auto md:mx-0"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl bg-gray-200 flex items-center justify-center mx-auto md:mx-0">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}

              <div className="flex-1 pt-4 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {profile.user.name}
                </h1>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {profile.gender && <Badge variant="secondary">{profile.gender}</Badge>}
                  {profile.age && <Badge variant="secondary">{profile.age} years old</Badge>}
                  {profile.unionStatus && <Badge variant="outline">{profile.unionStatus}</Badge>}
                </div>

                {(profile.city || profile.state) && (
                  <div className="flex items-center gap-2 text-gray-600 justify-center md:justify-start">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.city}, {profile.state}</span>
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <Card className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Physical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {profile.height && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Height:</span>
                      <span className="font-medium">{Math.floor(profile.height / 12)}'{profile.height % 12}"</span>
                    </div>
                  )}
                  {profile.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{profile.weight} lbs</span>
                    </div>
                  )}
                  {profile.hairColor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hair:</span>
                      <span className="font-medium">{profile.hairColor}</span>
                    </div>
                  )}
                  {profile.eyeColor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Eyes:</span>
                      <span className="font-medium">{profile.eyeColor}</span>
                    </div>
                  )}
                  {profile.ethnicity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ethnicity:</span>
                      <span className="font-medium">{profile.ethnicity}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {profile.playableAgeMin && profile.playableAgeMax && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Playable Age:</span>
                      <span className="font-medium">{profile.playableAgeMin}-{profile.playableAgeMax}</span>
                    </div>
                  )}
                  {profile.roleTypesInterested.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Role Types:</span>
                      <div className="flex flex-wrap gap-1">
                        {profile.roleTypesInterested.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {profile.skills.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Special Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.fullBodyPhoto && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Full Body</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={profile.fullBodyPhoto}
                    alt="Full body"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                </CardContent>
              </Card>
            )}

            {profile.resume && (
              <div className="mt-6 flex justify-center">
                <Button asChild size="lg">
                  <a href={profile.resume} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-gray-600 text-sm">
          Powered by Casting Companion
        </div>
      </div>
    </div>
  );
}
