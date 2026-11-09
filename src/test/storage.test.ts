import { describe, it, expect, beforeEach } from 'vitest';
import { storage, todayKey } from '@/lib/storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns fallback when empty', () => {
    expect(storage.getFavorites()).toEqual([]);
    expect(storage.getProfile().name).toBe('Друг');
  });

  it('round-trips favorites', () => {
    const fav = [{ id: '1', title: 't', emoji: '🍳', timeMin: 10, goal: 'g', servings: 1, ingredients: [], steps: [], savedAt: 5 }];
    storage.setFavorites(fav as never);
    expect(storage.getFavorites()).toEqual(fav);
  });

  it('todayKey returns YYYY-MM-DD', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('step goal defaults', () => {
    const s = storage.getStepGoal();
    expect(s.goal).toBe(8000);
    expect(s.steps).toBe(0);
  });

  it('round-trips profile photo', () => {
    const p = storage.getProfile();
    storage.setProfile({ ...p, avatarImage: 'data:image/jpeg;base64,AAA' });
    expect(storage.getProfile().avatarImage).toBe('data:image/jpeg;base64,AAA');
  });

  it('resets drunk water on a new day and keeps weight norm', () => {
    const today = todayKey();
    storage.setWaterGoal({ weightKg: 70, goalMl: 2450, drunkMl: 1500, date: '2000-01-01' });
    const w = storage.getWaterGoal();
    expect(w.drunkMl).toBe(0);
    expect(w.date).toBe(today);
    expect(w.goalMl).toBe(2450);
  });

  it('archives yesterday calories into history and starts a fresh log', () => {
    storage.setNutritionLog({
      date: '2000-01-01',
      goalKcal: 2000,
      entries: [{ id: '1', name: 'rice', grams: 100, kcal: 300, protein: 6, carbs: 70, fat: 1 }],
      history: [],
    });
    const log = storage.getNutritionLog();
    expect(log.date).toBe(todayKey());
    expect(log.entries).toEqual([]);
    expect(log.history).toEqual([{ date: '2000-01-01', kcal: 300 }]);
  });
});