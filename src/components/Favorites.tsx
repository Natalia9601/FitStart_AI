import { Clock, Users, Heart, Trash2 } from 'lucide-react';
import type { FavoriteRecipe } from '@/types';

type Props = {
  favorites: FavoriteRecipe[];
  onRemove: (id: string) => void;
};

export default function Favorites({ favorites, onRemove }: Props) {
  if (favorites.length === 0) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div>
          <h1 className="section-title mb-1">Мої улюблені</h1>
          <p className="text-choco-500">Збережені рецепти — завжди під рукою</p>
        </div>
        <div className="text-center py-16 animate-fade-in">
          <div className="text-6xl mb-4 animate-float">💖</div>
          <h2 className="font-display text-2xl text-choco-700 mb-2">Тут поки порожньо</h2>
          <p className="text-choco-500 max-w-md mx-auto leading-relaxed">
            Знайди рецепт у розділі «Рецепти» й натисни серце, щоб зберегти його сюди.
            Улюблені страви залишаться тут навіть після оновлення сторінки.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="section-title mb-1">Мої улюблені</h1>
        <p className="text-choco-500">{favorites.length} {favorites.length === 1 ? 'збережений рецепт' : 'збережених рецептів'}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {favorites.map((r, idx) => (
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

              <button
                onClick={() => onRemove(r.id)}
                className="btn-ghost mt-auto self-start text-sm text-blush-600 hover:bg-blush-100/50 flex items-center gap-1.5"
                aria-label="Видалити з обраного"
              >
                <Trash2 size={15} /> Видалити з обраного
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
