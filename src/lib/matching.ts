import { Profile, CastingCall } from '@prisma/client';

export function computeMatch(profile: Profile, call: CastingCall): number {
  let score = 0;

  // Age compatibility (30 points)
  if (profile.age && call.ageMin && call.ageMax) {
    const withinRange = profile.age >= call.ageMin && profile.age <= call.ageMax;
    score += withinRange ? 30 : 0;
  } else {
    // Partial credit if data missing
    score += 15;
  }

  // Gender match (25 points)
  if (call.genderReq === 'ANY' || profile.gender === call.genderReq) {
    score += 25;
  }

  // Union status (20 points)
  if (call.unionReq === 'ANY' || call.unionReq === 'EITHER') {
    score += 20;
  } else if (profile.unionStatus === call.unionReq) {
    score += 20;
  }

  // Ethnicity match (15 points)
  if (call.ethnicityReq === 'ANY' || profile.ethnicity === call.ethnicityReq) {
    score += 15;
  }

  // Role interest (10 points)
  if (profile.roleInterests && profile.roleInterests.includes(call.roleType)) {
    score += 10;
  }

  return score;
}

export function getMatchTier(score: number): {
  label: string;
  color: string;
  variant: 'default' | 'secondary' | 'success' | 'warning';
} {
  if (score >= 85) {
    return { label: 'Great match', color: 'text-green-600', variant: 'success' };
  }
  if (score >= 70) {
    return { label: 'Good', color: 'text-amber-600', variant: 'warning' };
  }
  return { label: 'Fair', color: 'text-gray-600', variant: 'secondary' };
}
