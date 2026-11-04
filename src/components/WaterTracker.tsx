import { useState, useEffect } from 'react';
import { Droplet, Scale, X } from 'lucide-react';
import type { WaterGoal } from '@/types';
import { storage } from '@/lib/storage';

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
    setGoal(prev => ({
      ...prev,
      drunkMl: Math.min(goal.goalMl, goal.drunkMl + ml),
    }));
  };

  const resetToday = () => {
    setGoal({
      weightKg: goal.weightKg,
      goalMl: calculateNorm(goal.weightKg),
      drunkMl: 0,
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
          <span className="text-xs text-choco-500">кг</span>
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
              className="h-full rounded-full bg-gradient-to-r from-sage-400 via-sage-500 to-sage-600 transition-all duration-700"
              style={{ width: `${(goal.drunkMl / goal.goalMl) * 100}%` }}
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
            Швидке додавання:
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