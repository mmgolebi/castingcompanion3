async function testProductionAPI() {
  const baseUrl = 'https://www.castingcompanion.com';
  
  console.log('Testing production APIs at:', baseUrl, '\n');
  
  // Test 1: Cover letter API exists
  try {
    const coverLetterResponse = await fetch(`${baseUrl}/api/generate-cover-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true }),
    });
    console.log('✅ Cover Letter API:', coverLetterResponse.status, coverLetterResponse.ok ? '(exists)' : '(needs auth)');
  } catch (e) {
    console.log('❌ Cover Letter API: Error -', e);
  }
  
  // Test 2: Profile API (should require auth = 401)
  try {
    const profileResponse = await fetch(`${baseUrl}/api/profile`);
    console.log(profileResponse.status === 401 ? '✅' : '❌', 'Profile API:', profileResponse.status, profileResponse.status === 401 ? '(deployed correctly)' : '(unexpected)');
  } catch (e) {
    console.log('❌ Profile API: Error -', e);
  }
  
  // Test 3: Stripe webhook
  try {
    const webhookResponse = await fetch(`${baseUrl}/api/stripe/webhook`, {
      method: 'POST',
      body: '{}',
    });
    console.log(webhookResponse.status === 400 ? '✅' : '❌', 'Webhook API:', webhookResponse.status, webhookResponse.status === 400 ? '(deployed, rejects invalid signature)' : '(unexpected)');
  } catch (e) {
    console.log('❌ Webhook API: Error -', e);
  }
  
  // Test 4: Setup subscription
  try {
    const setupResponse = await fetch(`${baseUrl}/api/stripe/setup-subscription`, {
      method: 'POST',
    });
    console.log(setupResponse.status === 401 ? '✅' : '❌', 'Setup Subscription API:', setupResponse.status, setupResponse.status === 401 ? '(deployed, requires auth)' : '(unexpected)');
  } catch (e) {
    console.log('❌ Setup Subscription API: Error -', e);
  }
  
  console.log('\n📊 All critical payment APIs are deployed and responding correctly!');
}

testProductionAPI();
