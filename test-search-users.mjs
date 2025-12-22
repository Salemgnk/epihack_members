/**
 * Test HTB API with CORRECT endpoint from docs
 * POST /search/users - Search for users
 */

const HTB_APP_TOKEN = process.env.HTB_APP_TOKEN;

if (!HTB_APP_TOKEN) {
    console.error('❌ HTB_APP_TOKEN not set');
    process.exit(1);
}

async function testSearchUsers() {
    const username = 'Scorpi777';
    const url = 'https://www.hackthebox.com/api/v4/search/users';

    console.log('🔍 Testing HTB User Search\n');
    console.log('Endpoint: POST', url);
    console.log('Username:', username);
    console.log('Token present:', HTB_APP_TOKEN ? 'YES' : 'NO\n');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: username
            })
        });

        console.log('Status:', response.status, response.statusText);

        const text = await response.text();

        if (response.ok) {
            console.log('✅ SUCCESS!\n');
            const data = JSON.parse(text);
            console.log('Response:', JSON.stringify(data, null, 2));

            if (data && data.length > 0) {
                console.log('\n✅ User found!');
                console.log('User data:', data[0]);
            } else {
                console.log('\n⚠️ No users found with that username');
            }
        } else {
            console.log('❌ FAILED\n');
            console.log('Response:', text.substring(0, 500));
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }
}

testSearchUsers();
