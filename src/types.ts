export type Recipe = {
  id: string;
  title: string;
  emoji: string;
  timeMin: number;
  goal: string;
  servings: number;
  ingredients: { name: string; have: boolean }[];
  steps: string[];
  substitutions?: string[];
  vegetarian?: boolean;
};

export type FavoriteRecipe = Recipe & { savedAt: number };

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: number;
};

export type Exercise = {
  name: string;
  emoji: string;
  description: string;
  repsOrTime: string;
  alternative?: string;
};

export type Habit = {
  id: string;
  label: string;
  emoji: string;
  custom?: boolean;
};

export type AISettings = {
  apiKey: string;
  model: string;
};

export type View = 'home' | 'recipes' | 'fitbuddy' | 'fitness' | 'habits' | 'favorites' | 'water' | 'steps' | 'nutrition';

export type Gender = 'female' | 'male' | 'neutral';
export type AccentKey = 'blush' | 'sage' | 'amber' | 'choco';

export type UserProfile = {
  name: string;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  skinTone: number;
  hairColor: number;
  accent: AccentKey;
  /** Стислий data-URL власного фото (якщо завантажено користувачем). */
  avatarImage?: string;
};

export type TimeOption = 10 | 20 | 30;
export type GoalOption = 'snack' | 'breakfast' | 'dinner' | 'poststudy';
export type WaterGoal = {
  weightKg: number;
  goalMl: number;
  drunkMl: number;
  date?: string;
  history?: { date: string; value: number }[];
};

export type StepGoal = {
  goal: number;
  steps: number;
  date: string;
  history?: { date: string; value: number }[];
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type NutritionEntry = {
  id: string;
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  meal?: MealType;
};

export type WorkoutSession = {
  id: string;
  ts: number;
  type: string;
  minutes: number;
  exercises: number;
};

export type NutritionLog = {
  date: string;
  goalKcal: number;
  entries: NutritionEntry[];
  history?: { date: string; kcal: number }[];
};
