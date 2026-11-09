import {
  Apple,
  ArrowRight,
  ArrowUpRight,
  CheckSquare,
  Droplet,
  Dumbbell,
  Footprints,
  Heart,
  HeartPulse,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import type { Habit, UserProfile, View } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { storage, todayKey } from '@/lib/storage';
import { avatarTip, bmiInfo, bmiOf, greeting, todayLabel } from '@/lib/avatar';
import UserAvatar from './UserAvatar';

type Props = {
  onNavigate: (v: View) => void;
  habits: Habit[];
  favoritesCount: number;
  profile: UserProfile;
  onOpenProfile: () => void;
};

function Ring({ value, color, size = 68 }: { value: number; color: string; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDE0D4" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (clamped / 100) * c}
        style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)' }}
      />
    </svg>
  );
}

const QUICK: {
  view: View;
  title: string;
  desc: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
}[] = [
  {
    view: 'recipes',
    title: 'Рецепти',
    desc: 'З продуктів, що вже є',
    icon: UtensilsCrossed,
    bg: 'bg-coral-100',
    fg: 'text-coral-400',
  },
  {
    view: 'fitness',
    title: 'Тренування',
    desc: '10 хв без обладнання',
    icon: Dumbbell,
    bg: 'bg-sky-100',
    fg: 'text-sky-500',
  },
  {
    view: 'habits',
    title: 'Звички',
    desc: 'М’який чек-лист на день',
    icon: CheckSquare,
    bg: 'bg-green-100',
    fg: 'text-green-500',
  },
  {
    view: 'water',
    title: 'Вода',
    desc: 'Скільки вже випито',
    icon: Droplet,
    bg: 'bg-sky-100',
    fg: 'text-sky-400',
  },
  {
    view: 'steps',
    title: 'Крокомір',
    desc: 'Кроки за сьогодні',
    icon: Footprints,
    bg: 'bg-sage-100',
    fg: 'text-sage-500',
  },
  {
    view: 'nutrition',
    title: 'Калорії',
    desc: 'КБЖУ за сьогодні',
    icon: Apple,
    bg: 'bg-coral-50',
    fg: 'text-coral-400',
  },
  {
    view: 'fitbuddy',
    title: 'FitBuddy',
    desc: 'Порада без осуду',
    icon: HeartPulse,
    bg: 'bg-primary-100',
    fg: 'text-primary-600',
  },
  {
    view: 'favorites',
    title: 'Обране',
    desc: 'Збережені страви',
    icon: Heart,
    bg: 'bg-red-100',
    fg: 'text-red-400',
  },
];

export default function Dashboard({ onNavigate, habits, favoritesCount, profile, onOpenProfile }: Props) {
  const today = todayKey();
  const log = storage.getHabitLog();
  const done = log[today] ?? [];
  const habitsProgress = habits.length ? Math.round((done.length / habits.length) * 100) : 0;

  const water = storage.getWaterGoal();
  const waterGoalMl = Math.max(water.goalMl, 1);
  const waterProgress = Math.min(100, Math.round((water.drunkMl / waterGoalMl) * 100));

  const stepData = storage.getStepGoal();
  const stepGoal = Math.max(stepData.goal, 1);
  const stepProgress = Math.min(100, Math.round((stepData.steps / stepGoal) * 100));

  // Weekly activity (last 7 days) based on habit log
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const done = log[key]?.length ?? 0;
    const total = habits.length || 1;
    return { label: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()], value: Math.round((done / total) * 100), isToday: key === todayKey() };
  });

  const bmi = bmiOf(profile);
  const info = bmiInfo(bmi);
  const tip = avatarTip(profile, {
    habitsDone: done.length,
    habitsTotal: habits.length,
    waterDrunk: water.drunkMl,
    waterGoal: waterGoalMl,
    favoritesCount,
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* hero */}
      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary-700/20 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 p-6 shadow-soft-lg sm:p-9">
          <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 h-44 w-44 rounded-full bg-sage-400/20 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-cream-100">
              <Sparkles size={12} /> {todayLabel()}
            </span>
            <h1 className="display-title mt-4 text-balance text-cream-100">
              {greeting()},{' '}
              <span className="text-blush-500">{profile.name}</span>
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-cream-200/90">
              Твій AI-образ уже налаштований під стать, зріст і вагу. Почни з одного маленького
              кроку — далі буде легше.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button onClick={() => onNavigate('recipes')} className="btn-primary">
                <UtensilsCrossed size={18} /> Знайти рецепт
              </button>
              <button onClick={() => onNavigate('fitness')} className="btn-soft">
                <Dumbbell size={18} /> Розминка 10 хв
              </button>
            </div>
            <div className="mt-7 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/70 bg-cream-50/80 px-3 py-1.5 text-choco-600">
                💧 {water.drunkMl} / {waterGoalMl} мл води
              </span>
              <span className="rounded-full border border-white/70 bg-cream-50/80 px-3 py-1.5 text-choco-600">
                ✅ {done.length} / {habits.length} звичок
              </span>
              <span className="rounded-full border border-white/70 bg-cream-50/80 px-3 py-1.5 text-choco-600">
                ❤️ {favoritesCount} у обраному
              </span>
            </div>
          </div>
        </div>

        {/* avatar card */}
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-cream-50/90 p-5 shadow-soft">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blush-100 to-transparent" />
          <div className="relative flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow">Мій AI-образ</p>
              <p className="mt-1 font-display text-lg leading-tight text-choco-800">
                {profile.heightCm} см · {profile.weightKg} кг
              </p>
            </div>
            <button
              onClick={onOpenProfile}
              className="rounded-full border border-white/70 bg-cream-50/90 px-3 py-1.5 text-[11px] font-semibold text-choco-600 shadow-soft transition hover:-translate-y-0.5"
            >
              Змінити
            </button>
          </div>

          <div className="relative mx-auto -mt-1 flex justify-center">
            <UserAvatar profile={profile} size={196} />
          </div>

          <div
            className="relative -mt-2 flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-xs font-medium"
            style={{ background: info.bg, color: info.color }}
          >
            <span>IMT {bmi.toFixed(1)}</span>
            <span>{info.label}</span>
          </div>

          <div className="relative mt-3 flex items-start gap-2 rounded-2xl bg-cream-100 px-3.5 py-3">
            <Sparkles size={15} className="mt-0.5 shrink-0 text-blush-500" />
            <p className="text-[12.5px] leading-relaxed text-choco-600">{tip}</p>
          </div>
        </div>
      </section>

      {/* today */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="section-title">Сьогодні</h2>
          <span className="text-xs text-choco-400">оновлюється з твоїх дій</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => onNavigate('water')}
            className="sheet group flex items-center gap-4 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <div className="relative grid place-items-center">
              <Ring value={waterProgress} color="#5A9EC9" />
              <span className="absolute text-sm font-semibold text-choco-800">{waterProgress}%</span>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Вода</p>
              <p className="stat-value mt-1">{water.drunkMl} мл</p>
              <p className="mt-1 text-xs text-choco-500">з {waterGoalMl} мл</p>
            </div>
            <ArrowUpRight
              size={16}
              className="ml-auto shrink-0 text-choco-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>

          <button
            onClick={() => onNavigate('habits')}
            className="sheet group flex items-center gap-4 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <div className="relative grid place-items-center">
              <Ring value={habitsProgress} color="#C9A05A" />
              <span className="absolute text-sm font-semibold text-choco-800">{habitsProgress}%</span>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Звички</p>
              <p className="stat-value mt-1">
                {done.length} / {habits.length}
              </p>
              <p className="mt-1 text-xs text-choco-500">виконано сьогодні</p>
            </div>
            <ArrowUpRight
              size={16}
              className="ml-auto shrink-0 text-choco-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>

          <button
            onClick={() => onNavigate('steps')}
            className="sheet group flex items-center gap-4 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <div className="relative grid place-items-center">
              <Ring value={stepProgress} color="#C97A8A" />
              <span className="absolute text-sm font-semibold text-choco-800">{stepProgress}%</span>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Кроки</p>
              <p className="stat-value mt-1">{stepData.steps.toLocaleString('uk-UA')}</p>
              <p className="mt-1 text-xs text-choco-500">з {stepGoal.toLocaleString('uk-UA')}</p>
            </div>
            <ArrowUpRight
              size={16}
              className="ml-auto shrink-0 text-choco-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>

          <button
            onClick={() => onNavigate('fitness')}
            className="group relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-sky-500 to-sky-700 p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blush-200/20 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream-100/15 text-cream-100">
                <Dumbbell size={21} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cream-300">
                  Рух
                </p>
                <p className="mt-1 font-display text-xl text-cream-100">10 хв для тіла</p>
              </div>
            </div>
            <p className="relative mt-3 text-xs leading-relaxed text-cream-300">
              Розминка без обладнання — саме стільки, щоб прокинутись остаточно.
            </p>
            <span className="relative mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cream-100">
              Почати <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </section>

      {/* weekly activity */}
      <section className="glass-card p-6 sm:p-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="section-title mb-1">Активність за тиждень</h2>
            <p className="text-sm text-choco-500">Виконання звичок по днях</p>
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 h-40">
          {weekDays.map((d, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full max-w-[2.5rem] flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ${d.isToday ? 'bg-choco-700' : 'bg-sage-300'}`}
                  style={{ height: `${Math.max(4, d.value)}%` }}
                />
              </div>
              <span className={`text-[11px] font-medium ${d.isToday ? 'text-choco-700' : 'text-choco-400'}`}>{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* quick actions */}
      <section>
        <h2 className="section-title mb-3">Куди далі</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK.map((q, i) => {
            const Icon = q.icon;
            return (
              <button
                key={q.view}
                onClick={() => onNavigate(q.view)}
                className="tile animate-fade-up"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <span className={`icon-tile h-11 w-11 ${q.bg} ${q.fg}`}>
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-choco-800">{q.title}</span>
                  <span className="block text-xs text-choco-500">{q.desc}</span>
                </span>
                <ArrowUpRight size={16} className="shrink-0 text-choco-400" />
              </button>
            );
          })}
        </div>
      </section>

      {/* FitBuddy banner */}
      <section className="relative overflow-hidden rounded-[2rem] border border-choco-700/40 bg-gradient-to-r from-choco-700 via-choco-600 to-choco-800 p-7 shadow-soft-lg sm:p-9">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-blush-200/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-cream-100/15 text-cream-100">
            <HeartPulse size={28} />
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blush-200">
              FitBuddy AI
            </p>
            <h2 className="mt-1 font-display text-2xl text-cream-100">
              Помічник, який не соромить
            </h2>
            <p className="mt-1 max-w-lg text-sm leading-relaxed text-cream-300">
              Запитай про харчування, втому чи режим дня — отримаєш короткий план із 3–5 кроків.
            </p>
          </div>
          <button onClick={() => onNavigate('fitbuddy')} className="btn-soft shrink-0">
            Відкрити чат <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
