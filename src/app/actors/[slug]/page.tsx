import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, User } from 'lucide-react';

export default async function PublicProfilePage({ params }: { params: { slug: string } }) {
  const profile = await prisma.profile.findUnique({
    where: { 
      profileSlug: params.slug,
      isPublic: true,
    },
    include: {
      user: {
        select: {
          name: true,
          email: false,
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const heightFeet = profile.height ? Math.floor(profile.height / 12) : null;
  const heightInches = profile.height ? profile.height % 12 : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {profile.headshot ? (
                <img 
                  src={profile.headshot} 
                  alt={profile.user.name || 'Actor'} 
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{profile.user.name || 'Actor Profile'}</h1>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.age && <Badge variant="secondary">{profile.age} years old</Badge>}
                  {profile.gender && <Badge variant="secondary">{profile.gender}</Badge>}
                  {profile.ethnicity && <Badge variant="secondary">{profile.ethnicity}</Badge>}
                  {profile.unionStatus && <Badge variant="secondary">{profile.unionStatus}</Badge>}
                </div>

                {profile.city && profile.state && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.city}, {profile.state}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Physical Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.playableAgeMin && profile.playableAgeMax && (
                <div>
                  <p className="text-sm text-gray-600">Playing Age</p>
                  <p className="font-semibold">{profile.playableAgeMin}-{profile.playableAgeMax}</p>
                </div>
              )}
              {heightFeet && (
                <div>
                  <p className="text-sm text-gray-600">Height</p>
                  <p className="font-semibold">{heightFeet}'{heightInches}"</p>
                </div>
              )}
              {profile.weight && (
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-semibold">{profile.weight} lbs</p>
                </div>
              )}
              {profile.hairColor && (
                <div>
                  <p className="text-sm text-gray-600">Hair</p>
                  <p className="font-semibold">{profile.hairColor}</p>
                </div>
              )}
              {profile.eyeColor && (
                <div>
                  <p className="text-sm text-gray-600">Eyes</p>
                  <p className="font-semibold">{profile.eyeColor}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills & Interests */}
        {(profile.skills.length > 0 || profile.roleTypesInterested.length > 0) && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Skills & Interests
              </h2>
              
              {profile.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Special Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.roleTypesInterested.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Role Types</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.roleTypesInterested.map((role) => (
                      <Badge key={role}>{role}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Photos */}
        {(profile.headshot || profile.fullBodyPhoto) && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.headshot && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Headshot</p>
                    <img src={profile.headshot} alt="Headshot" className="w-full rounded-lg" />
                  </div>
                )}
                {profile.fullBodyPhoto && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Full Body</p>
                    <img src={profile.fullBodyPhoto} alt="Full Body" className="w-full rounded-lg" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
