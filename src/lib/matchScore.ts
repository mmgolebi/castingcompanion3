export function calculateMatchScore(userProfile: any, castingCall: any): number {
  let score = 0;
  let maxScore = 0;

  // Age range match (30% weight)
  maxScore += 30;
  if (castingCall.ageRangeMin && castingCall.ageRangeMax && userProfile.playableAgeMin && userProfile.playableAgeMax) {
    const userMin = userProfile.playableAgeMin;
    const userMax = userProfile.playableAgeMax;
    const callMin = castingCall.ageRangeMin;
    const callMax = castingCall.ageRangeMax;

    // Check if there's any overlap between user's playable age and call's required age
    if (userMin <= callMax && userMax >= callMin) {
      score += 30;
    }
  }

  // Gender match (20% weight)
  maxScore += 20;
  if (!castingCall.gender || castingCall.gender === userProfile.gender) {
    score += 20;
  }

  // Location match (25% weight)
  maxScore += 25;
  if (userProfile.state && castingCall.location) {
    if (castingCall.location.toLowerCase().includes(userProfile.state.toLowerCase()) ||
        castingCall.location.toLowerCase().includes(userProfile.city?.toLowerCase() || '')) {
      score += 25;
    }
  }

  // Union status match (15% weight)
  maxScore += 15;
  if (castingCall.unionStatus === 'EITHER') {
    score += 15;
  } else if (castingCall.unionStatus === 'UNION' && userProfile.unionStatus === 'SAG_AFTRA') {
    score += 15;
  } else if (castingCall.unionStatus === 'NON_UNION' && userProfile.unionStatus === 'NON_UNION') {
    score += 15;
  }

  // Ethnicity match (10% weight)
  maxScore += 10;
  if (!castingCall.ethnicity || castingCall.ethnicity === userProfile.ethnicity) {
    score += 10;
  }

  // Return percentage
  return Math.round((score / maxScore) * 100);
}
