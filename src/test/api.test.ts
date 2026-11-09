import { describe, it, expect, beforeEach } from 'vitest';
import { generateRecipes, generateWorkout, testConnection, isAIReady } from '@/lib/api';

describe('api', () => {
  beforeEach(() => localStorage.clear());

  it('isAIReady false for empty key', () => {
    expect(isAIReady({ apiKey: '', model: 'm' })).toBe(false);
    expect(isAIReady({ apiKey: 'short', model: 'm' })).toBe(false);
  });

  it('isAIReady true for long key', () => {
    expect(isAIReady({ apiKey: '1234567890123', model: 'm' })).toBe(true);
  });

  it('generateRecipes returns mock when no key', async () => {
    const res = await generateRecipes({ apiKey: '', model: 'm' }, 'яйця', 10, 'breakfast', []);
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it('generateWorkout returns mock when no key', async () => {
    const res = await generateWorkout({ apiKey: '', model: 'm' }, 10, 'warmup', 'room', 'easy');
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBeGreaterThan(0);
  });

  it('testConnection fails for empty key', async () => {
    const r = await testConnection({ apiKey: '', model: 'm' });
    expect(r.ok).toBe(false);
  });
});