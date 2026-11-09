import { describe, it, expect } from 'vitest';
import { habitStreak, dayKey, lastNDays } from '@/lib/streak';

function keyOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return dayKey(d);
}

describe('streak', () => {
  it('returns 0 when no habits configured', () => {
    expect(habitStreak({ [keyOffset(0)]: ['a'] }, 0)).toBe(0);
  });

  it('counts consecutive days with completed habits', () => {
    const log = {
      [keyOffset(0)]: ['a'],
      [keyOffset(1)]: ['a'],
      [keyOffset(2)]: ['a'],
    };
    expect(habitStreak(log, 1)).toBe(3);
  });

  it('skips an empty today instead of resetting the streak', () => {
    const log = {
      [keyOffset(1)]: ['a'],
      [keyOffset(2)]: ['a'],
    };
    expect(habitStreak(log, 1)).toBe(2);
  });

  it('breaks the streak after a day with no habits', () => {
    const log = {
      [keyOffset(0)]: ['a'],
      [keyOffset(2)]: ['a'],
    };
    expect(habitStreak(log, 1)).toBe(1);
  });

  it('lastNDays returns ordered consecutive dates ending today', () => {
    const days = lastNDays(7);
    expect(days).toHaveLength(7);
    expect(days[6].key).toBe(dayKey(new Date()));
  });
});
