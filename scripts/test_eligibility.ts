import { calculateMatchScore } from '../lib/eligibility';
import { EXAMS_DATABASE, Exam } from '../lib/examsData';

const profiles = [
  {
    id: 'TEST_01',
    name: 'Class 10 Student',
    degree: '10th',
    branch: '',
    category: 'GENERAL',
    age: 16,
    interests: ['Government Jobs']
  },
  {
    id: 'TEST_02',
    name: 'Class 12 Science Student',
    degree: '12th',
    branch: 'Science',
    category: 'GENERAL',
    age: 18,
    interests: ['Engineering', 'Defence']
  },
  {
    id: 'TEST_03',
    name: 'Class 12 Commerce Student',
    degree: '12th',
    branch: 'Commerce',
    category: 'GENERAL',
    age: 18,
    interests: ['Banking']
  },
  {
    id: 'TEST_04',
    name: 'Class 12 Arts Student',
    degree: '12th',
    branch: 'Arts',
    category: 'GENERAL',
    age: 18,
    interests: ['Government Jobs']
  },
  {
    id: 'TEST_05',
    name: 'Diploma Student (CE)',
    degree: 'Diploma',
    branch: 'Computer Engineering',
    category: 'GENERAL',
    age: 19,
    interests: ['Engineering']
  },
  {
    id: 'TEST_06',
    name: 'ITI Student (Electrical)',
    degree: 'ITI',
    branch: 'Electrical',
    category: 'GENERAL',
    age: 19,
    interests: ['Government Jobs']
  },
  {
    id: 'TEST_07',
    name: 'B.Tech CSE',
    degree: 'B.Tech',
    branch: 'Computer Engineering',
    category: 'GENERAL',
    age: 21,
    interests: ['Government Technical Jobs']
  },
  {
    id: 'TEST_08',
    name: 'B.Tech Mechanical',
    degree: 'B.Tech',
    branch: 'Mechanical Engineering',
    category: 'GENERAL',
    age: 22,
    interests: ['Engineering']
  },
  {
    id: 'TEST_13',
    name: 'B.A. Graduate',
    degree: 'B.A.',
    branch: 'History',
    category: 'GENERAL',
    age: 23,
    interests: ['Government Jobs', 'Civil Services']
  },
  {
    id: 'TEST_18',
    name: 'M.Tech CSE',
    degree: 'M.Tech',
    branch: 'Computer Engineering',
    category: 'GENERAL',
    age: 25,
    interests: ['Engineering']
  }
];

// Mock database format
const exams = EXAMS_DATABASE.map(e => ({
  id: e.id,
  short_name: e.code,
  title: e.title,
  category_name: e.category,
  minimum_age: e.minAge || 18,
  maximum_age: e.maxAgeGen || 30,
  age_relaxation: e.ageRelaxation || { OBC: 3, SC: 5, ST: 5, PWD: 10 },
  degrees: e.minEducation ? [e.minEducation] : ['Graduate'],
  eligible_branches: e.eligibleStreams || ['All Streams'],
  qualification_levels: e.minEducation ? [e.minEducation] : ['Graduate'],
} as Exam));

console.log('--- RUNNING ELIGIBILITY TESTS ---\n');

const results = [];

for (const p of profiles) {
  console.log(`\n=================================`);
  console.log(`PROFILE: ${p.name} (${p.degree} ${p.branch}) Age: ${p.age}`);
  console.log(`=================================`);
  
  const high: string[] = [];
  const good: string[] = [];
  const explore: string[] = [];
  const notEligible: string[] = [];
  
  for (const e of exams) {
    const score = calculateMatchScore(e, p as any);
    if (score.matchLevel === 'NOT_ELIGIBLE') {
        notEligible.push(`${e.short_name} (Reason: ${score.matchingReason})`);
    } else {
        if (score.matchScore >= 70) high.push(`${e.short_name} (${score.matchScore}% - ${score.matchingReason})`);
        else if (score.matchScore >= 50) good.push(`${e.short_name} (${score.matchScore}% - ${score.matchingReason})`);
        else explore.push(`${e.short_name} (${score.matchScore}% - ${score.matchingReason})`);
    }
  }
  
  console.log(`[HIGHLY RECOMMENDED] (${high.length})`);
  high.forEach(x => console.log(`  - ${x}`));
  
  console.log(`\n[ELIGIBLE - GOOD] (${good.length})`);
  good.forEach(x => console.log(`  - ${x}`));
  
  console.log(`\n[ELIGIBLE - EXPLORE] (${explore.length})`);
  explore.forEach(x => console.log(`  - ${x}`));
  
  console.log(`\n[NOT ELIGIBLE] (${notEligible.length})`);
  console.log(`  - ` + notEligible.join(', '));
  
  results.push({
      profile: p.name,
      high: high.length,
      good: good.length,
      explore: explore.length,
      not: notEligible.length
  });
}

console.log('\n--- SUMMARY ---');
console.table(results);
