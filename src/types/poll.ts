/** Poll option stored in polls.options JSONB */
export type PollOption = {
  id: number;
  text: string;
};

export type PollTheme = "animal_race" | "dark" | "light" | "game" | "party";

export type ThemeTier = "free" | "pro";

export type ThemeDefinition = {
  value: PollTheme;
  label: string;
  tier: ThemeTier;
  /** Pro themes free users can still try */
  freeTrialAllowed?: boolean;
};

/** 1 | 3 | 5 | 10 | 12 | -1 (Unlimited) */
export type MaxVotesPerUser = 1 | 3 | 5 | 10 | 12 | -1;

export const MAX_VOTES_OPTIONS: { value: MaxVotesPerUser; label: string }[] = [
  { value: 1, label: "1 Vote" },
  { value: 3, label: "3 Votes" },
  { value: 5, label: "5 Votes (Default)" },
  { value: 10, label: "10 Votes" },
  { value: 12, label: "12 Votes" },
  { value: -1, label: "Unlimited" },
];

/** Free: dark/light/game/party · Pro: animal_race (Free Trial allowed) */
export const THEME_DEFINITIONS: ThemeDefinition[] = [
  { value: "dark", label: "Minimal Dark", tier: "free" },
  { value: "light", label: "Light Mode", tier: "free" },
  { value: "game", label: "Game Mode", tier: "free" },
  { value: "party", label: "Party Mode", tier: "free" },
  {
    value: "animal_race",
    label: "Animal Race 🦊",
    tier: "pro",
    freeTrialAllowed: true,
  },
];

export const THEME_OPTIONS: { value: PollTheme; label: string }[] =
  THEME_DEFINITIONS.map(({ value, label }) => ({ value, label }));

export const FREE_THEMES = THEME_DEFINITIONS.filter((t) => t.tier === "free").map(
  (t) => t.value,
);

export const PRO_THEMES = THEME_DEFINITIONS.filter((t) => t.tier === "pro").map(
  (t) => t.value,
);

export const ANIMAL_ICONS = ["🐶", "🐱", "🐰", "🦊", "🐻"] as const;

export type Poll = {
  id: string;
  user_id: string | null;
  title: string;
  options: PollOption[];
  theme: PollTheme;
  max_votes_per_user: number;
  is_closed: boolean;
  enable_super_votes: boolean;
  manual_votes: Record<string, number>;
  custom_mascot_url: string | null;
  question_number: number;
  created_at: string;
};

export type Vote = {
  id: string;
  poll_id: string;
  option_id: number;
  voter_fingerprint: string | null;
  created_at: string;
};

export type PaidVote = {
  id: string;
  poll_id: string;
  option_id: number;
  vote_count: number;
  amount_cents: number;
  supporter_name: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
};

export type CreatePollInput = {
  title: string;
  options: PollOption[];
  max_votes_per_user: MaxVotesPerUser;
  theme: PollTheme;
};

/** Aggregated counts keyed by option id */
export type VoteCounts = Record<number, number>;
