export interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  is_public: boolean;
  category: {
    name: string;
    icon?: string;
  } | null;
  is_active: boolean;
  is_meta: boolean;
  external_url?: string | null;
  hints?: string | null;
}
