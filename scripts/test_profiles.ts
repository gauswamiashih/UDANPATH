import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getExamsFromDb } from '../lib/dbService';
import { calculateMatchScore } from '../lib/eligibility';
import * as fs from 'fs';

async function runTests() {
  const exams = await getExamsFromDb();
  
  if (exams.length === 0) {
    console.log("No exams found in DB. Make sure seed script ran successfully.");
    return;
  }

  const profiles = [
    { name: "1. CLASS 10 STUDENT", p: { degree: "10th", branch: "", category: "GENERAL", age: 18 } },
    { name: "2. CLASS 12 SCIENCE", p: { degree: "12th", branch: "Science", category: "GENERAL", age: 18 } },
    { name: "3. CLASS 12 COMMERCE", p: { degree: "12th", branch: "Commerce", category: "GENERAL", age: 18 } },
    { name: "4. CLASS 12 ARTS", p: { degree: "12th", branch: "Arts", category: "GENERAL", age: 18 } },
    { name: "5. ITI STUDENT", p: { degree: "ITI", branch: "Fitter", category: "GENERAL", age: 20 } },
    { name: "6. DIPLOMA STUDENT", p: { degree: "Diploma", branch: "Mechanical Engineering", category: "GENERAL", age: 21 } },
    { name: "7. B.TECH COMPUTER ENGINEERING", p: { degree: "B.Tech", branch: "Computer Engineering", category: "GENERAL", age: 22 } },
    { name: "8. B.TECH COMPUTER SCIENCE / CSE", p: { degree: "B.Tech", branch: "Computer Science", category: "GENERAL", age: 22 } },
    { name: "9. B.TECH IT", p: { degree: "B.Tech", branch: "Information Technology", category: "GENERAL", age: 22 } },
    { name: "10. B.TECH AI / ML / DATA SCIENCE", p: { degree: "B.Tech", branch: "Data Science", category: "GENERAL", age: 22 } },
    { name: "11. B.TECH CYBER SECURITY", p: { degree: "B.Tech", branch: "Cyber Security", category: "GENERAL", age: 22 } },
    { name: "12. B.TECH MECHANICAL", p: { degree: "B.Tech", branch: "Mechanical Engineering", category: "GENERAL", age: 22 } },
    { name: "13. B.TECH CIVIL", p: { degree: "B.Tech", branch: "Civil Engineering", category: "GENERAL", age: 22 } },
    { name: "14. B.TECH ELECTRICAL", p: { degree: "B.Tech", branch: "Electrical Engineering", category: "GENERAL", age: 22 } },
    { name: "15. B.TECH ECE", p: { degree: "B.Tech", branch: "Electronics", category: "GENERAL", age: 22 } },
    { name: "16. B.E. STUDENTS", p: { degree: "B.E.", branch: "Computer", category: "GENERAL", age: 22 } },
    { name: "17. B.A. GRADUATE", p: { degree: "B.A.", branch: "History", category: "GENERAL", age: 22 } },
    { name: "18. B.COM GRADUATE", p: { degree: "B.Com", branch: "Accounting", category: "GENERAL", age: 22 } },
    { name: "19. B.SC GRADUATE", p: { degree: "B.Sc", branch: "Physics", category: "GENERAL", age: 22 } },
    { name: "20. BCA GRADUATE", p: { degree: "BCA", branch: "Computer Applications", category: "GENERAL", age: 22 } },
    { name: "21. BBA GRADUATE", p: { degree: "BBA", branch: "Management", category: "GENERAL", age: 22 } },
    { name: "22. M.TECH", p: { degree: "M.Tech", branch: "Computer Engineering", category: "GENERAL", age: 25 } },
    { name: "23. MBA", p: { degree: "MBA", branch: "Finance", category: "GENERAL", age: 25 } },
    { name: "24. M.SC", p: { degree: "M.Sc", branch: "Mathematics", category: "GENERAL", age: 24 } }
  ];

  let report = "==================================================\n";
  report += "FINAL TEST REPORT\n";
  report += "==================================================\n\n";

  let totalPassed = 0;
  let totalFailed = 0;

  for (const profile of profiles) {
    report += `==================================================\n`;
    report += `${profile.name}\n`;
    report += `==================================================\n`;
    report += `PROFILE:\n`;
    report += `Education: ${profile.p.degree}\n`;
    report += `Branch: ${profile.p.branch}\n`;
    report += `Age: ${profile.p.age}\n`;
    report += `Category: ${profile.p.category}\n`;
    report += `\n`;

    const recommendations = [];
    const eligibleExams = [];
    const notEligible = [];

    for (const exam of exams) {
      const scoreResult = calculateMatchScore(exam, profile.p);
      
      if (scoreResult.matchLevel !== 'NOT_ELIGIBLE') {
        recommendations.push({
          exam: exam.short_name,
          score: scoreResult.matchScore,
          reason: scoreResult.matchingReason
        });
        eligibleExams.push(exam.short_name);
      } else {
        notEligible.push({
          exam: exam.short_name,
          reason: scoreResult.matchingReason
        });
      }
    }

    // Sort recommendations
    recommendations.sort((a, b) => b.score - a.score);

    report += `TOP RECOMMENDATIONS\n\n`;
    recommendations.slice(0, 3).forEach((rec, i) => {
      report += `${i + 1}. ${rec.exam}\n`;
      report += `Match Score: ${rec.score}\n`;
      report += `Reason: ${rec.reason}\n\n`;
    });

    report += `--------------------------------\n`;
    report += `OTHER ELIGIBLE EXAMS\n`;
    report += `${eligibleExams.join(', ') || 'None'}\n\n`;

    report += `--------------------------------\n`;
    report += `NOT ELIGIBLE\n`;
    notEligible.forEach(ne => {
      report += `${ne.exam}\n`;
      report += `Reason: ${ne.reason}\n\n`;
    });

    let passed = true;
    
    // Very simple validations
    if (profile.name.includes("CLASS 10") && !eligibleExams.includes("SSC_MTS")) passed = false;
    if (profile.name.includes("CLASS 12 SCIENCE") && !eligibleExams.includes("JEE_MAIN")) passed = false;
    if (profile.name.includes("CLASS 12 ARTS") && eligibleExams.includes("JEE_MAIN")) passed = false;
    if (profile.name.includes("B.TECH") && eligibleExams.includes("SSC_MTS")) passed = false;
    if (profile.name.includes("B.E.") && !eligibleExams.includes("UPSC_CSE")) passed = false;

    if (passed) totalPassed++;
    else totalFailed++;

    report += `STATUS: ${passed ? 'PASS' : 'FAIL'}\n\n`;
  }

  report += `==================================================\n`;
  report += `SUMMARY\n`;
  report += `Total exams in database: ${exams.length}\n`;
  report += `Total profiles tested: ${profiles.length}\n`;
  report += `Total passed: ${totalPassed}\n`;
  report += `Total failed: ${totalFailed}\n`;
  
  fs.writeFileSync('test_report.log', report);
  console.log("Test execution completed. Check test_report.log");
}

runTests();
