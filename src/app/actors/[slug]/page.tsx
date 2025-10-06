import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, User, Download, Phone, Mail, Calendar, Car, Plane, DollarSign } from 'lucide-react';

export default async function PublicProfilePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  const profile = await prisma.profile.findUnique({
    where: { 
      profileSlug: slug,
      isPublic: true,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const heightFeet = profile.height ? Math.floor(profile.height / 12) : null;
  const heightInches = profile.height ? profile.height % 12 : null;

  const availabilityLabels: Record<string, string> = {
    'FULL_TIME': 'Full-time (available immediately)',
    'PART_TIME': 'Part-time (flexible schedule)',
    'WEEKENDS': 'Weekends only',
    'EVENINGS': 'Evenings only',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {profile.headshot ? (
                <img 
                  src={profile.headshot} 
                  alt={profile.user.name || 'Actor'} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-xl">
                  <User className="w-16 h-16 md:w-20 md:h-20 text-white/60" />
                </div>
              )}
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">{profile.user.name || 'Actor Profile'}</h1>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {profile.age && <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{profile.age} years old</Badge>}
                  {profile.gender && <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{profile.gender}</Badge>}
                  {profile.ethnicity && <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{profile.ethnicity}</Badge>}
                  {profile.unionStatus && <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{profile.unionStatus}</Badge>}
                </div>

                {profile.city && profile.state && (
                  <div className="flex items-center gap-2 justify-center md:justify-start text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.city}, {profile.state}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Contact & Resume Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {profile.phone && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a href={`tel:${profile.phone}`} className="font-semibold text-blue-600 hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {profile.user.email && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a href={`mailto:${profile.user.email}`} className="font-semibold text-green-600 hover:underline">
                      Contact Me
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {profile.resume && (
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Download className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Acting Resume</p>
                    <p className="text-sm text-gray-600">Download full resume</p>
                  </div>
                </div>
                <Button asChild>
                  <a href={profile.resume} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Physical Details */}
        <Card className="mb-6 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-600" />
              Physical Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {profile.playableAgeMin && profile.playableAgeMax && (
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-600 mb-1">Playing Age</p>
                  <p className="font-bold text-lg">{profile.playableAgeMin}-{profile.playableAgeMax}</p>
                </div>
              )}
              {heightFeet !== null && (
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-600 mb-1">Height</p>
                  <p className="font-bold text-lg">{heightFeet}'{heightInches}"</p>
                </div>
              )}
              {profile.weight && (
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-600 mb-1">Weight</p>
                  <p className="font-bold text-lg">{profile.weight} lbs</p>
                </div>
              )}
              {profile.hairColor && (
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-600 mb-1">Hair</p>
                  <p className="font-bold text-lg">{profile.hairColor}</p>
                </div>
              )}
              {profile.eyeColor && (
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-600 mb-1">Eyes</p>
                  <p className="font-bold text-lg">{profile.eyeColor}</p>
                </div>
              )}
              {profile.visibleTattoos && (
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-600 mb-1">Tattoos</p>
                  <p className="font-bold text-lg">Visible</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills & Interests */}
        {(profile.skills.length > 0 || profile.roleTypesInterested.length > 0) && (
          <Card className="mb-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-purple-600" />
                Skills & Interests
              </h2>
              
              {profile.skills.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Special Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="px-3 py-1 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.roleTypesInterested.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Interested Role Types</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.roleTypesInterested.map((role) => (
                      <Badge key={role} className="px-3 py-1 text-sm bg-purple-600">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Availability & Logistics */}
        {(profile.availability || profile.reliableTransportation || profile.travelWilling || profile.compensationPreference) && (
          <Card className="mb-6 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Availability & Preferences
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.availability && (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Availability</p>
                      <p className="font-semibold">{availabilityLabels[profile.availability] || profile.availability}</p>
                    </div>
                  </div>
                )}

                {profile.reliableTransportation && (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <Car className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Transportation</p>
                      <p className="font-semibold">Has reliable transportation</p>
                    </div>
                  </div>
                )}

                {profile.travelWilling && (
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <Plane className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Travel</p>
                      <p className="font-semibold">Willing to travel for roles</p>
                    </div>
                  </div>
                )}

                {profile.compensationPreference && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Compensation</p>
                      <p className="font-semibold">{profile.compensationPreference}</p>
                      {profile.compensationMin && (
                        <p className="text-sm text-gray-600 mt-1">Min: {profile.compensationMin}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photos Gallery */}
        {(profile.headshot || profile.fullBodyPhoto) && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Photo Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.headshot && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Headshot</p>
                    <img 
                      src={profile.headshot} 
                      alt="Headshot" 
                      className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow" 
                    />
                  </div>
                )}
                {profile.fullBodyPhoto && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Full Body</p>
                    <img 
                      src={profile.fullBodyPhoto} 
                      alt="Full Body" 
                      className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow" 
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Profile powered by Casting Companion</p>
        </div>
      </div>
    </div>
  );
}
