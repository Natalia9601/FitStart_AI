import { useState, useEffect } from 'react';
import {
  Apple,
  Coffee,
  Cookie,
  Flame,
  Lightbulb,
  Moon,
  Plus,
  Sun,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AISettings, MealType, NutritionEntry, NutritionLog, UserProfile } from '@/types';
import { storage, todayKey } from '@/lib/storage';
import { FOODS, findFood } from '@/lib/foods';
import { estimateFood } from '@/lib/api';

type Props = { settings: AISettings; profile?: UserProfile };

/** Рекомендована норма ккал за формулою Mifflin–St Jeor (вік невідомий — орієнтовно 26 р.). */
function suggestedKcal(profile?: UserProfile): number | null {
  if (!profile) return null;
  const bmr =
    profile.gender === 'female'
      ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * 26 - 161
      : profile.gender === 'male'
        ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * 26 + 5
        : 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * 26 - 78;
  return Math.round(bmr * 1.4 / 50) * 50;
}

const MEALS: { key: MealType; label: string; icon: LucideIcon; color: string }[] = [
  { key: 'breakfast', label: 'Сніданок', icon: Coffee, color: 'text-gold-500 bg-gold-100' },
  { key: 'lunch', label: 'Обід', icon: Sun, color: 'text-coral-400 bg-coral-100' },
  { key: 'dinner', label: 'Вечеря', icon: Moon, color: 'text-sky-500 bg-sky-100' },
  { key: 'snack', label: 'Перекус', icon: Cookie, color: 'text-primary-500 bg-primary-100' },
];

function defaultMeal(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

export default function NutritionTracker({ settings, profile }: Props) {
  const [log, setLog] = useState<NutritionLog>(() => storage.getNutritionLog());

  useEffect(() => {
    storage.setNutritionLog(log);
  }, [log]);

  const [name, setName] = useState('');
  const [grams, setGrams] = useState<number>(100);
  const [meal, setMeal] = useState<MealType>(defaultMeal);
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
      meal,
    };
    setLog((prev) => {
      const today = todayKey();
      const base = prev.date !== today ? { date: today, goalKcal: prev.goalKcal, entries: [], history: prev.history } : prev;
      return { ...base, entries: [...base.entries, entry] };
    });
    resetForm();
  }

  function removeEntry(id: string) {
    setLog((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
  }

  function resetDay() {
    setLog((prev) => ({ date: todayKey(), goalKcal: prev.goalKcal, entries: [], history: prev.history }));
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

  const suggested = suggestedKcal(profile);

  const today = todayKey();
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const saved = (log.history ?? []).find((h) => h.date === key);
    return {
      key,
      label: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()],
      value: key === today ? totals.kcal : saved?.kcal ?? 0,
      isToday: key === today,
    };
  });
  const maxKcal = Math.max(log.goalKcal, ...last7.map((d) => d.value), 1);
  const activeDays = last7.filter((d) => d.value > 0);
  const avgKcal = activeDays.length
    ? Math.round(activeDays.reduce((sum, d) => sum + d.value, 0) / activeDays.length)
    : 0;

  const macroTotal = totals.protein + totals.carbs + totals.fat;
  const pPct = macroTotal ? Math.round((totals.protein / macroTotal) * 100) : 0;
  const cPct = macroTotal ? Math.round((totals.carbs / macroTotal) * 100) : 0;
  const fPct = Math.max(0, 100 - pPct - cPct);

  const mealGroups = MEALS.map((m) => {
    const entries = log.entries.filter((e) => (e.meal ?? 'snack') === m.key);
    return {
      ...m,
      entries,
      kcal: entries.reduce((sum, e) => sum + e.kcal, 0),
    };
  });

  const insights: string[] = [];
  const hour = new Date().getHours();
  if (!log.entries.length) {
    insights.push('Ще немає записів — почни зі сніданку або легкого перекусу.');
  }
  if (log.entries.length && totals.protein < 60) {
    insights.push('Білка поки мало — додай яйця, рибу, сир або бобові.');
  }
  if (totals.kcal > log.goalKcal) {
    insights.push('Ти трохи понад ціллю — це не привід для провини. Завтра новий день.');
  } else if (log.entries.length && totals.kcal < log.goalKcal * 0.5 && hour >= 16) {
    insights.push('Калорій поки мало — не пропускай вечерю.');
  }
  if (totals.fat > 90) {
    insights.push('Жирів багато — наступний прийом їжі зроби легшим.');
  }
  if (!insights.length) {
    insights.push('Баланс виглядає добре — так і тримай.');
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="icon-tile h-9 w-9 bg-coral-100 text-coral-400">
              <Apple size={18} />
            </span>
            <h1 className="section-title mb-0">Харчування</h1>
          </div>
          <p className="text-choco-500">Записуй, що з'їв — рахуй калорії, білки, вуглеводи та жири</p>
        </div>
        <button onClick={resetDay} className="btn-soft text-sm">
          <Trash2 size={16} /> Очистити день
        </button>
      </div>

      {/* Summary */}
      <div className="glass-card p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-coral-400" />
                <span className="text-sm font-semibold text-choco-600">Ціль на день</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {suggested !== null && (
                  <button
                    onClick={() => setLog((prev) => ({ ...prev, goalKcal: suggested }))}
                    className={`chip ${log.goalKcal === suggested ? 'chip-on' : 'chip-off'}`}
                    title="Розраховано за твоїм профілем (Mifflin–St Jeor × 1.4)"
                  >
                    Рекомендація ~{suggested}
                  </button>
                )}
                {[1500, 2000, 2500].map((g) => (
                  <button
                    key={g}
                    onClick={() => setLog((prev) => ({ ...prev, goalKcal: g }))}
                    className={`chip ${log.goalKcal === g ? 'chip-on' : 'chip-off'}`}
                  >
                    {g}
                  </button>
                ))}
                <label className="flex items-center gap-1.5 text-xs text-choco-500">
                  Своя
                  <input
                    type="number"
                    min={800}
                    max={5000}
                    value={log.goalKcal || ''}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setLog((prev) => ({ ...prev, goalKcal: Number.isFinite(v) ? v : 0 }));
                    }}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value);
                      setLog((prev) => ({
                        ...prev,
                        goalKcal: Math.max(800, Math.min(5000, Number.isFinite(v) ? v : 2000)),
                      }));
                    }}
                    className="input-field !w-24 !rounded-xl !px-2.5 !py-1.5 text-sm"
                    aria-label="Власна ціль калорій"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-coral-50 p-3 text-center">
                <p className="text-xs text-choco-400">Калорії</p>
                <p className="font-display text-xl text-choco-700">{totals.kcal}</p>
                <p className="text-xs text-choco-400">з {log.goalKcal}</p>
              </div>
              <div className="rounded-2xl bg-primary-50 p-3 text-center">
                <p className="text-xs text-choco-400">Білки</p>
                <p className="font-display text-xl text-choco-700">{totals.protein} г</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-3 text-center">
                <p className="text-xs text-choco-400">Вуглеводи</p>
                <p className="font-display text-xl text-choco-700">{totals.carbs} г</p>
              </div>
              <div className="rounded-2xl bg-gold-50 p-3 text-center">
                <p className="text-xs text-choco-400">Жири</p>
                <p className="font-display text-xl text-choco-700">{totals.fat} г</p>
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-cream-400/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-coral-300 via-coral-400 to-coral-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={`mt-2 text-sm font-medium ${totals.kcal >= log.goalKcal ? 'text-sage-500' : 'text-choco-400'}`}>
              {totals.kcal >= log.goalKcal
                ? '✓ Ціль на день досягнута!'
                : `Залишилось ${Math.max(0, log.goalKcal - totals.kcal)} ккал`}
            </p>
          </div>

          {/* Macro donut */}
          <div className="flex items-center justify-center gap-5">
            <div
              className="relative grid h-32 w-32 place-items-center rounded-full"
              style={{
                background: macroTotal
                  ? `conic-gradient(#C97A8A 0 ${pPct}%, #5A9EC9 ${pPct}% ${pPct + cPct}%, #C9A05A ${pPct + cPct}% 100%)`
                  : '#EAE3E5',
              }}
              title="Розподіл білків, вуглеводів і жирів"
            >
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center">
                <div>
                  <p className="font-display text-lg leading-none text-choco-700">{macroTotal}</p>
                  <p className="text-[10px] text-choco-400">грамів</p>
                </div>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="flex items-center gap-2 text-choco-500">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C97A8A]" /> Білки {pPct}%
              </p>
              <p className="flex items-center gap-2 text-choco-500">
                <span className="h-2.5 w-2.5 rounded-full bg-[#5A9EC9]" /> Вуглеводи {cPct}%
              </p>
              <p className="flex items-center gap-2 text-choco-500">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C9A05A]" /> Жири {fPct}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="icon-tile h-8 w-8 bg-gold-100 text-gold-500">
            <Lightbulb size={16} />
          </span>
          <h2 className="font-display text-lg text-choco-800">Підказки</h2>
        </div>
        <ul className="space-y-1.5">
          {insights.slice(0, 3).map((text) => (
            <li key={text} className="flex items-start gap-2 text-sm leading-relaxed text-choco-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-300" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* 7-day history */}
      <div className="glass-card p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="section-title mb-1">Останні 7 днів</h2>
            <p className="text-sm text-choco-500">Історія калорій зберігається автоматично</p>
          </div>
          {avgKcal > 0 && <span className="chip chip-off">У середньому {avgKcal} ккал</span>}
        </div>
        <div className="flex h-36 items-end justify-between gap-2">
          {last7.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="h-4 text-[11px] font-medium text-choco-400">{d.value > 0 ? d.value : ''}</span>
              <div className="relative flex w-full max-w-[2.5rem] flex-1 items-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ${
                    d.value === 0
                      ? 'bg-cream-400/60'
                      : d.isToday
                        ? 'bg-coral-400'
                        : 'bg-coral-200'
                  }`}
                  style={{ height: `${Math.max(4, Math.round((d.value / maxKcal) * 100))}%` }}
                  title={`${d.value} ккал`}
                />
              </div>
              <span className={`text-[11px] font-medium ${d.isToday ? 'text-choco-700' : 'text-choco-400'}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add form */}
      <div className="glass-card space-y-4 p-6 sm:p-8">
        <h2 className="section-title mb-2">Додати продукт</h2>

        <div>
          <span className="mb-2 block text-sm font-semibold text-choco-600">Прийом їжі</span>
          <div className="flex flex-wrap gap-2">
            {MEALS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => setMeal(m.key)}
                  className={`chip ${meal === m.key ? 'chip-on' : 'chip-off'}`}
                >
                  <Icon size={14} /> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-choco-600">Назва продукту</label>
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
              <p className="mt-1 text-xs text-sage-500">
                Знайдено в базі: {food.kcal} ккал, Б{food.protein} В{food.carbs} Ж{food.fat} на 100 г
              </p>
            )}
            {!food && name.trim() && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={lookupLoading}
                  className="btn-soft !px-3 !py-1.5 text-xs"
                >
                  {lookupLoading ? 'Визначаю…' : 'Визначити автоматично'}
                </button>
                {lookupError && <span className="text-xs text-blush-600">{lookupError}</span>}
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-choco-600">Вага (грами)</label>
            <input
              type="number"
              min={1}
              value={grams}
              onChange={(e) => setGrams(parseFloat(e.target.value) || 0)}
              className="input-field"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-choco-600">
          <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
          Ввести КБЖУ вручну (на 100 г)
        </label>

        {manual && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-choco-500">ккал/100г</label>
              <input type="number" min={0} value={mKcal} onChange={(e) => setMKcal(parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-choco-500">Білки/100г</label>
              <input type="number" min={0} value={mP} onChange={(e) => setMP(parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-choco-500">Вуглеводи/100г</label>
              <input type="number" min={0} value={mC} onChange={(e) => setMC(parseFloat(e.target.value) || 0)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-choco-500">Жири/100г</label>
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

      {/* Meals */}
      <div className="grid gap-4 sm:grid-cols-2">
        {mealGroups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.key} className="glass-card p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`icon-tile h-9 w-9 ${group.color}`}>
                    <Icon size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-choco-700">{group.label}</p>
                    <p className="text-xs text-choco-400">{group.entries.length} записів</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-choco-600">{group.kcal} ккал</span>
              </div>
              {group.entries.length === 0 ? (
                <p className="rounded-2xl bg-cream-100 px-4 py-3 text-xs text-choco-400">
                  Поки нічого не додано
                </p>
              ) : (
                <div className="space-y-1.5">
                  {group.entries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-2 rounded-2xl bg-cream-100 px-3.5 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-choco-700">
                          {e.name} — {e.grams} г
                        </p>
                        <p className="text-xs text-choco-400">
                          {e.kcal} ккал · Б{e.protein} В{e.carbs} Ж{e.fat}
                        </p>
                      </div>
                      <button
                        onClick={() => removeEntry(e.id)}
                        className="text-choco-400 transition-colors hover:text-blush-600"
                        aria-label={`Видалити ${e.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl bg-cream-300/40 px-4 py-3 text-xs leading-relaxed text-choco-500">
        <UtensilsCrossed size={15} className="mt-0.5 shrink-0" />
        <p>Дані зберігаються у браузері. КБЖУ — орієнтовні значення на 100 г продукту.</p>
      </div>
    </div>
  );
}
