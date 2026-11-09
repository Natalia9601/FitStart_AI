import { useMemo, useState } from 'react';
import { ArrowDownWideNarrow, Check, Clock, Copy, Heart, Search, Trash2, Users } from 'lucide-react';
import type { FavoriteRecipe } from '@/types';

type Props = {
  favorites: FavoriteRecipe[];
  onRemove: (id: string) => void;
};

type SortKey = 'new' | 'fast' | 'name';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'new', label: 'Новіші' },
  { key: 'fast', label: 'Швидші' },
  { key: 'name', label: 'За назвою' },
];

export default function Favorites({ favorites, onRemove }: Props) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('new');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? favorites.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.ingredients.some((i) => i.name.toLowerCase().includes(q)),
        )
      : favorites;
    const sorted = [...filtered];
    if (sort === 'fast') sorted.sort((a, b) => a.timeMin - b.timeMin);
    else if (sort === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title, 'uk'));
    else sorted.sort((a, b) => b.savedAt - a.savedAt);
    return sorted;
  }, [favorites, query, sort]);

  async function copyIngredients(r: FavoriteRecipe) {
    const text = `${r.title}\n\n${r.ingredients.map((i) => `— ${i.name}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(r.id);
      window.setTimeout(() => setCopiedId((v) => (v === r.id ? null : v)), 1800);
    } catch {
      /* clipboard may be blocked — silently ignore */
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="section-title mb-1">Мої улюблені</h1>
          <p className="text-choco-500">Збережені рецепти — завжди під рукою</p>
        </div>
        <div className="glass-card px-6 py-16 text-center animate-fade-in">
          <span className="icon-tile mx-auto mb-4 h-16 w-16 bg-red-100 text-red-400">
            <Heart size={30} />
          </span>
          <h2 className="mb-2 font-display text-2xl text-choco-700">Тут поки порожньо</h2>
          <p className="mx-auto max-w-md leading-relaxed text-choco-500">
            Знайди рецепт у розділі «Рецепти» й натисни серце, щоб зберегти його сюди.
            Улюблені страви залишаться тут навіть після оновлення сторінки.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title mb-1">Мої улюблені</h1>
          <p className="text-choco-500">
            {favorites.length} {favorites.length === 1 ? 'збережений рецепт' : 'збережених рецептів'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-choco-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук за назвою чи продуктом"
              className="input-field !w-64 !py-2.5 !pl-9 text-sm"
              aria-label="Пошук в обраному"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowDownWideNarrow size={15} className="text-choco-400" />
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`chip text-xs ${sort === s.key ? 'chip-on' : 'chip-off'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="glass-card px-6 py-12 text-center">
          <p className="font-medium text-choco-600">Нічого не знайдено</p>
          <p className="mt-1 text-sm text-choco-400">Спробуй інший запит або зміни сортування.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r, idx) => (
            <article
              key={r.id}
              className="glass-card overflow-hidden flex flex-col animate-fade-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="relative h-28 bg-gradient-to-br from-blush-100 via-cream-100 to-sage-200/60 grid place-items-center overflow-hidden">
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-blush-200/30 blur-xl" />
                <span className="text-4xl">{r.emoji || '🍴'}</span>
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-cream-100/80 backdrop-blur text-xs text-choco-500 font-medium">
                  <Heart size={12} className="fill-blush-300 text-blush-300" /> Обране
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className="font-display text-lg text-choco-700 leading-snug mb-2 line-clamp-2">{r.title}</h2>
                <div className="flex items-center gap-3 text-xs text-choco-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {r.timeMin} хв
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={13} /> {r.servings} порц.
                  </span>
                  {r.vegetarian && <span className="text-sage-500 font-medium">🥬 Веге</span>}
                </div>

                <div className="rounded-2xl bg-cream-300/40 px-4 py-3 mb-3">
                  <p className="text-xs font-semibold text-choco-600 mb-1.5">Інгредієнти</p>
                  <p className="text-sm text-choco-500 leading-relaxed">
                    {r.ingredients.map((i) => i.name).join(', ')}
                  </p>
                </div>

                <details className="mb-3">
                  <summary className="text-sm font-medium text-choco-600 cursor-pointer select-none hover:text-choco-700">
                    Як приготувати
                  </summary>
                  <ol className="mt-2 space-y-1.5">
                    {r.steps.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-choco-500">
                        <span className="grid place-items-center w-5 h-5 rounded-full bg-choco-500/10 text-choco-600 text-xs font-semibold shrink-0">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </details>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onRemove(r.id)}
                    className="btn-ghost !px-3 !py-1.5 text-sm text-blush-600 hover:bg-blush-100/50"
                    aria-label="Видалити з обраного"
                  >
                    <Trash2 size={15} /> Видалити
                  </button>
                  <button
                    onClick={() => copyIngredients(r)}
                    className="btn-ghost !px-3 !py-1.5 text-sm"
                    aria-label="Скопіювати інгредієнти"
                  >
                    {copiedId === r.id ? (
                      <>
                        <Check size={15} className="text-green-500" /> Скопійовано
                      </>
                    ) : (
                      <>
                        <Copy size={15} /> Інгредієнти
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
