/**
 * Scoreboard data types for the internal scoreboard feature
 */

export interface ScoreboardEntry {
  rank: number;
  memberId: string;
  displayName: string;
  avatarUrl: string;
  totalPoints: number;
  level: number;
  recentActivity: {
    challengesSolved: number;
    lastActive: Date;
  };
}

export interface ScoreboardCacheRow {
  id: string;
  member_id: string;
  rank: number;
  total_points: number;
  challenges_solved_today: number;
  last_updated: Date;
}

export interface ScoreboardUpdateEvent {
  type: 'scoreboard_update';
  timestamp: Date;
  entries: ScoreboardEntry[];
}
