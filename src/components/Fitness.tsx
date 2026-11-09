import { useEffect, useState } from 'react';
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  History,
  Loader2,
  MapPin,
  Timer,
} from 'lucide-react';
import type { AISettings, Exercise, WorkoutSession } from '@/types';
import { generateWorkout } from '@/lib/api';
import { WORKOUT_TYPE_LABELS } from '@/lib/mockData';
import { storage } from '@/lib/storage';
import { dayKey } from '@/lib/streak';

type Props = { settings: AISettings };

const DURATIONS = [5, 10, 15, 20];
const TYPES = [
  { key: 'warmup', label: 'Розминка', emoji: '🔄' },
  { key: 'mobility', label: 'Рухливість', emoji: '🌀' },
  { key: 'stretch', label: 'Розтяжка', emoji: '🧘' },
  { key: 'general', label: 'Активність', emoji: '💪' },
];
const LOCATIONS = [
  { key: 'room', label: '🛋️ Кімната' },
  { key: 'outdoor', label: '🌳 Вулиця' },
];
const LEVELS = [
  { key: 'easy', label: 'Легкий' },
  { key: 'moderate', label: 'Помірний' },
];

export default function Fitness({ settings }: Props) {
  const [duration, setDuration] = useState(10);
  const [type, setType] = useState('warmup');
  const [location, setLocation] = useState('room');
  const [level, setLevel] = useState('easy');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => storage.getWorkoutLog());

  useEffect(() => {
    if (!started) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [started]);

  async function handleStart() {
    setLoading(true);
    setStarted(false);
    setFinished(false);
    setCurrent(0);
    setElapsed(0);
    const result = await generateWorkout(settings, duration, type, location, level);
    setExercises(result);
    setStarted(true);
    setLoading(false);
  }

  function handleFinish() {
    setFinished(true);
    setStarted(false);
    if (exercises.length > 0) {
      const session: WorkoutSession = {
        id: `w-${Date.now()}`,
        ts: Date.now(),
        type,
        minutes: duration,
        exercises: exercises.length,
      };
      const next = [session, ...sessions].slice(0, 60);
      setSessions(next);
      storage.setWorkoutLog(next);
    }
  }

  function handleReset() {
    setExercises([]);
    setStarted(false);
    setFinished(false);
    setCurrent(0);
  }

  const exercise = exercises[current];

  const weekStart = Date.now() - 6 * 24 * 60 * 60 * 1000;
  const weekSessions = sessions.filter((s) => s.ts >= weekStart);
  const weekMinutes = weekSessions.reduce((sum, s) => sum + s.minutes, 0);
  const workoutDays = new Set(sessions.map((s) => dayKey(new Date(s.ts))));
  let workoutStreak = 0;
  for (let i = 0; i < 366; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (workoutDays.has(dayKey(d))) workoutStreak++;
    else if (i === 0) continue;
    else break;
  }
  const recent = sessions.slice(0, 4);
  const clock = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="section-title mb-1">Домашні тренування</h1>
        <p className="text-choco-500">Короткі розминки без обладнання — рухайся вдома без тиску</p>
      </div>

      {/* Weekly stats */}
      {!started && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center">
            <span className="icon-tile mx-auto mb-2 h-9 w-9 bg-sky-100 text-sky-500">
              <CalendarCheck size={17} />
            </span>
            <p className="font-display text-2xl leading-none text-choco-800">{weekSessions.length}</p>
            <p className="mt-1 text-xs text-choco-500">тренувань за тиждень</p>
          </div>
          <div className="glass-card p-4 text-center">
            <span className="icon-tile mx-auto mb-2 h-9 w-9 bg-primary-100 text-primary-500">
              <Timer size={17} />
            </span>
            <p className="font-display text-2xl leading-none text-choco-800">{weekMinutes}</p>
            <p className="mt-1 text-xs text-choco-500">хвилин руху</p>
          </div>
          <div className="glass-card p-4 text-center">
            <span className="icon-tile mx-auto mb-2 h-9 w-9 bg-coral-100 text-coral-400">
              <Flame size={17} />
            </span>
            <p className="font-display text-2xl leading-none text-choco-800">{workoutStreak}</p>
            <p className="mt-1 text-xs text-choco-500">днів поспіль</p>
          </div>
        </div>
      )}

      {/* Setup panel */}
      {!started && !finished && (
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-sm font-semibold text-choco-600 mb-2 block flex items-center gap-1.5">
              <Clock size={15} /> Тривалість
            </span>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)} className={`chip ${duration === d ? 'chip-on' : 'chip-off'}`}>
                  {d} хв
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm font-semibold text-choco-600 mb-2 block flex items-center gap-1.5">
              <Activity size={15} /> Тип активності
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`chip justify-center ${type === t.key ? 'chip-on' : 'chip-off'}`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <span className="text-sm font-semibold text-choco-600 mb-2 block flex items-center gap-1.5">
                <MapPin size={15} /> Місце
              </span>
              <div className="flex gap-2">
                {LOCATIONS.map((l) => (
                  <button key={l.key} onClick={() => setLocation(l.key)} className={`chip ${location === l.key ? 'chip-on' : 'chip-off'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-semibold text-choco-600 mb-2 block">Рівень складності</span>
              <div className="flex gap-2">
                {LEVELS.map((l) => (
                  <button key={l.key} onClick={() => setLevel(l.key)} className={`chip ${level === l.key ? 'chip-on' : 'chip-off'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleStart} disabled={loading} className="btn-primary w-full text-lg !py-3.5">
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Готуємо...
              </>
            ) : (
              <>
                <Dumbbell size={20} /> Почати тренування
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-16 h-16 rounded-full border-4 border-cream-400 border-t-choco-500 animate-spin" />
          <p className="mt-5 text-choco-500 font-medium animate-pulse-soft">Складаємо твоє тренування…</p>
        </div>
      )}

      {/* Active workout */}
      {started && exercise && (
        <div className="space-y-5 animate-fade-up">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm text-choco-500">
              <span className="px-3 py-1 rounded-full bg-cream-300/50 font-medium">
                {WORKOUT_TYPE_LABELS[type]}
              </span>
              <span>Вправа {current + 1} / {exercises.length}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 font-semibold text-primary-500">
                <Timer size={13} /> {clock}
              </span>
            </div>
            <button onClick={handleFinish} className="btn-soft text-sm">
              <CheckCircle2 size={16} /> Завершити
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-cream-400/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-choco-500 to-choco-600 transition-all duration-500"
              style={{ width: `${exercises.length ? ((current + 1) / exercises.length) * 100 : 0}%` }}
            />
          </div>

          {/* Exercise card */}
          <div className="glass-card p-8 text-center">
            <div className="text-7xl mb-5 animate-float inline-block">{exercise.emoji || '🏃'}</div>
            <h2 className="font-display text-3xl text-choco-700 mb-3">{exercise.name}</h2>
            <p className="text-choco-500 leading-relaxed max-w-md mx-auto mb-2">{exercise.description}</p>
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-choco-500/10 text-choco-600 font-semibold text-sm mb-5">
              {exercise.repsOrTime}
            </div>

            {exercise.alternative && (
              <div className="max-w-md mx-auto rounded-2xl bg-cream-300/40 px-4 py-3 text-sm text-choco-500 text-left mb-6">
                <span className="font-semibold text-choco-600">Безпечна альтернатива: </span>
                {exercise.alternative}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mt-2">
              {current > 0 && (
                <button onClick={() => setCurrent((c) => c - 1)} className="btn-ghost">
                  Попередня
                </button>
              )}
              {current < exercises.length - 1 ? (
                <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">
                  Наступна вправа <ChevronRight size={18} />
                </button>
              ) : (
                <button onClick={handleFinish} className="btn-primary">
                  <CheckCircle2 size={18} /> Завершити тренування
                </button>
              )}
            </div>
          </div>

          {/* Exercise list sidebar */}
          <div className="glass-card p-4">
            <p className="text-sm font-semibold text-choco-600 mb-3">Усі вправи ({exercises.length})</p>
            <div className="flex flex-wrap gap-2">
              {exercises.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    i === current
                      ? 'bg-choco-700 text-cream-100'
                      : i < current
                      ? 'bg-sage-200/70 text-sage-500'
                      : 'bg-cream-300/50 text-choco-500 hover:bg-cream-400/50'
                  }`}
                >
                  {i < current && <CheckCircle2 size={12} />}
                  {ex.emoji} {ex.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Finished */}
      {finished && (
        <div className="text-center py-12 animate-scale-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display text-3xl text-choco-700 mb-2">Чудова робота!</h2>
          <p className="text-choco-500 max-w-md mx-auto mb-6">
            Ти виконав {exercises.length} вправ за {duration} хвилин. Пам’ятай про воду та відпочинок — тіло скаже дякую.
          </p>
          <button onClick={handleReset} className="btn-primary">
            <Dumbbell size={18} /> Нове тренування
          </button>
        </div>
      )}

      {/* Recent sessions */}
      {!started && recent.length > 0 && (
        <div className="glass-card p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="icon-tile h-8 w-8 bg-cream-300/70 text-choco-600">
              <History size={16} />
            </span>
            <h2 className="font-display text-lg text-choco-800">Останні тренування</h2>
          </div>
          <div className="space-y-1.5">
            {recent.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream-100 px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-choco-700">
                  {WORKOUT_TYPE_LABELS[s.type] ?? s.type}
                </span>
                <span className="text-xs text-choco-400">
                  {new Date(s.ts).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-xs text-choco-500">
                  {s.minutes} хв · {s.exercises} вправ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
