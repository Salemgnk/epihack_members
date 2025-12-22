/**
 * Final test: Verify labs.hackthebox.com with search endpoint
 */

const HTB_APP_TOKEN = process.env.HTB_APP_TOKEN;
const BASE_URL = 'https://labs.hackthebox.com/api/v4';

console.log('🎯 FINAL VERIFICATION TEST\n');
console.log('Base URL:', BASE_URL);
console.log('Token:', HTB_APP_TOKEN ? 'Configured' : 'Missing');
console.log('\n' + '='.repeat(80) + '\n');

async function testFinalEndpoints() {
    const username = 'Scorpi777';

    // Test 1: GET /user/info (self)
    console.log('📡 Test 1: GET /user/info (your profile)');
    try {
        const response = await fetch(`${BASE_URL}/user/info`, {
            headers: {
                'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS! Your profile:');
            console.log(JSON.stringify(data.info, null, 2));
        } else {
            console.log(`❌ Failed: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // Test 2: POST /search/users
    console.log('\n' + '='.repeat(80));
    console.log('\n📡 Test 2: POST /search/users (search for username)');
    try {
        const response = await fetch(`${BASE_URL}/search/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: username })
        });

        console.log('Status:', response.status);
        const text = await response.text();

        if (response.ok) {
            console.log('✅ SUCCESS! Search results:');
            const data = JSON.parse(text);
            console.log(JSON.stringify(data, null, 2).substring(0, 500));
        } else {
            console.log(`❌ Failed: ${response.status}`);
            console.log('Response:', text.substring(0, 300));
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    // Test 3: GET /user/profile/basic/{id}
    console.log('\n' + '='.repeat(80));
    console.log('\n📡 Test 3: GET /user/profile/basic/1761582 (your User ID)');
    try {
        const response = await fetch(`${BASE_URL}/user/profile/basic/1761582`, {
            headers: {
                'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });

        console.log('Status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS! Profile data:');
            console.log(JSON.stringify(data, null, 2).substring(0, 500));
        } else {
            console.log(`❌ Failed: ${response.status}`);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n🎯 CONCLUSION:');
    console.log('If all tests pass, HTB linking will work!');
    console.log('If search fails but profile ID works, we use ID-only approach.');
}

testFinalEndpoints();
