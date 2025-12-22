/**
 * Quick test: POST /search/users on labs.hackthebox.com
 */

const HTB_APP_TOKEN = process.env.HTB_APP_TOKEN;
const username = 'Scorpi777';

console.log('🧪 Testing POST /search/users on labs.hackthebox.com\n');

async function testSearch() {
    const url = 'https://labs.hackthebox.com/api/v4/search/users';

    console.log('URL:', url);
    console.log('Method: POST');
    console.log('Body:', JSON.stringify({ query: username }));
    console.log();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HTB_APP_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: username })
        });

        console.log('Status:', response.status, response.statusText);
        console.log('Content-Type:', response.headers.get('content-type'));

        const text = await response.text();

        if (response.ok) {
            console.log('\n✅ SUCCESS!\n');
            const data = JSON.parse(text);
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('\n❌ FAILED\n');
            console.log('Response preview:', text.substring(0, 300));

            if (text.includes('<!DOCTYPE')) {
                console.log('\n⚠️ Returned HTML error page, not JSON');
                console.log('This endpoint likely does not exist or requires different authentication');
            }
        }
    } catch (error) {
        console.log('❌ ERROR:', error.message);
    }

    console.log('\n' + '='.repeat(80));
    console.log('💡 CONCLUSION:');
    console.log('If this returns 404, POST /search/users does NOT work with App Token');
    console.log('Solution: Use User ID only (no username search)');
}

testSearch();
