import type {
  AISettings,
  FavoriteRecipe,
  Habit,
  WaterGoal,
  StepGoal,
  NutritionLog,
  WorkoutSession,
  ChatMessage,
  UserProfile,
} from '@/types';

const KEYS = {
  favorites: 'fitstart_favorites',
  habits: 'fitstart_habits',
  habitLog: 'fitstart_habit_log',
  aiSettings: 'fitstart_ai_settings',
  waterGoal: 'fitstart_water_goal',
  stepGoal: 'fitstart_step_goal',
  nutritionLog: 'fitstart_nutrition_log',
  workoutLog: 'fitstart_workout_log',
  chat: 'fitstart_chat',
  profile: 'fitstart_profile',
} as const;

const DEFAULT_WATER_GOAL: WaterGoal = {
  weightKg: 70,
  goalMl: 2500,
  drunkMl: 0,
};

const DEFAULT_STEP_GOAL: StepGoal = {
  goal: 8000,
  steps: 0,
  date: new Date().toISOString().slice(0, 10),
};

const DEFAULT_NUTRITION_LOG: NutritionLog = {
  date: new Date().toISOString().slice(0, 10),
  goalKcal: 2000,
  entries: [],
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
  } catch (e) {
    console.warn('Не вдалося зберегти дані в localStorage:', e);
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

  getWaterGoal: () => {
    const stored = read<WaterGoal>(KEYS.waterGoal, DEFAULT_WATER_GOAL);
    const local = todayKey();
    if (stored.date !== local) return { ...stored, drunkMl: 0, date: local };
    return stored;
  },
  setWaterGoal: (v: WaterGoal) => write(KEYS.waterGoal, v),

  getStepGoal: () => read<StepGoal>(KEYS.stepGoal, DEFAULT_STEP_GOAL),
  setStepGoal: (v: StepGoal) => write(KEYS.stepGoal, v),

  getNutritionLog: () => {
    const stored = read<NutritionLog>(KEYS.nutritionLog, DEFAULT_NUTRITION_LOG);
    const local = todayKey();
    const history = [...(stored.history ?? [])];
    if (stored.date !== local && stored.entries?.length) {
      const kcal = stored.entries.reduce((sum, e) => sum + e.kcal, 0);
      const idx = history.findIndex((h) => h.date === stored.date);
      if (idx >= 0) history[idx] = { date: stored.date, kcal };
      else history.push({ date: stored.date, kcal });
    }
    if (stored.date !== local) {
      return {
        date: local,
        goalKcal: stored.goalKcal ?? DEFAULT_NUTRITION_LOG.goalKcal,
        entries: [],
        history: history.slice(-30),
      };
    }
    return { ...stored, history };
  },
  setNutritionLog: (v: NutritionLog) => write(KEYS.nutritionLog, v),

  getWorkoutLog: () => read<WorkoutSession[]>(KEYS.workoutLog, []),
  setWorkoutLog: (v: WorkoutSession[]) => write(KEYS.workoutLog, v),

  getChat: () => read<ChatMessage[]>(KEYS.chat, []),
  setChat: (v: ChatMessage[]) => write(KEYS.chat, v),

  getProfile: () => ({ ...DEFAULT_PROFILE, ...read<UserProfile>(KEYS.profile, DEFAULT_PROFILE) }),
  setProfile: (v: UserProfile) => write(KEYS.profile, v),
};

export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
