import { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, Trash2, Flame } from 'lucide-react';
import type { NutritionEntry, NutritionLog } from '@/types';
import { storage, todayKey } from '@/lib/storage';
import type { AISettings } from '@/types';
import { FOODS, findFood } from '@/lib/foods';
import { estimateFood } from '@/lib/api';

type Props = { settings: AISettings };

export default function NutritionTracker({ settings }: Props) {
  const [log, setLog] = useState<NutritionLog>(() => storage.getNutritionLog());

  useEffect(() => {
    storage.setNutritionLog(log);
  }, [log]);

  const [name, setName] = useState('');
  const [grams, setGrams] = useState<number>(100);
  const [manual, setManual] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [mKcal, setMKcal] = useState<number>(0);
  const [mP, setMP] = useState<number>(0);
  const [mC, setMC] = useState<number>(0);
  const [mF, setMF] = useState<number>(0);

  const food = findFood(name);

  function resetForm() {
    setName('');
    setGrams(100);
    setManual(false);
    setLookupError('');
    setMKcal(0);
    setMP(0);
    setMC(0);
    setMF(0);
  }

  async function handleLookup() {
    const q = name.trim();
    if (!q) return;
    const local = findFood(q);
    if (local) {
      setMKcal(local.kcal);
      setMP(local.protein);
      setMC(local.carbs);
      setMF(local.fat);
      setManual(true);
      setLookupError('');
      return;
    }
    if (!settings.apiKey || settings.apiKey.trim().length <= 10) {
      setLookupError('Вкажіть API-ключ у налаштуваннях AI, щоб визначати автоматично.');
      setManual(true);
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    const est = await estimateFood(settings, q);
    setLookupLoading(false);
    if (est) {
      setMKcal(est.kcal);
      setMP(est.protein);
      setMC(est.carbs);
      setMF(est.fat);
      setManual(true);
    } else {
      setLookupError('Не вдалося визначити. Введіть КБЖУ вручну.');
      setManual(true);
    }
  }

  function handleAdd() {
    const n = name.trim();
    if (!n || grams <= 0) return;
    let kcal100 = 0, p100 = 0, c100 = 0, f100 = 0;
    if (food && (!manual || (mKcal === 0 && mP === 0 && mC === 0 && mF === 0))) {
      kcal100 = food.kcal; p100 = food.protein; c100 = food.carbs; f100 = food.fat;
    } else {
      kcal100 = mKcal; p100 = mP; c100 = mC; f100 = mF;
    }
    const factor = grams / 100;
    const entry: NutritionEntry = {
      id: `n-${Date.now()}`,
      name: n,
      grams,
      kcal: Math.round(kcal100 * factor),
      protein: Math.round(p100 * factor * 10) / 10,
      carbs: Math.round(c100 * factor * 10) / 10,
      fat: Math.round(f100 * factor * 10) / 10,
    };
    setLog((prev) => {
      const today = todayKey();
      const base = prev.date !== today ? { date: today, goalKcal: prev.goalKcal, entries: [] } : prev;
      return { ...base, entries: [...base.entries, entry] };
    });
    resetForm();
  }

  function removeEntry(id: string) {
    setLog((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
  }

  function resetDay() {
    setLog((prev) => ({ date: todayKey(), goalKcal: prev.goalKcal, entries: [] }));
  }

  const totals = log.entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: Math.round((acc.protein + e.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + e.carbs) * 10) / 10,
      fat: Math.round((acc.fat + e.fat) * 10) / 10,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const progress = Math.min(100, Math.round((totals.kcal / Math.max(log.goalKcal, 1)) * 100));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="grid place-items-center w-11 h-11 rounded-2xl bg-amber-soft/60 text-choco-600">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <h1 className="section-title mb-0">Калорії та КБЖУ</h1>
            <p className="text-choco-500 text-sm">Записуй, що з'їв — рахуй калорії, білки, вуглеводи та жири</p>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-choco-500" />
            <span className="text-sm font-semibold text-choco-600">Ціль на день</span>
          </div>
          <div className="flex items-center gap-2">
            {[1500, 2000, 2500].map((g) => (
              <button
                key={g}
                onClick={() => setLog((prev) => ({ ...prev, goalKcal: g }))}
                className={`chip ${log.goalKcal === g ? 'chip-on' : 'chip-off'}`}
              >
                {g} ккал
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="rounded-2xl bg-cream-300/40 p-3 text-center">
            <p className="text-xs text-choco-400">Калорії</p>
            <p className="font-display text-xl text-choco-700">{totals.kcal}</p>
            <p className="text-xs text-choco-400">з {log.goalKcal}</p>
          </div>
          <div className="rounded-2xl bg-cream-300/40 p-3 text-center">
            <p className="text-xs text-choco-400">Білки</p>
            <p className="font-display text-xl text-choco-700">{totals.protein} г</p>
          </div>
          <div className="rounded-2xl bg-cream-300/40 p-3 text-center">
            <p className="text-xs text-choco-400">Вуглеводи</p>
            <p className="font-display text-xl text-choco-700">{totals.carbs} г</p>
          </div>
          <div className="rounded-2xl bg-cream-300/40 p-3 text-center">
            <p className="text-xs text-choco-400">Жири</p>
            <p className="font-display text-xl text-choco-700">{totals.fat} г</p>
          </div>
        </div>

        <div className="h-3 rounded-full bg-cream-400/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-coral-300 via-coral-400 to-coral-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        {totals.kcal >= log.goalKcal && (
          <p className="text-sm font-medium text-sage-500 mt-2">✓ Ціль на день досягнута!</p>
        )}
      </div>

      {/* Add form */}
      <div className="glass-card p-6 sm:p-8 space-y-4">
        <h2 className="section-title mb-2">Додати продукт</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-choco-600 mb-2">Назва продукту</label>
            <input
              list="food-list"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Напр.: яйця, рис, куряча грудка"
              className="input-field"
            />
            <datalist id="food-list">
              {FOODS.map((f) => (
                <option key={f.name} value={f.name} />
              ))}
            </datalist>
            {food && !manual && (
              <p className="text-xs text-sage-500 mt-1">
                Знайдено в базі: {food.kcal} ккал, Б{food.protein} В{food.carbs} Ж{food.fat} на 100 г
              </p>
            )}
            {!food && name.trim() && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={lookupLoading}
                  className="btn-soft !py-1.5 !px-3 text-xs"
                >
                  {lookupLoading ? 'Визначаю…' : 'Визначити автоматично'}
                </button>
                {lookupError && <span className="text-xs text-blush-600">{lookupError}</span>}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-choco-600 mb-2">Вага (грами)</label>
            <input
              type="number"
              min={1}
              value={grams}
              onChange={(e) => setGrams(parseFloat(e.target.value) || 0)}
              className="input-field"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-choco-600 cursor-pointer">
          <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
          Ввести КБЖУ вручну (на 100 г)
        </label>

        {manual && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-choco-500 mb-1">ккал/100г</label>
              <input type="number" min={0} value={mKcal} onChange={(e) => setMKcal(parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-choco-500 mb-1">Білки/100г</label>
              <input type="number" min={0} value={mP} onChange={(e) => setMP(parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-choco-500 mb-1">Вуглеводи/100г</label>
              <input type="number" min={0} value={mC} onChange={(e) => setMC(parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-choco-500 mb-1">Жири/100г</label>
              <input type="number" min={0} value={mF} onChange={(e) => setMF(parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!name.trim() || grams <= 0 || (manual && mKcal <= 0 && mP <= 0 && mC <= 0 && mF <= 0)}
          className="btn-primary w-full"
        >
          <Plus size={18} /> Додати
        </button>
      </div>

      {/* Entries list */}
      {log.entries.length > 0 && (
        <div className="glass-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">З'їдено сьогодні</h2>
            <button onClick={resetDay} className="btn-soft text-sm">
              <Trash2 size={16} /> Очистити день
            </button>
          </div>
          <div className="space-y-2">
            {log.entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream-300/40 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-choco-700 truncate">{e.name} — {e.grams} г</p>
                  <p className="text-xs text-choco-400">
                    {e.kcal} ккал · Б{e.protein} · В{e.carbs} · Ж{e.fat}
                  </p>
                </div>
                <button
                  onClick={() => removeEntry(e.id)}
                  className="text-choco-400 hover:text-blush-600 transition-colors"
                  aria-label="Видалити запис"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-choco-400 text-center">
        Дані зберігаються у браузері. КБЖУ — орієнтовні значення на 100 г продукту.
      </p>
    </div>
  );
}