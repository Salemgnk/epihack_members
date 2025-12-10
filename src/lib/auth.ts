import { createClient } from './supabase';

/**
 * Get current user session
 * @returns User session or null
 */
export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
}

/**
 * Get current user profile from database
 * @returns User profile or null
 */
export async function getCurrentProfile() {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile;
}

/**
 * Check if current user is an admin
 * @returns boolean
 */
export async function isAdmin() {
    const profile = await getCurrentProfile();
    return profile?.is_admin === true;
}

/**
 * Check if current user is a member
 * @returns boolean
 */
export async function isMember() {
    const profile = await getCurrentProfile();
    return profile?.is_member === true;
}

/**
 * Check if current user is the super admin
 * @returns boolean
 */
export async function isSuperAdmin() {
    const user = await getCurrentUser();
    if (!user?.email) return false;

    const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    return user.email === superAdminEmail;
}
