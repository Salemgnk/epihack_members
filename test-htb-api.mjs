/**
 * Test script to verify HTB API endpoints
 * Run with: node test-htb-api.mjs
 */

const HTB_API_BASE = 'https://www.hackthebox.com/api/v4';
const HTB_APP_TOKEN = process.env.HTB_APP_TOKEN;

if (!HTB_APP_TOKEN) {
    console.error('❌ HTB_APP_TOKEN not set in environment');
    process.exit(1);
}

console.log('🔍 Testing HTB API endpoints...\n');

async function testEndpoint(name, url) {
    console.log(`\n📡 Testing: ${name}`);
    console.log(`   URL: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        console.log(`   Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ SUCCESS`);
            console.log(`   Data:`, JSON.stringify(data, null, 2).substring(0, 500));
            return { success: true, data };
        } else {
            const text = await response.text();
            console.log(`   ❌ FAILED`);
            console.log(`   Error:`, text.substring(0, 200));
            return { success: false, error: text };
        }
    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Test different endpoints
async function runTests() {
    const username = 'Scorpi777';
    const sampleUserId = 1; // HTB admin user ID for testing

    const results = [];

    // Test 1: Search by username
    results.push(await testEndpoint(
        'Search Users by Username',
        `${HTB_API_BASE}/search/users?searchTerm=${username}`
    ));

    // Test 2: Get profile by ID (sample)
    results.push(await testEndpoint(
        'Get Profile by User ID (sample ID=1)',
        `${HTB_API_BASE}/user/profile/basic/${sampleUserId}`
    ));

    // Test 3: Search endpoint alternative
    results.push(await testEndpoint(
        'Search Endpoint Alternative',
        `${HTB_API_BASE}/search/fetch?query=${username}`
    ));

    // Test 4: User lookup endpoint
    results.push(await testEndpoint(
        'User Lookup',
        `${HTB_API_BASE}/user/info/${username}`
    ));

    console.log('\n\n📊 SUMMARY:');
    console.log('='.repeat(50));
    results.forEach((result, index) => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`Test ${index + 1}: ${status}`);
    });

    console.log('\n💡 RECOMMENDATION:');
    const workingTests = results.filter(r => r.success);
    if (workingTests.length > 0) {
        console.log('Use the endpoints that returned ✅ PASS');
    } else {
        console.log('⚠️ No endpoints working. Check:');
        console.log('   1. HTB_APP_TOKEN is valid');
        console.log('   2. Token has necessary permissions');
        console.log('   3. HTB API documentation for correct endpoints');
    }
}

runTests();
