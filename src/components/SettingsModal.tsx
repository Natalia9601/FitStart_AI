import { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, Loader2, Shield, Check, AlertTriangle, X } from 'lucide-react';
import type { AISettings } from '@/types';
import { testConnection, isAIReady } from '@/lib/api';

const MODELS = [
  { id: 'nvidia/nemotron-3.5-super-vl:free', label: 'NVIDIA: Nemotron 3.5 Super VL (free)' },
  { id: 'nvidia/nemotron-3.5-lightning:free', label: 'NVIDIA: Nemotron 3.5 Lightning (free)' },
  { id: 'xingchen-agi/xing4.0-29b-a4b:free', label: 'XinChen: Xing4.0 29B A4B (free)' },
  { id: 'dots-studio/dots-3-note-preview:free', label: 'Dots Studio: Dots3-Note Preview (free)' },
];

export default function SettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: AISettings;
  onSave: (s: AISettings) => void;
  onClose: () => void;
}) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model || MODELS[0].id);
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!show) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [show, onClose]);

  const ready = isAIReady({ apiKey, model });

  function handleSave() {
    onSave({ apiKey: apiKey.trim(), model });
    onClose();
  }

  async function handleTest() {
    setTesting(true);
    setResult(null);
    const r = await testConnection({ apiKey: apiKey.trim(), model });
    setResult(r);
    setTesting(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-choco-800/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card p-6 sm:p-8 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl text-choco-700">Налаштування AI</h2>
          <button onClick={onClose} className="btn-ghost !p-2" aria-label="Закрити">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-choco-600 mb-2">
              <KeyRound size={15} /> OpenRouter API Key
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setResult(null);
                }}
                placeholder="sk-or-v1-..."
                className="input-field pr-10 font-mono text-sm"
                autoComplete="off"
              />
              <button
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-choco-400 hover:text-choco-600 transition-colors"
                aria-label={show ? 'Сховати' : 'Показати'}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-choco-600 mb-2 block">Модель</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input-field cursor-pointer"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTest}
            disabled={!ready || testing}
            className="btn-soft w-full"
          >
            {testing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Перевірка...
              </>
            ) : (
              <>Перевірити підключення</>
            )}
          </button>

          {result && (
            <div
              className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium animate-fade-in ${
                result.ok
                  ? 'bg-sage-200/70 text-sage-500'
                  : 'bg-blush-100 text-blush-600'
              }`}
            >
              {result.ok ? <Check size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
              <span>{result.message}</span>
            </div>
          )}

          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-soft/40 px-4 py-3 text-xs text-choco-600 leading-relaxed">
            <Shield size={15} className="shrink-0 mt-0.5" />
            <p>
              Ключ зберігається лише у вашому браузері (LocalStorage). LocalStorage не є
              повністю безпечним — для публічного розгортання використовуйте серверний
              посередник. Ключ не виводиться в консоль і не відображається у відкритому вигляді.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-ghost flex-1">
              Скасувати
            </button>
            <button onClick={handleSave} className="btn-primary flex-1">
              Зберегти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
