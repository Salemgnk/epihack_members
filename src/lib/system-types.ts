export type Rank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type SkillType = 'ACTIVE' | 'PASSIVE';
export type QuestType = 'MAIN' | 'SUB' | 'HIDDEN' | 'Daily';
export type QuestStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface PlayerStats {
    STR: number; // Strength (HTB Power)
    AGI: number; // Agility (Speed)
    INT: number; // Intelligence (CTF Knowledge)
    VIT: number; // Vitality (Activity/Streak)
    SENSE: number; // Sense (Betting/Luck)
}

export interface PlayerAttributes {
    level: number;
    experience: number;
    job_class: string;
    title: string;
    mana: number;
    max_mana: number;
    attributes: PlayerStats;
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    rank: Rank;
    type: SkillType;
    icon: string;
}

export interface UserSkill extends Skill {
    skill_id: string;
    level: number;
    proficiency: number;
    equipped: boolean;
    acquired_at: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: QuestType;
    rank: Rank;
    rewards: {
        points?: number;
        exp?: number;
        items?: string[];
    };
    requirements?: {
        level?: number;
        skills?: string[];
    };
}

export interface UserQuest extends Quest {
    quest_id: string;
    status: QuestStatus;
    progress: any;
    started_at: string;
    completed_at?: string;
}
