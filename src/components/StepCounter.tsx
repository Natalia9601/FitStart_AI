import { useState, useEffect, useRef } from 'react';
import { Footprints, Plus, RotateCcw, Target, Play, Square } from 'lucide-react';
import type { StepGoal } from '@/types';
import { storage, todayKey } from '@/lib/storage';

const DEFAULT_GOAL = 8000;

export default function StepCounter() {
  const [autoOn, setAutoOn] = useState(false);
  const [autoStatus, setAutoStatus] = useState<string>('');
  const lastPeakRef = useRef<number>(0);
  const autoCountRef = useRef<number>(0);

  const [data, setData] = useState<StepGoal>(() => {
    const stored = storage.getStepGoal();
    const today = todayKey();
    if (!stored || stored.date !== today) {
      return { goal: stored?.goal ?? DEFAULT_GOAL, steps: 0, date: today };
    }
    return stored;
  });

  const addSteps = (n: number) => {
    setData((prev) => {
      const today = todayKey();
      const base = prev.date !== today ? 0 : prev.steps;
      const newSteps = base + n;
      const history = [...(prev.history ?? [])];
      const idx = history.findIndex((h) => h.date === today);
      if (idx >= 0) history[idx] = { date: today, value: newSteps };
      else history.push({ date: today, value: newSteps });
      const trimmed = history.slice(-30);
      return { ...prev, steps: newSteps, date: today, history: trimmed };
    });
  };

  useEffect(() => {
    storage.setStepGoal(data);
  }, [data]);

  useEffect(() => {
    if (!autoOn) return;
    if (typeof DeviceMotionEvent === 'undefined') {
      setAutoStatus('Датчик руху недоступний у цьому браузері.');
      setAutoOn(false);
      return;
    }

    // iOS permission
    const req = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
    if (typeof req === 'function') {
      req().then((state) => {
        if (state !== 'granted') {
          setAutoStatus('Доступ до датчика не надано.');
          setAutoOn(false);
        }
      }).catch(() => {
        setAutoStatus('Не вдалося отримати доступ до датчика.');
        setAutoOn(false);
      });
    }

    const THRESHOLD = 12;
    const COOLDOWN = 300;
    const handler = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;
      const mag = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (mag > THRESHOLD && now - lastPeakRef.current > COOLDOWN) {
        lastPeakRef.current = now;
        autoCountRef.current += 1;
        addSteps(1);
      }
    };
    window.addEventListener('devicemotion', handler);
    setAutoStatus('Автовідлік увімкнено. Рухайтесь.');
    return () => {
      window.removeEventListener('devicemotion', handler);
      setAutoStatus('Автовідлік зупинено.');
    };
  }, [autoOn]);

  const goal = Math.max(data.goal, 1);
  const progress = Math.min(100, Math.round((data.steps / goal) * 100));

  const setGoal = (g: number) => {
    if (g < 1000 || g > 50000) return;
    setData((prev) => ({ ...prev, goal: g }));
  };

  const resetToday = () => {
    setData((prev) => {
      const today = todayKey();
      const history = [...(prev.history ?? [])];
      const idx = history.findIndex((h) => h.date === today);
      if (idx >= 0) history[idx] = { date: today, value: 0 };
      else history.push({ date: today, value: 0 });
      return { ...prev, steps: 0, date: today, history: history.slice(-30) };
    });
  };

  const presets = [500, 1000, 2000, 5000];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="grid place-items-center w-11 h-11 rounded-2xl bg-sage-200/70 text-sage-500">
            <Footprints size={22} />
          </div>
          <div>
            <h1 className="section-title mb-0">Крокомір</h1>
            <p className="text-choco-500 text-sm">Рахуй кроки за день — без тиску, просто для орієнтиру</p>
          </div>
        </div>
      </div>

      {/* Goal + progress */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-choco-500" />
            <span className="text-sm font-semibold text-choco-600">Ціль на день</span>
          </div>
          <div className="flex items-center gap-2">
            {[6000, 8000, 10000].map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`chip ${data.goal === g ? 'chip-on' : 'chip-off'}`}
              >
                {g.toLocaleString('uk-UA')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 items-center">
          {/* Ring */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative grid place-items-center">
              <svg viewBox="0 0 160 160" className="w-32 h-32 sm:w-40 sm:h-40 -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#EDE0D4" strokeWidth="12" />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="#C97A8A"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 - (progress / 100) * 2 * Math.PI * 70}
                  style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-display text-3xl text-choco-700">{progress}%</p>
                <p className="text-xs text-choco-400">виконано</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-choco-600 font-medium">
              {data.steps.toLocaleString('uk-UA')} / {goal.toLocaleString('uk-UA')} кроків
            </p>
          </div>

          {/* Manual add */}
          <div className="space-y-4">
            <p className="text-sm text-choco-500">
              Додай кроки вручну або обери швидке додавання:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => addSteps(p)}
                  className="chip chip-on justify-center"
                >
                  <Plus size={14} /> {p.toLocaleString('uk-UA')}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                placeholder="Власна кількість"
                className="input-field flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (val > 0) {
                      addSteps(val);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  const val = parseInt(input.value, 10);
                  if (val > 0) {
                    addSteps(val);
                    input.value = '';
                  }
                }}
                className="btn-primary !px-4 !py-3 shrink-0"
              >
                <Plus size={18} />
              </button>
            </div>
            {data.steps >= goal && (
              <p className="text-sm font-medium text-sage-500">🎉 Ціль на сьогодні досягнута!</p>
            )}
          </div>
        </div>
      </div>

      {/* Auto tracking */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-choco-600">Автовідлік (датчик руху)</p>
            <p className="text-xs text-choco-400 mt-1">
              {autoStatus || 'Увімкніть, щоб рахувати кроки автоматично на пристроях з акселерометром.'}
            </p>
          </div>
          <button
            onClick={() => setAutoOn((v) => !v)}
            className={autoOn ? 'btn-soft' : 'btn-primary'}
          >
            {autoOn ? <><Square size={16} /> Зупинити</> : <><Play size={16} /> Запустити</>}
          </button>
        </div>
      </div>

      {/* History */}
      {data.history && data.history.length > 1 && (
        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-choco-600 mb-3">Останні дні</p>
          <div className="flex flex-wrap gap-2">
            {data.history.slice().reverse().map((h) => (
              <span key={h.date} className="rounded-full bg-cream-300/60 px-3 py-1 text-xs text-choco-600">
                {h.date.slice(5)}: {h.value.toLocaleString('uk-UA')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <div className="text-right">
        <button onClick={resetToday} className="btn-soft">
          <RotateCcw size={16} /> Скинути кроки за сьогодні
        </button>
      </div>

      <p className="text-xs text-choco-400 text-center">
        Дані зберігаються у браузері. Якщо пристрій підтримує датчик кроків, можна підключити автовідлік у майбутньому.
      </p>
    </div>
  );
}
