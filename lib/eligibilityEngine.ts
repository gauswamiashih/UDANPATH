import { Exam } from './examsData';

export type EligibilityStatus = 'Eligible' | 'Not Eligible' | 'Eligibility Unclear';

export interface EligibilityResult {
  status: EligibilityStatus;
  reason: string;
}

export interface AdvancedMatchingResult {
  matchScore: number;
  status: EligibilityStatus;
  reason: string;
  isCrossDisciplinary: boolean;
}

/**
 * Normalizes strings for robust matching
 */
function normalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Advanced Eligibility Engine evaluating new profile fields (Marks, Combos, Stream)
 */
export function evaluateStrictEligibility(exam: Exam, profile: any): EligibilityResult {
  if (!profile) {
    return { status: 'Eligibility Unclear', reason: 'Profile data missing.' };
  }

  const userStream = normalize(profile.streamName || profile.branch || profile.streamId || '');
  const userScienceCombo = profile.scienceCombo; // PCM, PCB, PCMB
  const class10 = Number(profile.class10Marks) || 0;
  const class12 = Number(profile.class12Marks) || Number(profile.cgpa) || 0;
  const userDegree = normalize(profile.degreeName || profile.degree || '');
  const userEducation = normalize(profile.education || profile.educationLevelName || '');
  const isSchool = userEducation.includes('12') || userEducation.includes('10') || userEducation.includes('school');

  // 1. Age Checking
  let userAge = 22;
  if (profile.dob) {
    const birthYear = new Date(profile.dob).getFullYear();
    userAge = new Date().getFullYear() - birthYear;
  }
  const minAge = exam.minimum_age || 17;
  if (userAge < minAge) {
    return { status: 'Not Eligible', reason: `You are ${userAge} years old, but minimum age is ${minAge}. Verify latest official notification.` };
  }

  // Age relaxation
  const category = normalize(profile.category || '');
  let relaxation = 0;
  if (category.includes('obc')) relaxation = 3;
  if (category.includes('sc') || category.includes('st')) relaxation = 5;
  const maxAgeBase = exam.maximum_age || 30;
  const maxAge = maxAgeBase + relaxation;
  if (userAge > maxAge) {
    return { status: 'Not Eligible', reason: `You are ${userAge} years old. Maximum age for your category is ${maxAge}. Verify latest official notification.` };
  }

  // 2. Class 12 specific Engineering / Medical exams
  const examName = normalize(exam.name);
  const shortName = normalize(exam.short_name);

  // JEE / Engineering logic
  if (examName.includes('joint entrance') || shortName.includes('jee') || shortName.includes('bitsat')) {
    if (!userStream.includes('science')) {
      return { status: 'Not Eligible', reason: `Requires Science stream with Physics, Chemistry, and Mathematics. Verify latest official notification.` };
    }
    if (userScienceCombo && userScienceCombo === 'PCB') {
      return { status: 'Not Eligible', reason: `Requires Mathematics. Your profile indicates PCB. Verify latest official notification.` };
    }
    if (class12 > 0 && class12 < 75) {
      return { status: 'Eligibility Unclear', reason: `You have ${class12}%, but JEE Advanced/NITs typically require 75% in Class 12. Verify latest official notification.` };
    }
    return { status: 'Eligible', reason: `Science PCM background matches engineering requirements. Verify latest official notification.` };
  }

  // NEET / Medical logic
  if (shortName.includes('neet') || examName.includes('medical')) {
    if (!userStream.includes('science')) {
      return { status: 'Not Eligible', reason: `Requires Science stream with Biology. Verify latest official notification.` };
    }
    if (userScienceCombo && userScienceCombo === 'PCM') {
      return { status: 'Not Eligible', reason: `Requires Biology. Your profile indicates PCM. Verify latest official notification.` };
    }
    if (class12 > 0 && class12 < 50) {
      return { status: 'Not Eligible', reason: `Requires minimum 50% in Class 12 Physics, Chemistry, Biology. Verify latest official notification.` };
    }
    return { status: 'Eligible', reason: `Science PCB background matches medical requirements. Verify latest official notification.` };
  }
  
  // CUET / General UG
  if (shortName.includes('cuet')) {
    if (class12 > 0 && class12 < 50) {
       return { status: 'Eligibility Unclear', reason: `CUET requires minimum passing marks, but some central universities demand 50%. Verify latest official notification.` };
    }
    return { status: 'Eligible', reason: `Open to all Class 12 pass-outs regardless of stream. Verify latest official notification.` };
  }

  // NDA / Defence
  if (shortName.includes('nda')) {
    if (userAge > 19) {
      return { status: 'Not Eligible', reason: `NDA age limit is 19.5 years. You are ${userAge}. Verify latest official notification.` };
    }
    if (!userStream.includes('science') && (profile.goal?.toLowerCase().includes('air force') || profile.goal?.toLowerCase().includes('navy'))) {
      return { status: 'Not Eligible', reason: `Air Force/Navy wings require Science PCM. Army wing accepts all streams. Verify latest official notification.` };
    }
    return { status: 'Eligible', reason: `Age and qualification criteria met for NDA. Verify latest official notification.` };
  }

  // CAT / MBA / Post-grad / GATE
  if (shortName.includes('cat') || shortName.includes('xat') || shortName.includes('gate') || shortName.includes('upsc') || shortName.includes('ssc')) {
    if (isSchool) {
       return { status: 'Not Eligible', reason: `Requires a Bachelor's degree. You are currently at school level. Verify latest official notification.` };
    }
    if (shortName.includes('gate') && !userStream.includes('engineer') && !userDegree.includes('tech') && !userDegree.includes('eng')) {
      return { status: 'Eligibility Unclear', reason: `GATE primarily requires Engineering/Science degree backgrounds. Verify latest official notification.` };
    }
    return { status: 'Eligible', reason: `Graduation requirement met. Verify latest official notification.` };
  }

  // Fallback for custom DB exams
  const anyDegreeAllowed = exam.accepts_all_degrees || (exam.degrees && exam.degrees.some(d => d.toLowerCase().includes('graduat')));
  if (anyDegreeAllowed) {
    if (isSchool) {
       return { status: 'Not Eligible', reason: `This exam requires graduation. Verify latest official notification.` };
    }
    return { status: 'Eligible', reason: `Open to all graduates. Verify latest official notification.` };
  }

  return { status: 'Eligibility Unclear', reason: `Insufficient data to firmly determine eligibility. Verify latest official notification.` };
}

/**
 * Calculates a personalized match score and flags cross-disciplinary recommendations.
 */
export function calculateAdvancedMatchScore(exam: Exam, profile: any): AdvancedMatchingResult {
  const eligibility = evaluateStrictEligibility(exam, profile);
  
  if (eligibility.status === 'Not Eligible') {
    return {
      matchScore: 0,
      status: eligibility.status,
      reason: eligibility.reason,
      isCrossDisciplinary: false
    };
  }

  let score = 50; // Base score for being eligible
  let isCross = false;

  const userStream = normalize(profile.streamName || profile.branch || profile.streamId || '');
  const userDegree = normalize(profile.degreeName || profile.degree || '');
  const shortName = normalize(exam.short_name);
  const examCat = normalize(exam.category_name || '');
  const goal = normalize(profile.goal || profile.goalName || '');
  const interests = profile.interestNames ? profile.interestNames.map(normalize) : [];

  // Keyword matching for personalized boost based on goal and interests
  const userKeywords = [
    ...goal.split(' '),
    ...userStream.split(' '),
    ...userDegree.split(' '),
    ...interests.flatMap((i: string) => i.split(' '))
  ].filter(w => w.length > 3); // Filter small words

  const examText = `${normalize(exam.name)} ${normalize(exam.organization)} ${examCat} ${shortName}`;
  
  let keywordMatches = 0;
  for (const keyword of userKeywords) {
    if (examText.includes(keyword)) {
      keywordMatches++;
    }
  }
  
  if (keywordMatches > 0) {
    score += keywordMatches * 15;
    eligibility.reason = `Strong match with your profile/goal (${keywordMatches} matching keywords).`;
  }

  // Engineering / Medical affinity
  if ((shortName.includes('jee') || shortName.includes('gate') || shortName.includes('isro') || shortName.includes('nic') || shortName.includes('drdo')) && (userStream.includes('science') || userStream.includes('engineer') || userStream.includes('tech'))) {
    score += 40;
  }
  if (shortName.includes('neet') && userStream.includes('science')) {
    score += 40;
  }
  
  // Cross-Disciplinary logic (Rule 13: don't force students into one career)
  if (userStream.includes('science') || userStream.includes('engineer') || userDegree.includes('tech')) {
    // Suggesting Management/Law/Design/Gov to Science/Eng students
    if (shortName.includes('clat') || shortName.includes('cat') || shortName.includes('nid') || shortName.includes('nift') || shortName.includes('upsc') || shortName.includes('ssc')) {
      score += 10; // Bump score slightly so it appears in recommendations
      isCross = true;
      if (keywordMatches === 0) {
        eligibility.reason = `As an analytical student, you also have a strong foundation for ${shortName.toUpperCase()}.`;
      }
    }
  }

  if (userStream.includes('commerce') || userStream.includes('arts')) {
    // Boost Law, Management, Gov exams
    if (shortName.includes('clat') || shortName.includes('cat') || shortName.includes('upsc') || shortName.includes('ssc')) {
      score += 40;
    }
    if (shortName.includes('bca') || shortName.includes('design')) {
      isCross = true;
      score += 20;
    }
  }

  // Budget mapping logic
  if (profile.collegePreference === 'Government Only' && exam.organization?.toLowerCase().includes('private')) {
     score -= 30; // Penalize private if govt only
  }

  if (profile.budget === 'Low' && shortName.includes('bitsat')) {
     score -= 20; // BITS is expensive
     eligibility.reason += ' (Note: This is a premium private institution, which may exceed low budget preferences).';
  }

  return {
    matchScore: Math.min(99, score),
    status: eligibility.status,
    reason: eligibility.reason,
    isCrossDisciplinary: isCross
  };
}
