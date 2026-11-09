import { useState, useEffect } from 'react';
import { Droplet, Scale, X } from 'lucide-react';
import type { WaterGoal } from '@/types';
import { storage, todayKey } from '@/lib/storage';

const DEFAULT_WATER_GOAL: WaterGoal = {
  weightKg: 70,
  goalMl: 2500,
  drunkMl: 0,
};

export default function WaterTracker() {
  const [goal, setGoal] = useState<WaterGoal>(() => {
    const stored = storage.getWaterGoal();
    return stored ? stored : DEFAULT_WATER_GOAL;
  });

  useEffect(() => {
    storage.setWaterGoal(goal);
  }, [goal]);

  const calculateNorm = (weight: number): number => {
    // Common formula: 35 ml per kg of body weight
    // Minimum 1500ml, maximum 4000ml
    const raw = weight * 35;
    return Math.max(1500, Math.min(4000, Math.round(raw)));
  };

  const updateGoal = (weight: number) => {
    const newGoal = calculateNorm(weight);
    setGoal(prev => ({
      ...prev,
      weightKg: weight,
      goalMl: newGoal,
      drunkMl: Math.min(newGoal, prev.drunkMl),
    }));
  };

  const addDrunk = (ml: number) => {
    setGoal((prev) => {
      const today = todayKey();
      const newDrunk = prev.drunkMl + ml;
      const history = [...(prev.history ?? [])];
      const idx = history.findIndex((h) => h.date === today);
      if (idx >= 0) history[idx] = { date: today, value: newDrunk };
      else history.push({ date: today, value: newDrunk });
      return { ...prev, drunkMl: newDrunk, history: history.slice(-30) };
    });
  };

  const resetToday = () => {
    setGoal((prev) => {
      const today = todayKey();
      const history = [...(prev.history ?? [])];
      const idx = history.findIndex((h) => h.date === today);
      if (idx >= 0) history[idx] = { date: today, value: 0 };
      else history.push({ date: today, value: 0 });
      return {
        weightKg: prev.weightKg,
        goalMl: calculateNorm(prev.weightKg),
        drunkMl: 0,
        history: history.slice(-30),
      };
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header section */}
      <div className="glass-card p-6 sm:p-8">
        <h1 className="section-title mb-4">Трекер води</h1>
        <p className="text-choco-500 text-sm">
          Норма: <span className="font-semibold text-choco-700">{goal.goalMl} мл</span>
          {' '}при вазі: <span className="font-semibold text-choco-700">{goal.weightKg} кг</span>.
        </p>
      </div>

      {/* Weight input section */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="section-title mb-4">Ваша вага</h2>

        <div className="flex items-center gap-3">
          <Scale size={20} className="text-choco-500" />
          <input
            type="number"
            min={30}
            max={200}
            value={goal.weightKg}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              if (val >= 30 && val <= 200) {
                updateGoal(val);
              }
            }}
            placeholder="ввести кг"
            className="input-field w-32 sm:w-40 text-choco-700 font-medium"
            autoComplete="off"
          />
          <span className="text-xs text-choco-500">кг (30–200)</span>
        </div>

        <p className="mt-3 text-sm text-choco-500">
          {goal.weightKg > 0 && (
            <>
              Денна норма: <span className="ml-1 font-medium text-choco-700">{goal.goalMl} мл</span> (35 мл × кг)
            </>
          )}
        </p>

        {/* Buttons for common weights */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => updateGoal(50)}
            className={`chip ${goal.weightKg === 50 ? 'chip-on' : 'chip-off'}`}
          >
            50 кг
          </button>
          <button
            onClick={() => updateGoal(70)}
            className={`chip ${goal.weightKg === 70 ? 'chip-on' : 'chip-off'}`}
          >
            70 кг
          </button>
          <button
            onClick={() => updateGoal(90)}
            className={`chip ${goal.weightKg === 90 ? 'chip-on' : 'chip-off'}`}
          >
            90 кг
          </button>
        </div>
      </div>

      {/* Progress section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Goal progress */}
        <div className="glass-card p-6">
          <h2 className="section-title mb-3">До норми</h2>
          <div className="flex items-center justify-between mb-3">
            <span className="text-choco-500">Ви випили</span>
            <span className="font-semibold text-choco-700">{goal.drunkMl} мл</span>
          </div>
          <div className="h-8 rounded-full bg-cream-400/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400 transition-all duration-700"
              style={{ width: `${Math.min(100, (goal.drunkMl / goal.goalMl) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-choco-500 mt-2">
            {goal.drunkMl}/${goal.goalMl} мл
            {goal.drunkMl >= goal.goalMl && (
              <span className="ml-2 font-medium text-sage-500">✓ Норму досягнуто!</span>
            )}
          </p>
        </div>

        {/* Quick add buttons */}
        <div className="glass-card p-6">
          <h2 className="section-title mb-3">Швидке додавання</h2>
          <p className="text-choco-500 text-sm mb-3">
            Оберіть об'єм, щоб додати випиту воду:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addDrunk(250)}
              className={`chip ${goal.drunkMl >= goal.goalMl ? 'chip-off' : 'chip-on'}`
              }
            >
              <Droplet size={14} /> 250 мл
            </button>
            <button
              onClick={() => addDrunk(330)}
              className={`chip ${goal.drunkMl >= goal.goalMl ? 'chip-off' : 'chip-on'}`
              }
            >
              <Droplet size={14} /> 330 мл (стандартна пляшка)
            </button>
            <button
              onClick={() => addDrunk(150)}
              className={`chip ${goal.drunkMl >= goal.goalMl ? 'chip-off' : 'chip-on'}`
              }
            >
              <Droplet size={14} /> 150 мл
            </button>
            <button
              onClick={() => addDrunk(500)}
              className={`chip ${goal.drunkMl >= goal.goalMl ? 'chip-off' : 'chip-on'}`
              }
            >
              <Droplet size={14} /> 500 мл
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      {goal.history && goal.history.length > 1 && (
        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-choco-600 mb-3">Останні дні (мл)</p>
          <div className="flex flex-wrap gap-2">
            {goal.history.slice().reverse().map((h) => (
              <span key={h.date} className="rounded-full bg-cream-300/60 px-3 py-1 text-xs text-choco-600">
                {h.date.slice(5)}: {h.value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reset button */}
      {goal.weightKg > 0 && (
        <div className="pt-6 text-right">
          <button
            onClick={resetToday}
            className="btn-soft w-full"
          >
            <X size={18} className="mr-2" /> Скинути прогрес за сьогодні
          </button>
        </div>
      )}
    </div>
  );
}