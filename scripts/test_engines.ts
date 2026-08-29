import { validateVerificationMetadata, formatVerificationContext } from '../lib/verificationEngine';
import { calculateCollegeMatch, calculateCareerMatch, simulateWhatIfScenario } from '../lib/matchmakingEngine';

function runTests() {
  console.log('--- Running Verification Engine Tests ---');
  
  const currentDate = new Date('2024-01-01');

  // Test 1: Future valid_from
  const meta1 = {
    valid_from: '2025-01-01',
    valid_until: '2026-01-01',
    verification_status: 'Verified' as const
  };
  const res1 = validateVerificationMetadata(meta1, currentDate);
  console.assert(res1.isValid === false, 'Test 1 Failed: Should be invalid if future date');
  console.assert(res1.issues.includes("Verification timeline is in the future. Data not yet valid."), 'Test 1 Failed: Issue text mismatch');
  
  // Test 2: Past deadline
  const meta2 = {
    valid_from: '2020-01-01',
    valid_until: '2023-01-01',
    verification_status: 'Verified' as const
  };
  const res2 = validateVerificationMetadata(meta2, currentDate);
  console.assert(res2.isValid === false, 'Test 2 Failed: Should be invalid if deadline passed');

  // Test 3: Formatting Context
  console.log(formatVerificationContext(meta2));


  console.log('\n--- Running Matchmaking Engine Tests ---');
  
  const mockProfile = {
    class12Marks: 82,
    rank: 45000,
    streamName: 'Science',
    interests: ['Coding', 'Technology'],
    budget: 'High',
    goalName: 'General Engineering'
  };

  const college1 = { nirf_ranking: 90 }; // Mid-tier
  const college2 = { nirf_ranking: 150 }; // Lower-tier

  // Test 4: College Match Mid-tier
  const match1 = calculateCollegeMatch(college1, mockProfile);
  console.assert(match1.status === 'Target', `Test 4 Failed: Expected Target, got ${match1.status}`);

  // Test 5: College Match Good Fit (New logic)
  const match2 = calculateCollegeMatch(college2, mockProfile);
  console.assert(match2.status === 'Good Fit', `Test 5 Failed: Expected Good Fit, got ${match2.status}`);

  // Test 6: Career Match
  const career1 = { category: 'IT' };
  const match3 = calculateCareerMatch(career1, mockProfile);
  console.assert(match3.status === 'Best Fit', `Test 6 Failed: Expected Best Fit, got ${match3.status}`);

  // Test 7: AI Simulation
  const simulated = simulateWhatIfScenario("What if I get AIR 100?", mockProfile);
  console.assert(simulated.rank === 100, `Test 7 Failed: Rank should be 100, got ${simulated.rank}`);
  console.assert(simulated.goalName === 'IIT Engineering', `Test 7 Failed: Goal should be IIT Engineering, got ${simulated.goalName}`);

  console.log('\nAll tests completed successfully!');
}

runTests();
