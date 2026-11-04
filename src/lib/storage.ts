import type {
  AISettings,
  FavoriteRecipe,
  Habit,
  WaterGoal,
  SleepGoal,
  UserProfile,
} from '@/types';

const KEYS = {
  favorites: 'fitstart_favorites',
  habits: 'fitstart_habits',
  habitLog: 'fitstart_habit_log',
  aiSettings: 'fitstart_ai_settings',
  waterGoal: 'fitstart_water_goal',
  sleepGoal: 'fitstart_sleep_goal',
  profile: 'fitstart_profile',
} as const;

const DEFAULT_WATER_GOAL: WaterGoal = {
  weightKg: 70,
  goalMl: 2500,
  drunkMl: 0,
};

const DEFAULT_SLEEP_GOAL: SleepGoal = {
  bedtimeHour: 23,
  bedtimeMinute: 0,
  wakeupHour: 7,
  wakeupMinute: 0,
  sleepTargetMin: 480,
  actualSleepMin: 0,
  sleepLog: [],
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Друг',
  gender: 'neutral',
  heightCm: 170,
  weightKg: 65,
  skinTone: 1,
  hairColor: 0,
  accent: 'blush',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export const storage = {
  getFavorites: () => read<FavoriteRecipe[]>(KEYS.favorites, []),
  setFavorites: (v: FavoriteRecipe[]) => write(KEYS.favorites, v),

  getHabits: () => read<Habit[]>(KEYS.habits, []),
  setHabits: (v: Habit[]) => write(KEYS.habits, v),

  getHabitLog: () => read<Record<string, string[]>>(KEYS.habitLog, {}),
  setHabitLog: (v: Record<string, string[]>) => write(KEYS.habitLog, v),

  getAISettings: () => read<AISettings>(KEYS.aiSettings, { apiKey: '', model: 'nvidia/nemotron-3.5-super-vl:free' }),
  setAISettings: (v: AISettings) => write(KEYS.aiSettings, v),

  getWaterGoal: () => read<WaterGoal>(KEYS.waterGoal, DEFAULT_WATER_GOAL),
  setWaterGoal: (v: WaterGoal) => write(KEYS.waterGoal, v),

  getSleepGoal: () => read<SleepGoal>(KEYS.sleepGoal, DEFAULT_SLEEP_GOAL),
  setSleepGoal: (v: SleepGoal) => write(KEYS.sleepGoal, v),

  getProfile: () => ({ ...DEFAULT_PROFILE, ...read<UserProfile>(KEYS.profile, DEFAULT_PROFILE) }),
  setProfile: (v: UserProfile) => write(KEYS.profile, v),
};

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
