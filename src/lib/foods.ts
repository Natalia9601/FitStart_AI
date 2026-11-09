// КБЖУ на 100 г продукту (орієнтовні значення)
export type Food = {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const FOODS: Food[] = [
  { name: 'Яйця', kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: 'Куряча грудка', kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Яловичина', kcal: 250, protein: 26, carbs: 0, fat: 15 },
  { name: 'Свинина', kcal: 242, protein: 27, carbs: 0, fat: 14 },
  { name: 'Риба (хек)', kcal: 88, protein: 18, carbs: 0, fat: 1.5 },
  { name: 'Лосось', kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Рис варений', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Гречка варена', kcal: 110, protein: 4.2, carbs: 21, fat: 1.1 },
  { name: 'Вівсянка варена', kcal: 68, protein: 2.4, carbs: 12, fat: 1.4 },
  { name: 'Макарони варені', kcal: 131, protein: 5, carbs: 25, fat: 1.1 },
  { name: 'Картопля варена', kcal: 77, protein: 2, carbs: 17, fat: 0.1 },
  { name: 'Хліб білий', kcal: 265, protein: 9, carbs: 49, fat: 3.2 },
  { name: 'Хліб чорний', kcal: 210, protein: 7, carbs: 40, fat: 1.5 },
  { name: 'Молоко 2.5%', kcal: 52, protein: 2.8, carbs: 4.7, fat: 2.5 },
  { name: 'Кефір 1%', kcal: 38, protein: 3, carbs: 4, fat: 1 },
  { name: 'Йогурт натуральний', kcal: 59, protein: 3.5, carbs: 4.7, fat: 3.3 },
  { name: 'Сир твердий', kcal: 350, protein: 25, carbs: 1.3, fat: 27 },
  { name: 'Сир кисломолочний 5%', kcal: 121, protein: 17, carbs: 2, fat: 5 },
  { name: 'Сметана 15%', kcal: 158, protein: 2.6, carbs: 3.6, fat: 15 },
  { name: 'Масло вершкове', kcal: 717, protein: 0.8, carbs: 0.1, fat: 81 },
  { name: 'Олія соняшникова', kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { name: 'Яблуко', kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: 'Банан', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: 'Апельсин', kcal: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  { name: 'Помідор', kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'Огірок', kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { name: 'Морква', kcal: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: 'Капуста', kcal: 25, protein: 1.3, carbs: 5.8, fat: 0.1 },
  { name: 'Броколі', kcal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Горіхи (волоські)', kcal: 654, protein: 15, carbs: 14, fat: 65 },
  { name: 'Мед', kcal: 304, protein: 0.3, carbs: 82, fat: 0 },
  { name: 'Цукор', kcal: 387, protein: 0, carbs: 100, fat: 0 },
  { name: 'Шоколад', kcal: 546, protein: 4.9, carbs: 61, fat: 31 },
  { name: 'Ковбаса варена', kcal: 250, protein: 12, carbs: 2, fat: 22 },
  { name: 'Сосиски', kcal: 270, protein: 11, carbs: 2, fat: 24 },
  { name: 'Тофу', kcal: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  { name: 'Авокадо', kcal: 160, protein: 2, carbs: 9, fat: 15 },
  { name: 'Фініки', kcal: 282, protein: 2.5, carbs: 75, fat: 0.4 },
];

export function findFood(name: string): Food | undefined {
  const q = name.trim().toLowerCase();
  return FOODS.find((f) => f.name.toLowerCase() === q);
}

const CACHE_KEY = 'fitstart_food_cache';

function readCache(): Record<string, Food> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeCache(cache: Record<string, Food>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}

export async function lookupFood(name: string): Promise<Food | null> {
  const q = name.trim();
  if (!q) return null;
  const cache = readCache();
  const key = q.toLowerCase();
  if (cache[key]) return cache[key];

  // local DB first
  const local = findFood(q);
  if (local) {
    cache[key] = local;
    writeCache(cache);
    return local;
  }

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FitStartAI/1.0 (fitstart@example.com)' },
    });
    if (!res.ok) return null;
    const text = await res.text();
    const data = JSON.parse(text);
    const products = (data?.products ?? []) as Array<{ product_name?: string; nutriments?: Record<string, number> }>;
    for (const p of products) {
      const n = p.nutriments;
      if (!n) continue;
      const kcal = n['energy-kcal_100g'] ?? n['energy-kcal'] ?? null;
      const protein = n['proteins_100g'] ?? null;
      const carbs = n['carbohydrates_100g'] ?? null;
      const fat = n['fat_100g'] ?? null;
      if (kcal == null && protein == null && carbs == null && fat == null) continue;
      const food: Food = {
        name: p.product_name?.trim() || q,
        kcal: Math.round(kcal ?? 0),
        protein: Math.round((protein ?? 0) * 10) / 10,
        carbs: Math.round((carbs ?? 0) * 10) / 10,
        fat: Math.round((fat ?? 0) * 10) / 10,
      };
      // cache under the user's query
      cache[key] = food;
      writeCache(cache);
      return food;
    }
    return null;
  } catch {
    return null;
  }
}