/**
 * Scoreboard Service
 * Handles fetching and managing scoreboard data
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Type definitions
export interface ScoreboardEntry {
  rank: number;
  memberId: string;
  displayName: string;
  avatarUrl: string | null;
  totalPoints: number;
  level: number;
  htbStats?: {
    rank: string;
    user_owns: number;
    system_owns: number;
    user_bloods: number;
    system_bloods: number;
    respects: number;
  };
}

export interface ScoreboardCacheRow {
  id: string;
  member_id: string;
  rank: number;
  total_points: number;
  challenges_solved_today: number;
  last_updated: string;
}

interface ScoreboardCacheWithProfile {
  id: string;
  member_id: string;
  rank: number;
  total_points: number;
  challenges_solved_today: number;
  last_updated: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    updated_at: string;
  }[] | null;
}

/**
 * Calculate level from total points
 * Level formula: level = floor(sqrt(points / 100))
 */
export function calculateLevel(points: number): number {
  return Math.floor(Math.sqrt(points / 100));
}

/**
 * Fetch scoreboard entries from the cache
 */
export async function fetchScoreboardEntries(limit: number = 10): Promise<ScoreboardEntry[]> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch from scoreboard_cache joined with profiles
  const { data, error } = await supabase
    .from('scoreboard_cache')
    .select(`
      id,
      member_id,
      rank,
      total_points,
      challenges_solved_today,
      last_updated,
      profiles:member_id (
        username,
        display_name,
        avatar_url,
        updated_at
      )
    `)
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching scoreboard:', error);
    throw new Error(`Failed to fetch scoreboard: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  // Transform to ScoreboardEntry format
  return data.map((row: ScoreboardCacheWithProfile) => {
    // Supabase retourne profiles comme un tableau, prends le premier élément
    const profile = row.profiles?.[0] || null;

    return {
      rank: row.rank,
      memberId: row.member_id,
      displayName: profile?.display_name || profile?.username || 'Unknown',
      avatarUrl: profile?.avatar_url || '/assets/logo.png',
      totalPoints: row.total_points,
      level: calculateLevel(row.total_points),
      recentActivity: {
        challengesSolved: row.challenges_solved_today,
        lastActive: new Date(profile?.updated_at || row.last_updated),
      },
    };
  });
}

/**
 * Verify scoreboard ranking consistency
 * For any two entries, if entry A has more points than entry B,
 * then entry A's rank should be lower (better) than entry B's rank
 */
export function verifyRankingConsistency(entries: ScoreboardEntry[]): boolean {
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const entryA = entries[i];
      const entryB = entries[j];

      // If A has more points than B, A's rank should be lower (better)
      if (entryA.totalPoints > entryB.totalPoints) {
        if (entryA.rank >= entryB.rank) {
          return false;
        }
      }
      // If B has more points than A, B's rank should be lower (better)
      else if (entryB.totalPoints > entryA.totalPoints) {
        if (entryB.rank >= entryA.rank) {
          return false;
        }
      }
      // If points are equal, ranks can be in any order (tie-breaking by other criteria)
    }
  }

  return true;
}

/**
 * Sort scoreboard entries by rank
 */
export function sortByRank(entries: ScoreboardEntry[]): ScoreboardEntry[] {
  return [...entries].sort((a, b) => a.rank - b.rank);
}

/**
 * Compute rankings from raw data
 * This is used for testing and validation
 */
export function computeRankings(entries: Array<{ memberId: string; totalPoints: number }>): Array<{ memberId: string; rank: number; totalPoints: number }> {
  // Sort by points descending
  const sorted = [...entries].sort((a, b) => b.totalPoints - a.totalPoints);

  // Assign ranks
  return sorted.map((entry, index) => ({
    memberId: entry.memberId,
    rank: index + 1,
    totalPoints: entry.totalPoints,
  }));
}
