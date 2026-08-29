export type MatchCategory = 'Dream' | 'Target' | 'Safe' | 'Alternative' | 'Stretch' | 'Best Fit' | 'Good Fit';

export interface MatchResult {
  status: MatchCategory;
  score: number;
  reason: string;
}

/**
 * Matches a student's profile against a college's requirements
 */
export function calculateCollegeMatch(college: any, profile: any): MatchResult {
  if (!profile || !college) {
    return { status: 'Alternative', score: 0, reason: 'Insufficient data' };
  }

  let score = 50;
  let reason = '';

  const class12Marks = Number(profile.class12Marks) || 0;
  const rank = Number(profile.rank) || 999999; // Fallback if rank isn't simulated
  
  // Basic marking simulation based on college Tier/Ranking
  // Assuming nirf_ranking exists
  const ranking = college.nirf_ranking || 100;
  
  if (ranking <= 20) {
    // Top tier (IITs, NITs)
    if (class12Marks < 75) {
       return { status: 'Stretch', score: 10, reason: 'Highly ambitious. Most top-tier institutes strictly require 75%+ in Class 12.' };
    }
    if (rank < 5000) {
       score = 90;
       reason = 'Your rank/marks put this top-tier institution well within reach as a Target.';
       return { status: 'Target', score, reason };
    }
    return { status: 'Dream', score: 40, reason: 'Highly ambitious. Requires top 1% rank in entrance exams.' };
  } 
  
  if (ranking <= 100) {
    // Mid tier
    if (class12Marks >= 80) {
       return { status: 'Target', score: 75, reason: 'Realistic target based on your strong academic profile.' };
    }
    return { status: 'Safe', score: 85, reason: 'Safe option. Your marks easily clear historical cutoffs.' };
  }

  // Fallback
  return { status: 'Safe', score: 90, reason: 'Safe option with higher probability of admission.' };
}

/**
 * Matches a student's profile against a career path
 */
export function calculateCareerMatch(career: any, profile: any): MatchResult {
  if (!profile || !career) {
    return { status: 'Alternative', score: 0, reason: 'Insufficient data' };
  }

  let score = 30;
  let reasons: string[] = [];

  const stream = (profile.streamName || profile.streamId || '').toLowerCase();
  const interests = profile.interests || [];
  const careerCat = (career.category || '').toLowerCase();
  
  if (careerCat === 'it' || careerCat === 'engineering') {
    if (stream.includes('science')) {
      score += 30;
      reasons.push('Science background aligns perfectly.');
    }
    if (interests.includes('Coding') || interests.includes('Technology')) {
      score += 20;
      reasons.push('Strong interest match.');
    }
  }

  if (careerCat === 'government' || careerCat === 'management') {
    score += 40;
    reasons.push('Open to all streams with structured preparation.');
  }

  const finalScore = Math.min(100, score);
  
  if (finalScore >= 80) {
    return { status: 'Best Fit', score: finalScore, reason: reasons.join(' ') };
  } else if (finalScore >= 60) {
    return { status: 'Good Fit', score: finalScore, reason: reasons.join(' ') };
  } else {
    return { status: 'Alternative', score: finalScore, reason: 'Different but realistic with additional effort.' };
  }
}

/**
 * Basic What-If Simulator logic
 */
export function simulateWhatIfScenario(scenario: string, currentProfile: any): any {
  // Returns a modified profile object based on the scenario
  const simulatedProfile = { ...currentProfile };
  const s = scenario.toLowerCase();

  if (s.includes('fail jee') || s.includes("don't clear jee")) {
    simulatedProfile.rank = 999999;
    simulatedProfile.goalName = 'Private Engineering or B.Sc';
  } else if (s.includes('score 85%')) {
    simulatedProfile.class12Marks = 85;
  } else if (s.includes('pcb')) {
    simulatedProfile.scienceCombo = 'PCB';
    simulatedProfile.streamName = 'Science (Medical)';
  } else if (s.includes('budget is low') || s.includes('2 lakh')) {
    simulatedProfile.budget = 'Low';
    simulatedProfile.collegePreference = 'Govt Only';
  }

  return simulatedProfile;
}
