// Simple HTB API test - check console in browser
// Add this temporarily to app/api/htb/link/route.ts to debug

export async function GET(request) {
    console.log('=== HTB API TEST ===');

    const HTB_TOKEN = process.env.HTB_APP_TOKEN;
    const username = 'Scorpi777';

    console.log('Token configured:', HTB_TOKEN ? 'YES' : 'NO');

    // Test 1: Search users
    try {
        const searchUrl = `https://www.hackthebox.com/api/v4/search/users?searchTerm=${username}`;
        console.log('\n1. Testing search endpoint:', searchUrl);

        const res1 = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${HTB_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });

        console.log('Search status:', res1.status);
        const data1 = await res1.text();
        console.log('Search response:', data1.substring(0, 500));
    } catch (e) {
        console.log('Search error:', e.message);
    }

    // Test 2: Profile by ID
    try {
        const profileUrl = `https://www.hackthebox.com/api/v4/user/profile/basic/1`;
        console.log('\n2. Testing profile endpoint:', profileUrl);

        const res2 = await fetch(profileUrl, {
            headers: {
                'Authorization': `Bearer ${HTB_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });

        console.log('Profile status:', res2.status);
        const data2 = await res2.text();
        console.log('Profile response:', data2.substring(0, 500));
    } catch (e) {
        console.log('Profile error:', e.message);
    }

    return new Response('Check server console', { status: 200 });
}
