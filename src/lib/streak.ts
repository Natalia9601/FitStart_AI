export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Days in a row with at least one completed habit.
 * Today is skipped when empty, so an unfinished day doesn't reset the streak until it's over.
 */
export function habitStreak(log: Record<string, string[]>, total: number): number {
  if (!total) return 0;
  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const count = log[dayKey(d)]?.length ?? 0;
    if (count > 0) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

export function lastNDays(n: number): { key: string; label: string; date: Date }[] {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return { key: dayKey(d), label: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()], date: d };
  });
}
