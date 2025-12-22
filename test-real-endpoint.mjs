/**
 * Test HTB API with EXACT endpoint from Postman docs
 * Based on: https://documenter.getpostman.com/view/13129365/TVeqbmeq
 */

const HTB_APP_TOKEN = process.env.HTB_APP_TOKEN;

if (!HTB_APP_TOKEN) {
    console.error('❌ HTB_APP_TOKEN not set');
    process.exit(1);
}

async function testRealEndpoint() {
    // According to Postman docs screenshot, the endpoint is:
    // GET https://www.hackthebox.com/api/v4/user/profile/basic/{id}

    const testUserId = 5833; // From the docs example
    const userIdToTest = 1; // HTB founder ID (should always exist)

    console.log('🔍 Testing HTB API with EXACT endpoint from docs\n');
    console.log('Token present:', HTB_APP_TOKEN ? 'YES' : 'NO');
    console.log('Token preview:', HTB_APP_TOKEN ? HTB_APP_TOKEN.substring(0, 20) + '...' : 'N/A');

    // Test 1: Example from docs
    console.log('\n📡 Test 1: Example User ID from docs (5833)');
    const url1 = `https://www.hackthebox.com/api/v4/user/profile/basic/${testUserId}`;
    console.log('URL:', url1);

    try {
        const response = await fetch(url1, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        console.log('Status:', response.status, response.statusText);
        console.log('Headers:', {
            'content-type': response.headers.get('content-type'),
            'content-length': response.headers.get('content-length')
        });

        const text = await response.text();
        console.log('Response:', text.substring(0, 500));

        if (response.ok) {
            console.log('✅ SUCCESS!');
            try {
                const json = JSON.parse(text);
                console.log('Profile data:', JSON.stringify(json, null, 2).substring(0, 500));
            } catch (e) {
                console.log('Not valid JSON');
            }
        } else {
            console.log('❌ FAILED');
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    // Test 2: HTB Founder (ID=1, should exist)
    console.log('\n📡 Test 2: HTB Founder (User ID 1)');
    const url2 = `https://www.hackthebox.com/api/v4/user/profile/basic/${userIdToTest}`;
    console.log('URL:', url2);

    try {
        const response = await fetch(url2, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        console.log('Status:', response.status, response.statusText);
        const text = await response.text();
        console.log('Response:', text.substring(0, 200));

        if (response.ok) {
            console.log('✅ SUCCESS!');
        } else {
            console.log('❌ FAILED');
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    console.log('\n💡 NEXT STEP:');
    console.log('If both tests return 404:');
    console.log('  → Your HTB_APP_TOKEN might not have the right permissions');
    console.log('  → Or you need a Personal API Token (not App Token)');
    console.log('If tests succeed:');
    console.log('  → Endpoint works! Will need to find your actual User ID');
}

testRealEndpoint();
