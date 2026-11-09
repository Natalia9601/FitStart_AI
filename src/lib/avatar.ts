import type { AccentKey, UserProfile } from '@/types';

export type Tone = { name: string; color: string; shade: string };

export const SKIN_TONES: Tone[] = [
  { name: 'Світла', color: '#F7DCC4', shade: '#EDC7A8' },
  { name: 'Тепла', color: '#F0C6A4', shade: '#E2B08B' },
  { name: 'Золота', color: '#DCA77C', shade: '#CB9061' },
  { name: 'Бронзова', color: '#BA7F57', shade: '#A66B45' },
  { name: 'Темна', color: '#82543A', shade: '#6E452E' },
];

export const HAIR_COLORS: Tone[] = [
  { name: 'Каштан', color: '#4A3027', shade: '#3A241D' },
  { name: 'Чорне', color: '#2A1E1B', shade: '#1D1412' },
  { name: 'Русяве', color: '#A97C50', shade: '#8E6540' },
  { name: 'Світле', color: '#E0C48C', shade: '#C9A96C' },
  { name: 'Руде', color: '#B4552F', shade: '#984323' },
  { name: 'Рожеве', color: '#C0788F', shade: '#A55E74' },
];

export const ACCENTS: Record<
  AccentKey,
  { name: string; main: string; deep: string; soft: string; tint: string }
> = {
  blush: { name: 'Рожевий', main: '#CF8FA3', deep: '#A55E74', soft: '#F4DDE3', tint: '#FBEDF1' },
  sage: { name: 'Шавлія', main: '#8FB894', deep: '#5B8A63', soft: '#DCE8DD', tint: '#F0F5F0' },
  amber: { name: 'Медовий', main: '#EFC98B', deep: '#BF8B3F', soft: '#F7E9CF', tint: '#FDF6E8' },
  choco: { name: 'Шоколад', main: '#A98270', deep: '#6B4E44', soft: '#EDE0D4', tint: '#F8F1E9' },
};

export const ACCENT_KEYS: AccentKey[] = ['blush', 'sage', 'amber', 'choco'];

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function bmiOf(profile: UserProfile): number {
  const h = profile.heightCm / 100;
  if (!h) return 0;
  return Math.round((profile.weightKg / (h * h)) * 10) / 10;
}

export type BmiInfo = {
  label: string;
  hint: string;
  tone: 'low' | 'normal' | 'high';
  color: string;
  bg: string;
};

export function bmiInfo(bmi: number): BmiInfo {
  if (bmi < 18.5) {
    return {
      label: 'нижче орієнтиру',
      hint: 'Додай поживні перекуси та не пропускай сніданок.',
      tone: 'low',
      color: '#BF8B3F',
      bg: '#FDF6E8',
    };
  }
  if (bmi < 25) {
    return {
      label: 'у комфортній зоні',
      hint: 'Тримай свій ритм — ти вже робиш добре.',
      tone: 'normal',
      color: '#5B8A63',
      bg: '#F0F5F0',
    };
  }
  if (bmi < 30) {
    return {
      label: 'трохи вище орієнтиру',
      hint: 'Більше руху в задоволення і більше овочів — без тиску.',
      tone: 'high',
      color: '#A55E74',
      bg: '#FBEDF1',
    };
  }
  return {
    label: 'вище орієнтиру',
    hint: 'Почни з маленьких кроків: прогулянка і вода щодня.',
    tone: 'high',
    color: '#A55E74',
    bg: '#FBEDF1',
  };
}

export function waterNormMl(weightKg: number): number {
  return Math.max(1500, Math.min(4000, Math.round(weightKg * 35)));
}

/**
 * Стискає завантажене фото у квадратний data-URL JPEG (макс. 512px),
 * щоб зручно зберігалося в localStorage.
 */
export function processAvatarImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Файл не є зображенням'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 512;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Не вдалося обробити фото'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не вдалося завантажити фото'));
    };
    img.src = url;
  });
}

export type TipContext = {
  habitsDone: number;
  habitsTotal: number;
  waterDrunk: number;
  waterGoal: number;
  favoritesCount: number;
};

export function avatarTip(profile: UserProfile, ctx: TipContext): string {
  const bmi = bmiOf(profile);
  const info = bmiInfo(bmi);
  const waterLeft = Math.max(0, ctx.waterGoal - ctx.waterDrunk);
  const hour = new Date().getHours();

  if (ctx.waterDrunk === 0 && hour >= 9) {
    return `Привіт, ${profile.name}! Почни день зі склянки води — до норми залишилось ${waterLeft} мл.`;
  }
  if (ctx.waterDrunk > 0 && ctx.waterDrunk < ctx.waterGoal * 0.5 && hour >= 14) {
    return `Ти випив ${ctx.waterDrunk} з ${ctx.waterGoal} мл. Ще ${waterLeft} мл — і норма закрита.`;
  }
  if (ctx.habitsTotal > 0 && ctx.habitsDone < ctx.habitsTotal) {
    const left = ctx.habitsTotal - ctx.habitsDone;
    return `Сьогодні виконано ${ctx.habitsDone} з ${ctx.habitsTotal} звичок. Залишилось ${left} — обери найлегшу.`;
  }
  if (ctx.habitsTotal > 0 && ctx.habitsDone === ctx.habitsTotal) {
    return 'Усі звички на сьогодні виконано. Можна відпочити без провини — це теж турбота.';
  }
  if (ctx.favoritesCount === 0) {
    return 'Зазирни в «Рецепти» — збережи страву, яку справді хочеться приготувати.';
  }
  return `${info.hint} Твій орієнтир зараз — ${info.label}.`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Доброї ночі';
  if (h < 12) return 'Доброго ранку';
  if (h < 18) return 'Доброго дня';
  return 'Доброго вечора';
}

const MONTHS = [
  'січня',
  'лютого',
  'березня',
  'квітня',
  'травня',
  'червня',
  'липня',
  'серпня',
  'вересня',
  'жовтня',
  'листопада',
  'грудня',
];

const WEEKDAYS = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п’ятниця', 'субота'];

export function todayLabel(date = new Date()): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}
