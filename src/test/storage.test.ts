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
});