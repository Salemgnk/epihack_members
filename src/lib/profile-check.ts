/**
 * Check if a profile is complete
 */
export function isProfileComplete(profile: any): boolean {
    if (!profile) return false;

    const requiredFields = [
        'username',
        'year',
    ];

    return requiredFields.every(field => {
        const value = profile[field];
        return value !== null && value !== undefined && value !== '';
    });
}

/**
 * Get missing profile fields
 */
export function getMissingFields(profile: any): string[] {
    if (!profile) return [];

    const requiredFields = {
        username: 'Username',
        year: 'Year (L1, L2, L3, etc.)',
    };

    const missing: string[] = [];

    Object.entries(requiredFields).forEach(([field, label]) => {
        const value = profile[field];
        if (value === null || value === undefined || value === '') {
            missing.push(label);
        }
    });

    return missing;
}
