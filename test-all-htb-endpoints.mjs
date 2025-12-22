/**
 * EXHAUSTIVE HTB API ENDPOINT TESTER
 * Tests all possible HTB API endpoints to find which one works
 */

const HTB_APP_TOKEN = process.env.HTB_APP_TOKEN;
const BASE_URL = 'https://www.hackthebox.com/api/v4';

if (!HTB_APP_TOKEN) {
    console.error('❌ Set HTB_APP_TOKEN env variable first!');
    process.exit(1);
}

console.log('🔍 EXHAUSTIVE HTB API ENDPOINT TESTER\n');
console.log('Token configured:', HTB_APP_TOKEN ? 'YES (' + HTB_APP_TOKEN.substring(0, 20) + '...)' : 'NO');
console.log('Base URL:', BASE_URL);
console.log('\n' + '='.repeat(80) + '\n');

const results = [];

async function testEndpoint(name, method, url, body = null) {
    console.log(`\n📡 TEST: ${name}`);
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${url}`);
    if (body) console.log(`   Body: ${JSON.stringify(body)}`);

    try {
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'HTB-API-Tester/1.0'
            }
        };

        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const text = await response.text();

        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);

        const result = {
            name,
            method,
            url,
            status: response.status,
            success: response.ok,
            preview: text.substring(0, 300)
        };

        if (response.ok) {
            console.log(`   ✅ SUCCESS!`);
            try {
                const json = JSON.parse(text);
                console.log(`   Response Preview:`, JSON.stringify(json, null, 2).substring(0, 500));
                result.data = json;
            } catch (e) {
                console.log(`   Response (not JSON):`, text.substring(0, 200));
            }
        } else {
            console.log(`   ❌ FAILED`);
            console.log(`   Error:`, text.substring(0, 200));
        }

        results.push(result);
        return result;
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        results.push({ name, method, url, status: 0, success: false, error: error.message });
        return null;
    }
}

async function runAllTests() {
    const testUsername = 'Scorpi777';
    const testUserId = 1; // HTB founder
    const anotherUserId = 5833; // From docs example

    console.log('Test Username:', testUsername);
    console.log('Test User IDs:', testUserId, anotherUserId);

    // ============ USER PROFILE ENDPOINTS ============
    console.log('\n' + '='.repeat(80));
    console.log('TESTING: USER PROFILE ENDPOINTS');
    console.log('='.repeat(80));

    await testEndpoint(
        '1. GET /user/profile/basic/{id} - User ID 1',
        'GET',
        `${BASE_URL}/user/profile/basic/${testUserId}`
    );

    await testEndpoint(
        '2. GET /user/profile/basic/{id} - User ID 5833',
        'GET',
        `${BASE_URL}/user/profile/basic/${anotherUserId}`
    );

    await testEndpoint(
        '3. GET /user/info (self)',
        'GET',
        `${BASE_URL}/user/info`
    );

    // ============ SEARCH ENDPOINTS ============
    console.log('\n' + '='.repeat(80));
    console.log('TESTING: SEARCH ENDPOINTS');
    console.log('='.repeat(80));

    await testEndpoint(
        '4. POST /search/users',
        'POST',
        `${BASE_URL}/search/users`,
        { query: testUsername }
    );

    await testEndpoint(
        '5. GET /search/fetch?query={username}',
        'GET',
        `${BASE_URL}/search/fetch?query=${testUsername}`
    );

    // ============ ALTERNATIVE ENDPOINTS ============
    console.log('\n' + '='.repeat(80));
    console.log('TESTING: ALTERNATIVE ENDPOINTS');
    console.log('='.repeat(80));

    await testEndpoint(
        '6. GET /profile/member/{id}',
        'GET',
        `${BASE_URL}/profile/member/${testUserId}`
    );

    await testEndpoint(
        '7. GET /users/{username}',
        'GET',
        `${BASE_URL}/users/${testUsername}`
    );

    await testEndpoint(
        '8. GET /user/{username}',
        'GET',
        `${BASE_URL}/user/${testUsername}`
    );

    await testEndpoint(
        '9. GET /user/profile/{username}',
        'GET',
        `${BASE_URL}/user/profile/${testUsername}`
    );

    await testEndpoint(
        '10. GET /rankings/users/1 (first page)',
        'GET',
        `${BASE_URL}/rankings/users/1`
    );

    // ============ SUMMARY ============
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY OF ALL TESTS');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ SUCCESS: ${successful.length}/${results.length}`);
    successful.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.name} (${r.status})`);
    });

    console.log(`\n❌ FAILED: ${failed.length}/${results.length}`);
    failed.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.name} (${r.status || 'ERROR'})`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('💡 RECOMMENDATION:');
    console.log('='.repeat(80));

    if (successful.length > 0) {
        console.log('\n✅ Working endpoints found! Use one of these:');
        successful.forEach(r => {
            console.log(`\n   ${r.method} ${r.url}`);
            if (r.data) {
                console.log(`   Returns:`, JSON.stringify(r.data, null, 2).substring(0, 300));
            }
        });
    } else {
        console.log('\n❌ No working endpoints found!');
        console.log('\nPossible issues:');
        console.log('1. HTB_APP_TOKEN is invalid or expired');
        console.log('2. Token lacks necessary permissions');
        console.log('3. Need a Personal API Token instead of App Token');
        console.log('4. HTB API has changed and docs are outdated');
        console.log('\nNext steps:');
        console.log('- Verify token is correct in .env.local');
        console.log('- Try generating a new token from HTB');
        console.log('- Check if you need a Personal Token (Profile Settings)');
    }
}

runAllTests().catch(console.error);
