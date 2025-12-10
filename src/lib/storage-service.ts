import { createClient } from './supabase-client';

const BUCKET_NAME = 'avatars';

export const storageService = {
    /**
     * Upload a file to Supabase Storage
     */
    async uploadFile(file: File, path: string) {
        const supabase = createClient();
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;
        return data;
    },

    /**
     * Get public URL for a file
     */
    getPublicUrl(path: string) {
        const supabase = createClient();
        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(path);

        return data.publicUrl;
    },

    /**
     * Delete a file
     */
    async deleteFile(path: string) {
        const supabase = createClient();
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([path]);

        if (error) throw error;
    },
};
