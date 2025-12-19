/**
 * HackTheBox API Client
 * Uses EpiHack's App Token to fetch member stats
 */

const HTB_API_BASE = process.env.HTB_API_BASE_URL || 'https://www.hackthebox.com/api/v4';
const HTB_APP_TOKEN = process.env.HTB_APP_TOKEN;

if (!HTB_APP_TOKEN) {
    console.warn('HTB_APP_TOKEN not configured. HTB integration will not work.');
}

interface HTBUserProfile {
    id: number;
    name: string;
    avatar: string;
    rank: string;
    points: number;
    user_bloods: number;
    system_bloods: number;
    user_owns: number;
    system_owns: number;
    respects: number;
}

interface HTBActivity {
    id: number;
    type: string;
    name: string;
    date: string;
    object_type: string;
    first_blood?: boolean;
}

interface HTBMachine {
    id: number;
    name: string;
    os: string;
    difficulty: string;
    points: number;
    release: string;
    retired: boolean;
}

class HTBClient {
    private baseURL: string;
    private token: string;

    constructor(token?: string) {
        this.baseURL = HTB_API_BASE;
        this.token = token || HTB_APP_TOKEN || '';
    }

    private async fetch<T>(endpoint: string): Promise<T> {
        if (!this.token) {
            throw new Error('HTB_APP_TOKEN not configured');
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTB API Error (${response.status}): ${error}`);
        }

        return response.json();
    }

    /**
     * Get user profile by ID
     */
    async getUserProfile(userId: number): Promise<HTBUserProfile> {
        const data = await this.fetch<{ profile: HTBUserProfile }>(`/user/profile/basic/${userId}`);
        return data.profile;
    }

    /**
     * Get user activity
     */
    async getUserActivity(userId: number): Promise<HTBActivity[]> {
        const data = await this.fetch<{ profile: { activity: HTBActivity[] } }>(`/user/profile/activity/${userId}`);
        return data.profile.activity || [];
    }

    /**
     * Search user by username (using public profile endpoint)
     */
    async searchUserByUsername(username: string): Promise<HTBUserProfile | null> {
        try {
            // HTB doesn't have a direct search endpoint, we need to use the profile endpoint
            // This is a workaround - in production, you might need to maintain a mapping
            const data = await this.fetch<{ profile: HTBUserProfile }>(`/user/profile/basic/${username}`);
            return data.profile;
        } catch (error) {
            console.error(`Failed to find HTB user: ${username}`, error);
            return null;
        }
    }

    /**
     * Get active machines list
     */
    async getActiveMachines(): Promise<HTBMachine[]> {
        const data = await this.fetch<{ info: HTBMachine[] }>('/machine/list');
        return data.info.filter(m => !m.retired);
    }

    /**
     * Get retired machines list
     */
    async getRetiredMachines(): Promise<HTBMachine[]> {
        const data = await this.fetch<{ info: HTBMachine[] }>('/machine/list/retired');
        return data.info;
    }

    /**
     * Check if user has pwned a specific machine
     */
    async hasUserPwnedMachine(userId: number, machineId: number): Promise<boolean> {
        try {
            const activity = await this.getUserActivity(userId);
            return activity.some(a =>
                a.object_type === 'machine' &&
                a.id === machineId &&
                a.type === 'user'
            );
        } catch (error) {
            console.error('Error checking machine pwn status', error);
            return false;
        }
    }
}

export { HTBClient };
export const htbClient = new HTBClient();

export type { HTBUserProfile, HTBActivity, HTBMachine };
