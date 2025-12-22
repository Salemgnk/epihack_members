/**
 * Test HTB API with different headers combinations
 * Testing CSRF, Referer, Origin, etc.
 */

const HTB_APP_TOKEN = process.env.HTB_APP_TOKEN;
const BASE_URL = 'https://www.hackthebox.com/api/v4';

if (!HTB_APP_TOKEN) {
    console.error('❌ Set HTB_APP_TOKEN first!');
    process.exit(1);
}

console.log('🔬 Testing HTB API with various header combinations\n');

async function testWithHeaders(name, url, method, body, extraHeaders) {
    console.log(`\n📡 ${name}`);
    console.log(`   ${method} ${url}`);

    const headers = {
        'Authorization': `Bearer ${HTB_APP_TOKEN}`,
        'Content-Type': 'application/json',
        ...extraHeaders
    };

    console.log('   Headers:', Object.keys(headers).join(', '));

    try {
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        const text = await response.text();

        console.log(`   Status: ${response.status}`);

        if (response.ok) {
            console.log('   ✅ SUCCESS!');
            try {
                const json = JSON.parse(text);
                console.log('   Data:', JSON.stringify(json, null, 2).substring(0, 400));
            } catch (e) {
                console.log('   Response:', text.substring(0, 200));
            }
            return true;
        } else {
            console.log('   ❌ Failed');
            if (text.includes('<!DOCTYPE')) {
                console.log('   HTML error page returned');
            } else {
                console.log('   Error:', text.substring(0, 150));
            }
            return false;
        }
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('Testing GET /user/info with different headers\n');
    console.log('='.repeat(80));

    // Test 1: Basic headers
    await testWithHeaders(
        'Test 1: Basic Authorization only',
        `${BASE_URL}/user/info`,
        'GET',
        null,
        {}
    );

    // Test 2: With Referer
    await testWithHeaders(
        'Test 2: With Referer header',
        `${BASE_URL}/user/info`,
        'GET',
        null,
        {
            'Referer': 'https://app.hackthebox.com/',
        }
    );

    // Test 3: With Origin
    await testWithHeaders(
        'Test 3: With Origin header',
        `${BASE_URL}/user/info`,
        'GET',
        null,
        {
            'Origin': 'https://app.hackthebox.com',
        }
    );

    // Test 4: Full browser-like headers
    await testWithHeaders(
        'Test 4: Full browser headers',
        `${BASE_URL}/user/info`,
        'GET',
        null,
        {
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://app.hackthebox.com/',
            'Origin': 'https://app.hackthebox.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
    );

    // Test 5: Try without /api/v4 prefix (maybe it's already in base?)
    console.log('\n' + '='.repeat(80));
    console.log('Testing alternative URL structures\n');

    await testWithHeaders(
        'Test 5: Without /api/v4 prefix',
        `https://www.hackthebox.com/user/info`,
        'GET',
        null,
        {
            'Authorization': `Bearer ${HTB_APP_TOKEN}`,
        }
    );

    // Test 6: With /api only
    await testWithHeaders(
        'Test 6: With /api but not v4',
        `https://www.hackthebox.com/api/user/info`,
        'GET',
        null,
        {}
    );

    // Test 7: Try app.hackthebox.com instead of www
    await testWithHeaders(
        'Test 7: app.hackthebox.com subdomain',
        `https://app.hackthebox.com/api/v4/user/info`,
        'GET',
        null,
        {}
    );

    // Test 8: Try labs subdomain
    await testWithHeaders(
        'Test 8: labs.hackthebox.com subdomain',
        `https://labs.hackthebox.com/api/v4/user/info`,
        'GET',
        null,
        {}
    );

    console.log('\n' + '='.repeat(80));
    console.log('📊 ALL TESTS COMPLETED');
    console.log('='.repeat(80));
}

runTests();
