import { useState } from 'react';
import { Plus, X, Check, Flame } from 'lucide-react';
import type { Habit } from '@/types';
import { storage, todayKey } from '@/lib/storage';

type Props = {
  habits: Habit[];
  onHabitsChange: (h: Habit[]) => void;
};

const EMOJI_CHOICES = ['🥗', '🚶', '😴', '🧘', '💧', '🍎', '📖', '🤸', '☀️', '🧹'];

export default function Habits({ habits, onHabitsChange }: Props) {
  const [log, setLog] = useState<Record<string, string[]>>(storage.getHabitLog());
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('⭐');

  const today = todayKey();
  const doneToday = log[today] ?? [];

  function toggleHabit(id: string) {
    const current = log[today] ?? [];
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    const newLog = { ...log, [today]: updated };
    setLog(newLog);
    storage.setHabitLog(newLog);
  }

  function addHabit() {
    if (!newLabel.trim()) return;
    const h: Habit = {
      id: `custom-${Date.now()}`,
      label: newLabel.trim(),
      emoji: newEmoji,
      custom: true,
    };
    onHabitsChange([...habits, h]);
    setNewLabel('');
    setNewEmoji('⭐');
    setAdding(false);
  }

  function removeHabit(id: string) {
    onHabitsChange(habits.filter((h) => h.id !== id));
    const current = log[today] ?? [];
    if (current.includes(id)) {
      const updated = current.filter((x) => x !== id);
      const newLog = { ...log, [today]: updated };
      setLog(newLog);
      storage.setHabitLog(newLog);
    }
  }

  const progress = habits.length ? Math.round((doneToday.length / habits.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title mb-1">Щоденні звички</h1>
          <p className="text-choco-500">Простий чек-лист на день — без покарань і провини</p>
        </div>
        <button onClick={() => setAdding((a) => !a)} className="btn-soft">
          <Plus size={18} /> Додати звичку
        </button>
      </div>

      {/* Progress card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center w-10 h-10 rounded-2xl bg-sage-200/70 text-sage-500">
              <Flame size={20} />
            </div>
            <div>
              <p className="font-semibold text-choco-700 text-sm">Прогрес за сьогодні</p>
              <p className="text-xs text-choco-400">{doneToday.length} з {habits.length} виконано</p>
            </div>
          </div>
          <span className="font-display text-3xl text-choco-700">{progress}%</span>
        </div>
        <div className="h-3 rounded-full bg-cream-400/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sage-300 via-sage-400 to-sage-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="glass-card p-5 space-y-4 animate-scale-in">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-choco-700">Нова звичка</h2>
            <button onClick={() => setAdding(false)} className="btn-ghost !p-2">
              <X size={18} />
            </button>
          </div>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Наприклад: 10 хвилин читання"
            className="input-field"
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            autoFocus
          />
          <div>
            <span className="text-sm font-medium text-choco-600 mb-2 block">Оберіть іконку</span>
            <div className="flex flex-wrap gap-2">
              {EMOJI_CHOICES.map((e) => (
                <button
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  className={`w-10 h-10 grid place-items-center rounded-xl text-lg transition-all ${
                    newEmoji === e ? 'bg-choco-500 scale-110 shadow-soft' : 'bg-cream-300/50 hover:bg-cream-400/50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <button onClick={addHabit} disabled={!newLabel.trim()} className="btn-primary w-full">
            <Plus size={18} /> Додати
          </button>
        </div>
      )}

      {/* Habits list */}
      <div className="grid sm:grid-cols-2 gap-3">
        {habits.map((h, idx) => {
          const done = doneToday.includes(h.id);
          return (
            <div
              key={h.id}
              className={`group flex items-center gap-3 rounded-3xl p-4 transition-all duration-300 animate-fade-up ${
                done
                  ? 'bg-sage-200/50 border border-sage-300/40'
                  : 'glass-card'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <button
                onClick={() => toggleHabit(h.id)}
                className={`grid place-items-center w-11 h-11 rounded-2xl shrink-0 transition-all duration-300 active:scale-90 ${
                  done
                    ? 'bg-sage-400 text-cream-100 shadow-soft'
                    : 'bg-cream-300/50 text-choco-400 hover:bg-cream-400/60'
                }`}
                aria-label={done ? 'Скасувати' : 'Виконати'}
              >
                <Check size={20} className={done ? 'scale-100' : 'scale-0'} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{h.emoji}</span>
                  <p className={`font-medium text-sm ${done ? 'text-sage-500 line-through' : 'text-choco-700'}`}>
                    {h.label}
                  </p>
                </div>
              </div>
              {h.custom && (
                <button
                  onClick={() => removeHabit(h.id)}
                  className="opacity-0 group-hover:opacity-100 text-choco-400 hover:text-blush-600 transition-all p-1.5"
                  aria-label="Видалити звичку"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {habits.length === 0 && !adding && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-5xl mb-3">🌱</div>
          <p className="text-choco-500 mb-4">Ще немає звичок. Додай свою першу!</p>
          <button onClick={() => setAdding(true)} className="btn-soft">
            <Plus size={18} /> Додати звичку
          </button>
        </div>
      )}
    </div>
  );
}
