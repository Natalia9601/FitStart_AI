import { useEffect, useRef, useState } from 'react';
import { Check, Ruler, Scale, Sparkles, UserRound, X } from 'lucide-react';
import type { AccentKey, Gender, UserProfile } from '@/types';
import {
  ACCENTS,
  ACCENT_KEYS,
  HAIR_COLORS,
  SKIN_TONES,
  bmiInfo,
  bmiOf,
  waterNormMl,
} from '@/lib/avatar';
import { trapFocus } from '@/lib/focus';
import UserAvatar from './UserAvatar';

const GENDERS: { key: Gender; label: string; emoji: string }[] = [
  { key: 'female', label: 'Жіноча', emoji: '👩' },
  { key: 'male', label: 'Чоловіча', emoji: '👨' },
  { key: 'neutral', label: 'Нейтральна', emoji: '🧑' },
];

type Props = {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onClose: () => void;
};

export default function ProfileModal({ profile, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<UserProfile>(profile);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    modalRef.current?.focus();
    const untrap = trapFocus(modalRef.current, onClose);
    return () => {
      untrap();
      prev?.focus?.();
    };
  }, [onClose]);

  const bmi = bmiOf(draft);
  const info = bmiInfo(bmi);

  function patch(part: Partial<UserProfile>) {
    setDraft((prev) => ({ ...prev, ...part }));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 animate-fade-in">
      <div className="absolute inset-0 bg-choco-800/45 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} tabIndex={-1} className="relative my-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/70 bg-cream-50 shadow-soft-lg animate-scale-in outline-none">
        <div className="flex items-center justify-between gap-3 border-b border-cream-400/50 px-6 py-4">
          <div>
            <p className="eyebrow">Мій профіль</p>
            <h2 className="font-display text-2xl text-choco-800">AI-людина, схожа на тебе</h2>
          </div>
          <button onClick={onClose} className="btn-ghost !p-2" aria-label="Закрити">
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[240px_1fr] sm:p-7">
          {/* live preview */}
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-blush-100 via-cream-100 to-sage-200/60 p-4">
            <div className="flex items-center justify-center">
              <UserAvatar profile={draft} size={210} />
            </div>
            <div className="mt-1 text-center">
              <p className="font-display text-xl text-choco-800">{draft.name.trim() || 'Без імені'}</p>
              <p className="text-xs text-choco-500">
                {draft.heightCm} см · {draft.weightKg} кг
              </p>
            </div>
            <div
              className="mt-3 flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-xs font-medium"
              style={{ background: info.bg, color: info.color }}
            >
              <span>IMT {bmi.toFixed(1)}</span>
              <span className="text-right">{info.label}</span>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-choco-500">
              <Sparkles size={13} className="mt-0.5 shrink-0" />
              IMT — лише орієнтир, не діагноз. Образ змінюється разом із твоїми параметрами.
            </p>
          </div>

          {/* controls */}
          <div className="space-y-5">
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-choco-600">
                <UserRound size={15} /> Як до тебе звертатися?
              </label>
              <input
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value.slice(0, 24) })}
                placeholder="Твоє ім'я або нік"
                className="input-field"
                autoFocus
              />
            </div>

            <div>
              <span className="mb-2 block text-sm font-semibold text-choco-600">Стать</span>
              <div className="grid grid-cols-3 gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.key}
                    onClick={() => patch({ gender: g.key })}
                    className={`chip justify-center ${draft.gender === g.key ? 'chip-on' : 'chip-off'}`}
                  >
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-choco-600">
                  <span className="flex items-center gap-1.5">
                    <Ruler size={15} /> Зріст
                  </span>
                  <span className="text-choco-700">{draft.heightCm} см</span>
                </div>
                <input
                  type="range"
                  min={140}
                  max={210}
                  step={1}
                  value={draft.heightCm}
                  onChange={(e) => patch({ heightCm: Number(e.target.value) })}
                  className="range"
                  aria-label="Зріст у сантиметрах"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-choco-600">
                  <span className="flex items-center gap-1.5">
                    <Scale size={15} /> Вага
                  </span>
                  <span className="text-choco-700">{draft.weightKg} кг</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={150}
                  step={1}
                  value={draft.weightKg}
                  onChange={(e) => patch({ weightKg: Number(e.target.value) })}
                  className="range"
                  aria-label="Вага в кілограмах"
                />
              </div>
            </div>

            <p className="rounded-2xl bg-cream-100 px-4 py-2.5 text-xs text-choco-500">
              Норма води за твоєю вагою:{' '}
              <span className="font-semibold text-choco-700">{waterNormMl(draft.weightKg)} мл</span> на день.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-choco-500">
                  Відтінок шкіри
                </span>
                <div className="flex flex-wrap gap-2">
                  {SKIN_TONES.map((t, i) => (
                    <button
                      key={t.name}
                      onClick={() => patch({ skinTone: i })}
                      title={t.name}
                      aria-label={t.name}
                      className={`grid h-9 w-9 place-items-center rounded-full transition-all ${
                        draft.skinTone === i ? 'ring-2 ring-choco-600 ring-offset-2 ring-offset-cream-50' : ''
                      }`}
                      style={{ background: t.color }}
                    >
                      {draft.skinTone === i && <Check size={15} className="text-choco-800" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-choco-500">
                  Колір волосся
                </span>
                <div className="flex flex-wrap gap-2">
                  {HAIR_COLORS.map((t, i) => (
                    <button
                      key={t.name}
                      onClick={() => patch({ hairColor: i })}
                      title={t.name}
                      aria-label={t.name}
                      className={`grid h-9 w-9 place-items-center rounded-full transition-all ${
                        draft.hairColor === i ? 'ring-2 ring-choco-600 ring-offset-2 ring-offset-cream-50' : ''
                      }`}
                      style={{ background: t.color }}
                    >
                      {draft.hairColor === i && <Check size={15} className="text-cream-100" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-choco-500">
                Акцентний колір
              </span>
              <div className="flex flex-wrap gap-2">
                {ACCENT_KEYS.map((key: AccentKey) => (
                  <button
                    key={key}
                    onClick={() => patch({ accent: key })}
                    className={`chip ${draft.accent === key ? 'chip-on' : 'chip-off'}`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ background: ACCENTS[key].main }}
                    />
                    {ACCENTS[key].name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-cream-400/50 bg-cream-100/60 px-6 py-4">
          <button onClick={onClose} className="btn-ghost">
            Скасувати
          </button>
          <button
            onClick={() => {
              onSave({ ...draft, name: draft.name.trim() || 'Друг' });
              onClose();
            }}
            className="btn-primary"
          >
            <Check size={18} /> Зберегти профіль
          </button>
        </div>
      </div>
    </div>
  );
}
