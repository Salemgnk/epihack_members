import { createClient } from './supabase-client';

export const likesService = {
    /**
     * Toggle like on a resource
     */
    async toggleLike(resourceType: string, resourceId: string, userId: string) {
        const supabase = createClient();

        // Check if already liked
        const { data: existing } = await supabase
            .from('likes')
            .select('id')
            .eq('resource_type', resourceType)
            .eq('resource_id', resourceId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Unlike
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('id', existing.id);

            if (error) throw error;
            return false;
        } else {
            // Like
            const { error } = await supabase
                .from('likes')
                .insert({
                    resource_type: resourceType,
                    resource_id: resourceId,
                    user_id: userId,
                });

            if (error) throw error;
            return true;
        }
    },

    /**
     * Get likes count for a resource
     */
    async getLikesCount(resourceType: string, resourceId: string) {
        const supabase = createClient();
        const { count } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('resource_type', resourceType)
            .eq('resource_id', resourceId);

        return count || 0;
    },

    /**
     * Check if user liked a resource
     */
    async hasUserLiked(resourceType: string, resourceId: string, userId: string) {
        const supabase = createClient();
        const { data } = await supabase
            .from('likes')
            .select('id')
            .eq('resource_type', resourceType)
            .eq('resource_id', resourceId)
            .eq('user_id', userId)
            .single();

        return !!data;
    },
};
