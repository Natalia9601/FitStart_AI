import { useEffect, useRef, useState } from 'react';
import { HeartPulse, Loader2, Send, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import type { AISettings, ChatMessage, UserProfile } from '@/types';
import { chatReply } from '@/lib/api';
import { storage } from '@/lib/storage';
import UserAvatar from './UserAvatar';

const STARTERS = [
  'Допоможи спланувати харчування на день',
  'Ідеї простого перекусу',
  'Як краще відпочити після навчання?',
  'Нагадування про воду й сон',
];

function welcome(name: string): ChatMessage {
  return {
    id: 'init',
    role: 'assistant',
    text: `Привіт, ${name}! Я FitBuddy — твій помічник для легкого харчування та здорових звичок без тиску. Що тебе хвилює сьогодні?`,
    ts: Date.now(),
  };
}

export default function FitBuddy({ settings, profile }: { settings: AISettings; profile: UserProfile }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = storage.getChat();
    return saved.length ? saved : [welcome(profile.name)];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    storage.setChat(messages.slice(-60));
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function clearChat() {
    const init = [welcome(profile.name)];
    setMessages(init);
    storage.setChat(init);
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: content, ts: Date.now() };
    const history = [...messages, userMsg].map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const reply = await chatReply(
      settings,
      history.slice(-8),
    );
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: 'assistant', text: reply, ts: Date.now() },
    ]);
    setLoading(false);
  }

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="section-title mb-1">FitBuddy AI</h1>
        <p className="text-choco-500">Дружній помічник зі збалансованого харчування та здорових звичок</p>
      </div>

      <div className="glass-card flex flex-col h-[70vh] min-h-[500px]">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-cream-400/40">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center w-10 h-10 rounded-2xl bg-primary-100 text-primary-600">
              <HeartPulse size={22} />
            </div>
            <div>
              <p className="font-semibold text-choco-700 text-sm">FitBuddy</p>
              <p className="text-xs text-sage-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400" /> Онлайн
              </p>
            </div>
          </div>
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="btn-ghost !px-3 !py-1.5 text-xs"
              aria-label="Очистити історію чату"
            >
              <Trash2 size={14} /> Очистити
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-4"
          aria-live="polite"
          aria-label="Історія чату"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
            >
              {m.role === 'assistant' && (
                <span className="icon-tile mb-0.5 h-8 w-8 border border-white/70 bg-cream-300/70 text-choco-600">
                  <HeartPulse size={16} />
                </span>
              )}
              <div
                className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-relaxed sm:max-w-[70%] ${
                  m.role === 'user'
                    ? 'rounded-br-md bg-choco-700 text-cream-100'
                    : 'rounded-bl-md border border-cream-400/40 bg-cream-50 text-choco-600'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'user' && (
                <span className="mb-0.5 grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-white/70 bg-blush-100">
                  <UserAvatar profile={profile} variant="bust" size={36} />
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-cream-50 border border-cream-400/40 rounded-3xl rounded-tl-md px-5 py-4 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-choco-400" />
                <span className="text-sm text-choco-400">FitBuddy думає…</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick starters */}
        {messages.length <= 1 && (
          <div className="px-4 sm:px-5 pb-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-choco-400">
              <Sparkles size={12} /> Спробуй запитати
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-2xl border border-cream-400/60 bg-cream-50/80 px-3.5 py-2.5 text-left text-xs font-medium text-choco-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-soft"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-cream-400/40 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напиши щось..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary !px-4 !py-3 shrink-0"
              aria-label="Надіслати"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl bg-cream-300/40 px-4 py-3 text-xs text-choco-500 leading-relaxed">
        <ShieldCheck size={15} className="shrink-0 mt-0.5" />
        <p>
          FitBuddy не ставить медичних діагнозів, не призначає ліків і не рекомендує голодування
          чи екстремальні дієти. Якщо погано або є травма — припини вправу і звернися до дорослого, якому довіряєш, та медичного фахівця.
        </p>
      </div>
    </div>
  );
}
