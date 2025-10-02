interface UserProfile {
  age?: number | null;
  playableAgeMin?: number | null;
  playableAgeMax?: number | null;
  gender?: string | null;
  state?: string | null;
  city?: string | null;
  unionStatus?: string | null;
  ethnicity?: string | null;
  roleTypesInterested?: string[];
}

interface CastingCall {
  ageMin: number;
  ageMax: number;
  genderReq: string;
  location: string;
  unionReq: string;
  ethnicityReq: string;
  roleType: string;
}

export function calculateMatchScore(
  profile: UserProfile,
  call: CastingCall
): number {
  let score = 0;
  let totalCriteria = 0;

  // Age matching (30 points)
  totalCriteria += 30;
  const userAge = profile.age || profile.playableAgeMin || 0;
  if (userAge >= call.ageMin && userAge <= call.ageMax) {
    score += 30;
  } else if (profile.playableAgeMin && profile.playableAgeMax) {
    // Check if playable age range overlaps with required range
    if (
      (profile.playableAgeMin <= call.ageMax && profile.playableAgeMax >= call.ageMin)
    ) {
      score += 20; // Partial match
    }
  }

  // Gender matching (20 points)
  totalCriteria += 20;
  if (call.genderReq === 'ANY' || call.genderReq === profile.gender) {
    score += 20;
  }

  // Location matching (25 points)
  totalCriteria += 25;
  if (profile.state && profile.city) {
    const callLocation = call.location.toLowerCase();
    const userState = profile.state.toLowerCase();
    const userCity = profile.city.toLowerCase();
    
    if (callLocation.includes(userCity) && callLocation.includes(userState)) {
      score += 25; // Exact city match
    } else if (callLocation.includes(userState)) {
      score += 15; // Same state
    }
  }

  // Union status matching (15 points)
  totalCriteria += 15;
  if (call.unionReq === 'EITHER' || call.unionReq === profile.unionStatus) {
    score += 15;
  }

  // Ethnicity matching (10 points)
  totalCriteria += 10;
  if (call.ethnicityReq === 'ANY' || call.ethnicityReq === profile.ethnicity) {
    score += 10;
  }

  // Role type interest (bonus, not required)
  // This doesn't count against total but adds if matched
  if (profile.roleTypesInterested?.includes(call.roleType)) {
    score += 5;
  }

  // Calculate percentage
  return Math.round((score / totalCriteria) * 100);
}

export function getMatchExplanation(
  profile: UserProfile,
  call: CastingCall
): string {
  const explanations: string[] = [];
  
  const userAge = profile.age || profile.playableAgeMin || 0;
  if (userAge >= call.ageMin && userAge <= call.ageMax) {
    explanations.push('Your age fits the requirement');
  } else if (profile.playableAgeMin && profile.playableAgeMax) {
    if (profile.playableAgeMin <= call.ageMax && profile.playableAgeMax >= call.ageMin) {
      explanations.push('Your playable age range overlaps with the requirement');
    }
  }

  if (call.genderReq === 'ANY' || call.genderReq === profile.gender) {
    explanations.push('Gender matches');
  }

  if (profile.state && profile.city) {
    const callLocation = call.location.toLowerCase();
    const userState = profile.state.toLowerCase();
    const userCity = profile.city.toLowerCase();
    
    if (callLocation.includes(userCity) && callLocation.includes(userState)) {
      explanations.push('Located in the same city');
    } else if (callLocation.includes(userState)) {
      explanations.push('Located in the same state');
    }
  }

  if (call.unionReq === 'EITHER' || call.unionReq === profile.unionStatus) {
    explanations.push('Union status matches');
  }

  if (call.ethnicityReq === 'ANY' || call.ethnicityReq === profile.ethnicity) {
    explanations.push('Ethnicity requirement met');
  }

  return explanations.join(', ');
}
