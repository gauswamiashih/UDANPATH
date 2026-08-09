import { Exam } from './examsData';

export type MatchLevel = 
  | 'EXACT_MATCH' 
  | 'STRONG_MATCH' 
  | 'RELATED_MATCH' 
  | 'GENERAL_GRADUATE_MATCH' 
  | 'POSSIBLE_MATCH' 
  | 'NOT_ELIGIBLE';

export interface EligibilityResult {
  status: MatchLevel;
  reason: string;
}

export interface MatchingResult {
  matchScore: number;
  matchLevel: MatchLevel;
  matchingReason: string;
}

/**
 * Normalizes strings for robust matching
 */
function normalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a string exists in an array of strings (normalized)
 */
function includesNormalized(arr: string[] | undefined | null, target: string): boolean {
  if (!arr || !Array.isArray(arr)) return false;
  const normTarget = normalize(target);
  if (!normTarget) return false;
  return arr.some(item => normalize(item) === normTarget || normalize(item).includes(normTarget));
}

/**
 * Check if the user is eligible for age
 */
function checkAgeEligibility(exam: Exam, userAge: number, category: string): { eligible: boolean; reason?: string } {
  const minAge = exam.minimum_age || 18;
  const maxAgeBase = exam.maximum_age || 32;
  
  // Calculate relaxation
  let relaxation = 0;
  if (exam.age_relaxation && typeof exam.age_relaxation === 'object') {
    relaxation = Number(exam.age_relaxation[category]) || 0;
  }
  
  const finalMaxAge = maxAgeBase + relaxation;

  if (userAge < minAge) {
    return { eligible: false, reason: `Minimum age to apply is ${minAge}, but you are ${userAge}.` };
  }
  
  if (userAge > finalMaxAge) {
    return { eligible: false, reason: `Maximum age for ${category} is ${finalMaxAge} (including +${relaxation} yrs relaxation), but you are ${userAge}.` };
  }

  return { eligible: true };
}

/**
 * Core Evaluation Logic for 6-tier matching
 */
export function evaluateEligibility(exam: Exam, profile: any): EligibilityResult {
  if (!profile || !profile.degree) {
    return { 
      status: 'POSSIBLE_MATCH', 
      reason: 'Please complete your education profile to verify qualifications.' 
    };
  }

  const userDegree = profile.degree; // e.g. B.Tech, Graduate, 12th
  const userBranch = profile.branch; // e.g. Computer Engineering
  const userCategory = profile.category || 'GENERAL';
  
  // 1. Calculate Age
  let userAge = 22; // default fallback
  if (profile.age) {
    userAge = Number(profile.age);
  } else if (profile.date_of_birth || profile.dob) {
    const dob = profile.date_of_birth || profile.dob;
    const birthYear = new Date(dob).getFullYear();
    userAge = new Date().getFullYear() - birthYear;
  }

  // 2. Strict Ineligibility Checks (Age)
  const ageCheck = checkAgeEligibility(exam, userAge, userCategory);
  if (!ageCheck.eligible) {
    return { status: 'NOT_ELIGIBLE', reason: ageCheck.reason || 'Age restriction.' };
  }

  // 3. Demographics Check (Category, State)
  if (exam.eligible_categories && exam.eligible_categories.length > 0) {
    if (!exam.eligible_categories.includes('All') && !includesNormalized(exam.eligible_categories, userCategory)) {
      return { status: 'NOT_ELIGIBLE', reason: `This exam is restricted to specific categories: ${exam.eligible_categories.join(', ')}.` };
    }
  }

  // 4. Education Matching Hierarchy
  
  const examDegrees = exam.degrees || [];
  const examBranches = exam.eligible_branches || [];
  const anyStreamAllowed = includesNormalized(examBranches, 'Any Stream') || includesNormalized(examBranches, 'All Streams');
  
  // Check exact branch match (EXACT_MATCH)
  if (userBranch && examBranches.length > 0 && !anyStreamAllowed) {
    if (includesNormalized(examBranches, userBranch)) {
      return { 
        status: 'EXACT_MATCH', 
        reason: `Your specific branch (${userBranch}) is explicitly accepted.` 
      };
    }
  }

  // Check strong degree match (STRONG_MATCH)
  // e.g., user is B.Tech and exam accepts B.Tech
  if (userDegree && examDegrees.length > 0) {
    if (includesNormalized(examDegrees, userDegree)) {
      // If it accepts the degree, and it accepts Any Branch or the branch is relevant
      if (anyStreamAllowed) {
        return {
          status: 'STRONG_MATCH',
          reason: `Your degree (${userDegree}) is perfectly suited for this exam.`
        };
      }
      
      // If it requires specific branches but we didn't exactly match earlier, we might be a RELATED_MATCH
      // e.g. user is 'Computer Engineering', exam asks for 'Computer Science'
      if (userBranch && examBranches.length > 0) {
        const normUserBranch = normalize(userBranch);
        const related = examBranches.some(b => {
            const nb = normalize(b);
            // Simple heuristic for related tech fields
            if (nb.includes('computer') && normUserBranch.includes('software')) return true;
            if (nb.includes('computer') && normUserBranch.includes('it')) return true;
            if (nb.includes('science') && normUserBranch.includes('computer')) return true;
            return false;
        });

        if (related) {
           return {
             status: 'RELATED_MATCH',
             reason: `Your technical background (${userBranch}) is closely related to the required streams.`
           };
        }
      }
    }
  }

  // Check general graduation (GENERAL_GRADUATE_MATCH)
  if (userDegree && (normalize(userDegree).includes('graduate') || normalize(userDegree).includes('btech') || normalize(userDegree).includes('be') || normalize(userDegree).includes('bsc') || normalize(userDegree).includes('ba') || normalize(userDegree).includes('bcom') || normalize(userDegree).includes('bba') || normalize(userDegree).includes('bca'))) {
      if (includesNormalized(examDegrees, 'Graduate') || includesNormalized(examDegrees, 'Any Graduation') || includesNormalized(examDegrees, 'Degree')) {
          return {
            status: 'GENERAL_GRADUATE_MATCH',
            reason: `This exam is open to candidates with any recognized graduation degree.`
          };
      }
  }

  // Check school level
  if (userDegree && normalize(userDegree).includes('12th') && includesNormalized(exam.qualification_levels, '12th')) {
     return {
         status: 'STRONG_MATCH',
         reason: `Your 12th standard qualification meets the basic requirements.`
     };
  }

  if (userDegree && normalize(userDegree).includes('10th') && includesNormalized(exam.qualification_levels, '10th')) {
     return {
         status: 'STRONG_MATCH',
         reason: `Your 10th standard qualification meets the basic requirements.`
     };
  }

  // If no positive matches hit, but they weren't explicitly rejected by age/category
  // It might be a degree mismatch
  return { 
    status: 'NOT_ELIGIBLE', 
    reason: `Your qualification (${userDegree} - ${userBranch || 'N/A'}) does not appear to meet the specific requirements of this exam.` 
  };
}

/**
 * Weighted Recommendation Scoring Algorithm
 */
export function calculateMatchScore(exam: Exam, profile: any): MatchingResult {
  const evaluation = evaluateEligibility(exam, profile);
  let matchScore = 0;
  
  if (evaluation.status === 'NOT_ELIGIBLE') {
    return {
      matchScore: 0,
      matchLevel: 'NOT_ELIGIBLE',
      matchingReason: evaluation.reason
    };
  }

  // 1. Education & Branch Weight (Max 50%)
  if (evaluation.status === 'EXACT_MATCH') matchScore += 50;
  else if (evaluation.status === 'STRONG_MATCH') matchScore += 40;
  else if (evaluation.status === 'RELATED_MATCH') matchScore += 30;
  else if (evaluation.status === 'GENERAL_GRADUATE_MATCH') matchScore += 25;
  else if (evaluation.status === 'POSSIBLE_MATCH') matchScore += 10;

  // 2. Age Fit (Max 15%)
  // Closer to the median age range gives a slight boost, but generally full points if eligible
  matchScore += 15; 

  // 3. Career Interest (Max 15%)
  const userInterests: string[] = profile.interests || profile.target_exam_categories || [];
  const userGoal: string = normalize(profile.career_goal || profile.goal || profile.dreamJob || '');
  let interestMatch = false;

  if (userInterests.length > 0) {
      interestMatch = userInterests.some(interest => {
          const normInt = normalize(interest);
          return normalize(exam.category_name || exam.category_id || '').includes(normInt) || 
                 normalize(exam.category_slug || '').includes(normInt);
      });
  }
  
  if (interestMatch) {
      matchScore += 15;
  }

  // 4. Goal Keyword Matching (Max 10%)
  if (userGoal) {
      if (userGoal.includes('ias') || userGoal.includes('civil') || userGoal.includes('ips') && exam.short_name === 'UPSC_CSE') {
          matchScore += 10;
      } else if ((userGoal.includes('engineer') || userGoal.includes('scientist')) && (exam.category_id?.includes('eng') || exam.short_name === 'GATE_CS')) {
          matchScore += 10;
      } else if (userGoal.includes('bank') && exam.category_id?.includes('bnk')) {
          matchScore += 10;
      } else if (userGoal.includes('defence') && exam.category_id?.includes('def')) {
          matchScore += 10;
      }
  }

  // 5. State / Category Relevance (Max 10%)
  // For state exams matching user state
  const userState = normalize(profile.state);
  if (userState && exam.eligible_states && exam.eligible_states.length > 0) {
      if (!includesNormalized(exam.eligible_states, 'All India') && includesNormalized(exam.eligible_states, userState)) {
          matchScore += 10; // High relevance for home state exam
      } else if (includesNormalized(exam.eligible_states, 'All India')) {
          matchScore += 5; // Standard relevance
      }
  } else {
      matchScore += 5; // Default if state not specified
  }

  // Normalize max score
  matchScore = Math.max(0, Math.min(99, matchScore)); // Cap at 99, only 100 for perfect absolute match

  if (evaluation.status === 'EXACT_MATCH' && matchScore > 90) matchScore = 98; // Make it look realistic

  return {
    matchScore,
    matchLevel: evaluation.status,
    matchingReason: evaluation.reason
  };
}
