// State name to abbreviation mapping
const STATE_ABBREVIATIONS: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY'
};

function normalizeState(state: string): string {
  // If it's already an abbreviation (2 letters), return as-is
  if (state.length === 2) {
    return state.toUpperCase();
  }
  // Otherwise, convert full name to abbreviation
  return STATE_ABBREVIATIONS[state] || state;
}

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
  if (!castingCall.gender || castingCall.gender === 'ANY' || castingCall.gender === userProfile.gender) {
    score += 20;
  }

  // Location match (25% weight)
  maxScore += 25;
  if (userProfile.state && castingCall.locationState) {
    // Normalize both states to abbreviations for comparison
    const userState = normalizeState(userProfile.state);
    const callState = normalizeState(castingCall.locationState);
    
    if (userState === callState) {
      score += 25;
    }
  }

  // Union status match (15% weight)
  maxScore += 15;
  if (castingCall.unionStatus === 'EITHER' || castingCall.unionStatus === 'ANY') {
    score += 15;
  } else if (castingCall.unionStatus === 'UNION' && userProfile.unionStatus === 'SAG_AFTRA') {
    score += 15;
  } else if (castingCall.unionStatus === 'NON_UNION' && userProfile.unionStatus === 'NON_UNION') {
    score += 15;
  }

  // Ethnicity match (10% weight)
  maxScore += 10;
  if (!castingCall.ethnicity || castingCall.ethnicity === 'ANY' || castingCall.ethnicity === userProfile.ethnicity) {
    score += 10;
  }

  // Return percentage
  return Math.round((score / maxScore) * 100);
}
