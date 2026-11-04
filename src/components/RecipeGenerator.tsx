import { useState } from 'react';
import { Sparkles, Loader2, Clock, Users, Heart, ChevronDown, AlertCircle, RotateCw } from 'lucide-react';
import type { AISettings, GoalOption, Recipe, TimeOption } from '@/types';
import { generateRecipes } from '@/lib/api';

type Props = {
  settings: AISettings;
  onToggleFavorite: (r: Recipe) => void;
  isFavorite: (id: string) => boolean;
};

const TIME_OPTS: { val: TimeOption; label: string }[] = [
  { val: 10, label: '10 хв' },
  { val: 20, label: '20 хв' },
  { val: 30, label: '30 хв' },
];

const GOAL_OPTS: { val: GoalOption; label: string }[] = [
  { val: 'snack', label: '🥨 Швидкий перекус' },
  { val: 'breakfast', label: '🍳 Ситний сніданок' },
  { val: 'dinner', label: '🥗 Легка вечеря' },
  { val: 'poststudy', label: '📚 Щось смачне після навчання' },
];

const WISH_OPTS = [
  { key: 'vegetarian', label: '🥬 Вегетаріанські' },
  { key: 'avoid', label: '🚫 Без певних інгредієнтів' },
  { key: 'simple', label: '✨ Мінімум приготування' },
  { key: 'useall', label: '📦 Використати наявне' },
];

const WISH_LABELS: Record<string, string> = {
  vegetarian: 'Вегетаріанські страви',
  avoid: 'Без певних інгредієнтів',
  simple: 'Мінімум приготування',
  useall: 'Використати якомога більше наявних продуктів',
};

export default function RecipeGenerator({ settings, onToggleFavorite, isFavorite }: Props) {
  const [ingredients, setIngredients] = useState('');
  const [time, setTime] = useState<TimeOption>(20);
  const [goal, setGoal] = useState<GoalOption>('breakfast');
  const [wishes, setWishes] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmpty, setShowEmpty] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  function clearError() {
    if (error) setError('');
  }

  function toggleWish(key: string) {
    clearError();
    setWishes((w) => (w.includes(key) ? w.filter((x) => x !== key) : [...w, key]));
  }

  async function handleGenerate() {
    if (!ingredients.trim()) {
      setError('Додай хоча б один продукт, щоб знайти рецепти.');
      return;
    }
    setError('');
    setLoading(true);
    setExpanded(null);
    const wishTexts = wishes.map((w) => WISH_LABELS[w] ?? w);
    const result = await generateRecipes(settings, ingredients.trim(), time, goal, wishTexts);
    setRecipes(result);
    setShowEmpty(false);
    setLoading(false);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="section-title mb-1">FitStart Express</h1>
        <p className="text-choco-500">Генератор швидких рецептів з продуктів під рукою</p>
      </div>

      {/* Input panel */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-choco-600 mb-2">
            Що зараз є у твоєму холодильнику?
          </label>
          <textarea
            value={ingredients}
            onChange={(e) => {
              setIngredients(e.target.value);
              clearError();
            }}
            placeholder="Наприклад: яйця, вівсянка, яблуко, сир, хліб..."
            rows={3}
            className={`input-field resize-none ${error ? '!border-blush-300 !ring-2 !ring-blush-200/40' : ''}`}
          />
          {error && (
            <p className="flex items-center gap-1.5 mt-2 text-sm text-blush-600 font-medium animate-fade-in">
              <AlertCircle size={15} /> {error}
            </p>
          )}
        </div>

        <div>
          <span className="text-sm font-semibold text-choco-600 mb-2 block">Доступний час</span>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTS.map((t) => (
              <button
                key={t.val}
                onClick={() => {
                  clearError();
                  setTime(t.val);
                }}
                className={`chip ${time === t.val ? 'chip-on' : 'chip-off'}`}
              >
                <Clock size={14} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold text-choco-600 mb-2 block">Мета</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GOAL_OPTS.map((g) => (
              <button
                key={g.val}
                onClick={() => {
                  clearError();
                  setGoal(g.val);
                }}
                className={`chip justify-center text-center ${goal === g.val ? 'chip-on' : 'chip-off'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold text-choco-600 mb-2 block">Додаткові побажання</span>
          <div className="flex flex-wrap gap-2">
            {WISH_OPTS.map((w) => (
              <button
                key={w.key}
                onClick={() => toggleWish(w.key)}
                className={`chip ${wishes.includes(w.key) ? 'chip-on' : 'chip-off'}`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full text-lg !py-3.5">
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> Підбираємо...
            </>
          ) : (
            <>
              <Sparkles size={20} /> Знайти рецепти
            </>
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-cream-400 border-t-choco-500 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto text-choco-400 animate-pulse-soft" size={22} />
          </div>
          <p className="mt-5 text-choco-500 font-medium animate-pulse-soft">
            Підбираємо ідеї спеціально для тебе…
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && showEmpty && recipes.length === 0 && (
        <div className="text-center py-14 px-6 animate-fade-in">
          <div className="text-6xl mb-4 animate-float">🍽️</div>
          <h2 className="font-display text-2xl text-choco-700 mb-2">Почнімо з того, що вже є під рукою</h2>
          <p className="text-choco-500 max-w-md mx-auto leading-relaxed">
            Введи продукти й отримай кілька ідей для смачної страви. Знайди 2–3 простих рецепти за хвилини.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && recipes.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-display text-2xl text-choco-700">
              {recipes.length} ідеї для тебе
            </h2>
            <button onClick={handleGenerate} className="btn-soft">
              <RotateCw size={16} /> Згенерувати знову
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {recipes.map((r, idx) => {
              const fav = isFavorite(r.id);
              const open = expanded === r.id;
              return (
                <article
                  key={r.id}
                  className="glass-card overflow-hidden flex flex-col animate-fade-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Illustration header */}
                  <div className="relative h-32 bg-gradient-to-br from-blush-100 via-cream-100 to-sage-200/60 grid place-items-center overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-blush-200/30 blur-xl" />
                    <span className="text-5xl animate-float" style={{ animationDelay: `${idx * 200}ms` }}>
                      {r.emoji || '🍴'}
                    </span>
                    <button
                      onClick={() => onToggleFavorite(r)}
                      className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-full bg-cream-100/80 backdrop-blur hover:bg-cream-100 transition-all active:scale-90"
                      aria-label={fav ? 'Видалити з обраного' : 'Додати в обране'}
                    >
                      <Heart
                        size={18}
                        className={fav ? 'fill-blush-300 text-blush-300' : 'text-choco-400'}
                      />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display text-lg text-choco-700 leading-snug mb-2">{r.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-choco-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {r.timeMin} хв
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} /> {r.servings} порц.
                      </span>
                      {r.vegetarian && <span className="text-sage-500 font-medium">🥬 Веге</span>}
                    </div>

                    <ul className="space-y-1.5 mb-3">
                      {r.ingredients.slice(0, open ? undefined : 4).map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span
                            className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                              ing.have ? 'bg-sage-400' : 'bg-amber-soft'
                            }`}
                          />
                          <span className={ing.have ? 'text-choco-600' : 'text-choco-400'}>
                            {ing.name}
                            {!ing.have && <span className="text-xs italic"> (треба знайти)</span>}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {open && (
                      <div className="mb-3 animate-fade-in">
                        <h4 className="text-sm font-semibold text-choco-600 mb-2">Приготування</h4>
                        <ol className="space-y-2">
                          {r.steps.map((s, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-choco-600">
                              <span className="grid place-items-center w-5 h-5 rounded-full bg-choco-500/10 text-choco-600 text-xs font-semibold shrink-0">
                                {i + 1}
                              </span>
                              {s}
                            </li>
                          ))}
                        </ol>
                        {r.substitutions && r.substitutions.length > 0 && (
                          <div className="mt-3 rounded-2xl bg-cream-300/40 px-4 py-3 text-sm text-choco-500">
                            <span className="font-semibold text-choco-600">Заміни: </span>
                            {r.substitutions.join(' ')}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setExpanded(open ? null : r.id)}
                      className="btn-ghost mt-auto self-start text-sm"
                    >
                      {open ? 'Згорнути' : 'Детальніше'}
                      <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
