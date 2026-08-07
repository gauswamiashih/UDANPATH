import { Exam } from './examsData';

export interface EligibilityResult {
  status: 'eligible' | 'possibly' | 'ineligible' | 'more_info';
  reason: string;
}

export function evaluateEligibility(exam: Exam, profile: any): EligibilityResult {
  if (!profile || !profile.education) {
    return { 
      status: 'more_info', 
      reason: 'Please complete your onboarding profile to verify exact qualifications checks.' 
    };
  }

  // 1. Check Highest Degree Education Level matches minEducation requirement
  const userDegree = profile.education; // e.g. B.Tech, Graduate, 12th, 10th
  const examMinEdu = exam.minEducation; // e.g. Graduate, 12th Pass, B.Tech
  let degreeEligible = false;

  if (examMinEdu.toLowerCase().includes("graduate")) {
    if (userDegree === 'B.Tech' || userDegree === 'Graduate') {
      degreeEligible = true;
    }
  } else if (examMinEdu.toLowerCase().includes("12th")) {
    if (userDegree === 'B.Tech' || userDegree === 'Graduate' || userDegree.includes("12th")) {
      degreeEligible = true;
    }
  } else if (examMinEdu.toLowerCase().includes("b.tech")) {
    if (userDegree === 'B.Tech') {
      degreeEligible = true;
    }
  } else if (examMinEdu.toLowerCase().includes("10th")) {
    degreeEligible = true; // everyone has 10th if they made it here
  }

  if (!degreeEligible) {
    return { 
      status: 'ineligible', 
      reason: `Degree mismatch. This exam requires a minimum of '${examMinEdu}', but your profile states '${userDegree}'.` 
    };
  }

  // 2. Stream Match Checks
  const eligibleStr = exam.eligibleStreams || [];
  const isAllStreams = eligibleStr.some(s => s.toLowerCase().includes("all streams") || s.toLowerCase().includes("any stream"));
  if (!isAllStreams && eligibleStr.length > 0) {
    const userBranch = (profile.branch || "").toLowerCase();
    const matchesBranch = eligibleStr.some(stream => {
      const s = stream.toLowerCase();
      return s.includes(userBranch) || (s.includes("engineering") && userBranch.includes("engineering")) || (s.includes("science") && userBranch.includes("computer"));
    });

    if (!matchesBranch) {
      return { 
        status: 'possibly', 
        reason: `Specialization check recommended. This exam targets specific streams: '${eligibleStr.join(', ')}'. Your branch is '${profile.branch}'.` 
      };
    }
  }

  // 3. Age Restrictions check with Category Age Relaxation
  let userAge = 22; // default fallback
  if (profile.dob) {
    const birthYear = new Date(profile.dob).getFullYear();
    userAge = new Date().getFullYear() - birthYear;
  }
  const cat = profile.category || "GENERAL";
  const relaxation = exam.ageRelaxation && exam.ageRelaxation[cat] ? exam.ageRelaxation[cat] : 0;
  const finalMaxAge = exam.maxAgeGen + relaxation;

  if (userAge < exam.minAge) {
    return { 
      status: 'ineligible', 
      reason: `Age restriction. Minimum age to apply is ${exam.minAge}, but your profile states you are ${userAge} years old.` 
    };
  }
  if (userAge > finalMaxAge) {
    return { 
      status: 'ineligible', 
      reason: `Age restriction. The maximum age for ${cat} candidates is ${finalMaxAge} (including +${relaxation} yrs relaxation), but you are currently ${userAge} years old.` 
    };
  }

  return { 
    status: 'eligible', 
    reason: `Congratulations! Your age (${userAge} years) is within the limits (min ${exam.minAge}, max ${finalMaxAge} for ${cat} category), and your degree qualifications match.` 
  };
}
