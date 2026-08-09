import { NextResponse } from 'next/server';
import { getExamsFromDb } from '@/lib/dbService';
import { calculateMatchScore } from '@/lib/eligibility';

export async function GET() {
  const exams = await getExamsFromDb();
  
  const mockProfile = {
    degree: 'B.Tech',
    branch: 'Computer Engineering',
    category: 'GENERAL',
    age: 22,
    interests: ['Engineering', 'Technology']
  };

  const results = exams.map(exam => {
    const score = calculateMatchScore(exam, mockProfile);
    return {
      title: exam.title,
      level: score.matchLevel,
      score: score.matchScore,
      reason: score.matchingReason,
      // Debug info:
      examDegrees: exam.degrees,
      examBranches: exam.eligible_branches,
      examMinAge: exam.minimum_age
    };
  });

  return NextResponse.json({
    totalExams: exams.length,
    positiveMatches: results.filter(r => r.level !== 'NOT_ELIGIBLE').length,
    results
  });
}
