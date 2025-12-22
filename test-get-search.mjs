/**
 * Test GET /search/users (not POST)
 */

const HTB_APP_TOKEN = process.env.HTB_APP_TOKEN;
const username = 'Scorpi777';

console.log('🔍 Testing GET /search/users (not POST)\n');

async function testGetSearch() {
    // Try different GET search endpoints
    const tests = [
        {
            name: 'GET /search/users?username=',
            url: `https://labs.hackthebox.com/api/v4/search/users?username=${username}`
        },
        {
            name: 'GET /search/users?query=',
            url: `https://labs.hackthebox.com/api/v4/search/users?query=${username}`
        },
        {
            name: 'GET /search/users?search=',
            url: `https://labs.hackthebox.com/api/v4/search/users?search=${username}`
        },
        {
            name: 'GET /search/users?name=',
            url: `https://labs.hackthebox.com/api/v4/search/users?name=${username}`
        },
    ];

    for (const test of tests) {
        console.log(`📡 ${test.name}`);
        console.log(`   ${test.url}`);

        try {
            const response = await fetch(test.url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                    'Content-Type': 'application/json',
                }
            });

            console.log(`   Status: ${response.status}`);

            if (response.ok) {
                const text = await response.text();
                console.log('   ✅ SUCCESS!\n');
                try {
                    const data = JSON.parse(text);
                    console.log('   Data:', JSON.stringify(data, null, 2).substring(0, 400));
                } catch (e) {
                    console.log('   Response:', text.substring(0, 200));
                }
                return; // Stop on first success
            } else {
                console.log('   ❌ Failed');
            }
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
        }
        console.log();
    }

    console.log('💡 All GET variations failed. User ID only approach is correct.');
}

testGetSearch();
