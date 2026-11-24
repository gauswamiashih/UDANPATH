async function testAIChat(message, profile = null) {
  try {
    const res = await fetch('http://localhost:8000/api/v1/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        selected_agent: 'upsc',
        user_profile: profile,
        history: []
      })
    });

    if (!res.ok) {
      console.error(`Error: ${res.status} ${res.statusText}`);
      return;
    }

    const reader = res.body;
    let fullResponse = '';

    for await (const chunk of reader) {
      fullResponse += chunk.toString();
    }
    
    console.log(`\n--- Query: "${message}" ---`);
    console.log(fullResponse);
    console.log(`----------------------------------\n`);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

async function runTests() {
  console.log('Running AI Verification Workflow Tests...\n');

  // Test 1: Critical Info without verified source
  await testAIChat('What is the exact registration deadline for UPSC 2025?');

  // Test 2: Profile Check before answering
  await testAIChat('Am I eligible for the Medical branch in UPSC?', {
    education: 'B.Com',
    branch: 'Commerce',
    category: 'GENERAL'
  });

  // Test 3: Hallucination Prevention
  await testAIChat('Tell me about the Indian Fake Exam of Engineering (IFEE) conducted by NASA.');
}

runTests();
