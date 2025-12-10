import { createClient } from './supabase-client';
import { PlayerStats } from './system-types';

export const SYSTEM_CONFIG = {
    // XP Formula: Level N requires floor( 100 * N^1.5 ) XP
    XP_MULTIPLIER: 100,
    XP_EXPONENT: 1.5,

    // Weights for Auto-Calculation
    WEIGHTS: {
        STR: {
            MACHINE_OWN: 5,
            USER_BLOOD: 10,
            SYSTEM_BLOOD: 20
        },
        INT: {
            CHALLENGE_OWN: 3,
            CTF_FLAG: 5
        },
        VIT: {
            LOGIN_DAY: 1,
            MSG_SENT: 0.1
        }
    }
};

export class SystemService {

    /**
     * Calculate Level from Total XP
     */
    static calculateLevel(xp: number): number {
        // Reverse of: XP = 100 * Level^1.5
        // Level = (XP / 100)^(1/1.5)
        if (xp < 100) return 1;
        return Math.floor(Math.pow(xp / SYSTEM_CONFIG.XP_MULTIPLIER, 1 / SYSTEM_CONFIG.XP_EXPONENT));
    }

    /**
     * Calculate XP required for next level
     */
    static xpForNextLevel(currentLevel: number): number {
        return Math.floor(SYSTEM_CONFIG.XP_MULTIPLIER * Math.pow(currentLevel + 1, SYSTEM_CONFIG.XP_EXPONENT));
    }

    /**
     * Auto-calculate stats based on external data (HTB, etc)
     * This implies "The System" is analyzing the player's performance
     */
    static calculateDerivedStats(htbStats: any, activityStats: any): Partial<PlayerStats> {
        // Base stats
        let str = 10;
        let int = 10;
        let vit = 10;

        // STR Calculation (HTB Focus)
        if (htbStats) {
            str += (htbStats.machines_owned || 0) * SYSTEM_CONFIG.WEIGHTS.STR.MACHINE_OWN;
            str += (htbStats.user_bloods || 0) * SYSTEM_CONFIG.WEIGHTS.STR.USER_BLOOD;
            str += (htbStats.system_bloods || 0) * SYSTEM_CONFIG.WEIGHTS.STR.SYSTEM_BLOOD;
        }

        // INT Calculation (Challenges)
        if (htbStats) {
            int += (htbStats.challenges_owned || 0) * SYSTEM_CONFIG.WEIGHTS.INT.CHALLENGE_OWN;
        }

        // Cap stats at reasonable "Human" limits? Or let them go to infinity?
        // Solo Leveling stats go high. Let's cap at 999 for now visually.

        return {
            STR: Math.min(999, Math.floor(str)),
            INT: Math.min(999, Math.floor(int)),
            VIT: Math.min(999, Math.floor(vit)),
            // AGI and SENSE are usually manual or complex
        };
    }
}
