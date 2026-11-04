import type { AISettings, Exercise, Recipe } from '@/types';
import { GOAL_LABELS, MOCK_RECIPES, MOCK_WORKOUT_EXERCISES, WORKOUT_TYPE_LABELS } from './mockData';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export function isAIReady(settings: AISettings): boolean {
  return Boolean(settings.apiKey && settings.apiKey.trim().length > 10);
}

async function callOpenRouter(
  settings: AISettings,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'FitStart AI',
    },
    body: JSON.stringify({
      model: settings.model || 'nvidia/nemotron-3.5-super-vl:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1800,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${errText.slice(0, 120)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Порожня відповідь від моделі');
  return content as string;
}

function parseJSON<T>(raw: string): T {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = text.indexOf('[') !== -1 ? text.indexOf('[') : text.indexOf('{');
  const end = text.lastIndexOf(']') !== -1 ? text.lastIndexOf(']') : text.lastIndexOf('}');
  if (start !== -1 && end !== -1) text = text.slice(start, end + 1);
  return JSON.parse(text) as T;
}

export async function generateRecipes(
  settings: AISettings,
  ingredients: string,
  timeMin: number,
  goalKey: string,
  wishes: string[],
): Promise<Recipe[]> {
  const goal = GOAL_LABELS[goalKey] ?? goalKey;
  const wishText = wishes.length ? wishes.join('; ') : 'немає';

  if (!isAIReady(settings)) {
    await new Promise((r) => setTimeout(r, 900));
    return MOCK_RECIPES.map((r) => ({ ...r, goal }));
  }

  const system = `Ти — кулінарний помічник для здорового харчування. Користувач — підліток або дорослий. Відповідай ТІЛЬКИ валідним JSON-масивом 2–3 рецептів українською мовою. Не додавай жодного тексту поза масивом.`;
  const user = `Продукти вдома: ${ingredients}. Доступний час: ${timeMin} хв. Мета: ${goal}. Побажання: ${wishText}.
Створи 2–3 простих реалістичних рецепти. Формат кожного рецепта:
{"title": string, "emoji": string, "timeMin": number, "goal": "${goal}", "servings": number, "ingredients": [{"name": string, "have": boolean}], "steps": [string], "substitutions": [string], "vegetarian": boolean}
У полі "have" познач true для продуктів, які є в списку користувача, і false для тих, що треба знайти. Кроки — 3–5 коротких. Поверни масив.`;

  try {
    const raw = await callOpenRouter(settings, system, user);
    const parsed = parseJSON<Recipe[]>(raw);
    return parsed.slice(0, 3).map((r, i) => ({
      ...r,
      id: `ai-${Date.now()}-${i}`,
      timeMin: r.timeMin ?? timeMin,
      goal: r.goal ?? goal,
    }));
  } catch {
    return MOCK_RECIPES.map((r) => ({ ...r, goal }));
  }
}

export async function generateWorkout(
  settings: AISettings,
  duration: number,
  type: string,
  location: string,
  level: string,
): Promise<Exercise[]> {
  if (!isAIReady(settings)) {
    await new Promise((r) => setTimeout(r, 700));
    return MOCK_WORKOUT_EXERCISES[type] ?? MOCK_WORKOUT_EXERCISES.warmup;
  }

  const typeLabel = WORKOUT_TYPE_LABELS[type] ?? type;
  const system = `Ти — фітнес-помічник для домашніх тренувань. Відповідай ТІЛЬКИ валідним JSON-масивом вправ українською. Не додавай жодного тексту поза масивом.`;
  const user = `Тривалість: ${duration} хв. Тип: ${typeLabel}. Місце: ${location}. Рівень: ${level}. Без обладнання.
Створи список вправ. Формат:
{"name": string, "emoji": string, "description": string, "repsOrTime": string, "alternative": string}
Опис — техніка в 1 реченні. "alternative" — безпечна альтернатива. Поверни масив.`;

  try {
    const raw = await callOpenRouter(settings, system, user);
    const parsed = parseJSON<Exercise[]>(raw);
    return parsed.length ? parsed : MOCK_WORKOUT_EXERCISES[type] ?? MOCK_WORKOUT_EXERCISES.warmup;
  } catch {
    return MOCK_WORKOUT_EXERCISES[type] ?? MOCK_WORKOUT_EXERCISES.warmup;
  }
}

export async function chatReply(
  settings: AISettings,
  history: { role: 'user' | 'assistant'; text: string }[],
): Promise<string> {
  if (!isAIReady(settings)) {
    await new Promise((r) => setTimeout(r, 600));
    return mockChatReply(history[history.length - 1]?.text ?? '');
  }

  const system = `Ти — FitBuddy AI, дружній помічник зі збалансованого харчування та здорових звичок. Спілкуйся українською, тепло й без осуду. Став уточнювальні запитання по одному. Пропонуй плани з 3–5 простих кроків. Не став медичних діагнозів, не призначай ліків, не рекомендуй голодування чи екстремальні дієти. Якщо користувачу зле або він травмувався — порадь припинити вправу та звернутися до дорослого, якому довіряє, і медичного фахівця. Відповідай стисло, 2–4 речення.`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'FitStart AI',
      },
      body: JSON.stringify({
        model: settings.model || 'nvidia/nemotron-3.5-super-vl:free',
        messages: [
          { role: 'system', content: system },
          ...history.map((m) => ({ role: m.role, content: m.text })),
        ],
        temperature: 0.8,
        max_tokens: 600,
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Порожня відповідь');
    return content as string;
  } catch {
    return mockChatReply(history[history.length - 1]?.text ?? '');
  }
}

function mockChatReply(userText: string): string {
  const t = userText.toLowerCase();
  if (t.includes('сон') || t.includes('спать') || t.includes('вчасно'))
    return 'Дякую, що поділився! Почнімо з малого: спробуй клатись на 15 хвилин раніше за звичку, вимкни екран за годину до сну, а вранці зроби стакан води. Який із цих кроків здається тобі найпростішим?';
  if (t.includes('вода') || t.includes('пити'))
    return 'Чудова мета! Почни з одного стакана води зранку і ще одного між прийомами їжі. Не потрібно відразу литрами — головне регулярно. Скільки склянок води ти зазвичай випиваєш за день?';
  if (t.includes('їв') || t.includes('їсти') || t.includes('харч') || t.includes('снідан'))
    return 'Здорове харчування не має бути складним. Спробуй план на завтра: сніданок із білком, перекус із фруктами, повноцінний обід і легка вечеря. Який прийом їжі зазвичай пропускаєш найчастіше?';
  if (t.includes('втом') || t.includes('перерв') || t.includes('відпоч'))
    return 'Втома — це сигнал, а не слабкість. Можу запропонувати план перерв: 5 хвилин на 50 хвилин навчання, легка розтяжка шиї та плечей, стакан води. Чи є в тебе конкретний час, коли відчуваєш найбільшу втому?';
  return 'Дякую, що написав! Я тут, щоб допомогти без тиску. Що саме тобі хотілося б змінити спочатку — харчування, рух чи режим дня?';
}

export async function testConnection(settings: AISettings): Promise<{ ok: boolean; message: string }> {
  if (!isAIReady(settings)) return { ok: false, message: 'API-ключ порожній або занадто короткий.' };
  try {
    const raw = await callOpenRouter(settings, 'Ти — тест. Відповідай OK.', 'OK');
    return raw ? { ok: true, message: 'Підключення успішне!' } : { ok: false, message: 'Порожня відповідь.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Невідома помилка';
    return { ok: false, message: `Не вдалося підключитися: ${msg}` };
  }
}
