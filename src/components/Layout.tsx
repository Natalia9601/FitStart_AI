import type { ReactNode } from 'react';
import {
  CheckSquare,
  ChevronRight,
  Droplet,
  Dumbbell,
  Heart,
  HeartPulse,
  Home,
  Settings,
  UtensilsCrossed,
} from 'lucide-react';
import type { UserProfile, View } from '@/types';
import { bmiInfo, bmiOf } from '@/lib/avatar';
import Logo from './Logo';
import UserAvatar from './UserAvatar';

type NavEntry = { id: View; label: string; icon: typeof Home; short: string };

const NAV: { group: string; items: NavEntry[] }[] = [
  {
    group: 'Огляд',
    items: [{ id: 'home', label: 'Головна', icon: Home, short: 'Головна' }],
  },
  {
    group: 'Щодення',
    items: [
      { id: 'recipes', label: 'Рецепти', icon: UtensilsCrossed, short: 'Рецепти' },
      { id: 'fitness', label: 'Тренування', icon: Dumbbell, short: 'Рух' },
      { id: 'habits', label: 'Звички', icon: CheckSquare, short: 'Звички' },
      { id: 'water', label: 'Вода', icon: Droplet, short: 'Вода' },
    ],
  },
  {
    group: 'Помічники',
    items: [
      { id: 'fitbuddy', label: 'FitBuddy AI', icon: HeartPulse, short: 'AI' },
      { id: 'favorites', label: 'Обране', icon: Heart, short: 'Обране' },
    ],
  },
];

const FLAT_NAV = NAV.flatMap((g) => g.items);

type Props = {
  view: View;
  profile: UserProfile;
  aiReady: boolean;
  onNavigate: (v: View) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  children: ReactNode;
};

export default function Layout({
  view,
  profile,
  aiReady,
  onNavigate,
  onOpenSettings,
  onOpenProfile,
  children,
}: Props) {
  const bmi = bmiOf(profile);
  const info = bmiInfo(bmi);

  return (
    <div className="relative min-h-screen lg:flex">
      {/* decorative background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blush-200/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-sage-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-soft/30 blur-3xl" />
      </div>

      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r border-cream-400/50 bg-cream-50/70 px-4 py-6 backdrop-blur-xl lg:flex">
        <button onClick={() => onNavigate('home')} className="mb-7 px-2 text-left" aria-label="На головну">
          <Logo />
        </button>

        <nav className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
          {NAV.map((group) => (
            <div key={group.group}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-choco-400">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = view === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`nav-item w-full ${active ? 'nav-item-active' : ''}`}
                    >
                      <span
                        className={`icon-tile h-8 w-8 ${
                          active ? 'bg-cream-100/15 text-cream-100' : 'bg-cream-300/70 text-choco-600'
                        }`}
                      >
                        <Icon size={17} />
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-blush-200" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-5 space-y-2">
          <button
            onClick={onOpenProfile}
            className="group flex w-full items-center gap-3 rounded-3xl border border-white/70 bg-cream-50/90 p-2.5 text-left shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-blush-100 to-sage-200">
              <UserAvatar profile={profile} variant="bust" size={52} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-choco-800">{profile.name}</span>
              <span className="block text-[11px]" style={{ color: info.color }}>
                IMT {bmi.toFixed(1)} · {info.label}
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-choco-400 transition-transform group-hover:translate-x-0.5" />
          </button>

          <div className="flex items-center gap-2">
            <button onClick={onOpenSettings} className="btn-soft flex-1 !px-3 !py-2 text-sm">
              <Settings size={16} /> AI
            </button>
            <span
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium ${
                aiReady ? 'bg-sage-200/70 text-sage-500' : 'bg-cream-300/70 text-choco-500'
              }`}
              title={aiReady ? 'OpenRouter підключено' : 'Демо-режим без API-ключа'}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${aiReady ? 'bg-sage-500' : 'bg-amber-soft'}`} />
              {aiReady ? 'AI' : 'Демо'}
            </span>
          </div>
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="sticky top-0 z-30 border-b border-cream-400/40 bg-cream-100/85 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => onNavigate('home')} aria-label="На головну">
            <Logo size={34} />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 rounded-full border border-white/70 bg-cream-50/90 py-1 pl-1 pr-3 shadow-soft"
              aria-label="Мій профіль"
            >
              <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-blush-100">
                <UserAvatar profile={profile} variant="bust" size={38} />
              </span>
              <span className="max-w-[5.5rem] truncate text-xs font-semibold text-choco-700">
                {profile.name}
              </span>
            </button>
            <button onClick={onOpenSettings} className="btn-ghost !p-2" aria-label="Налаштування AI">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* main */}
      <main className="relative min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1180px] px-4 pb-32 pt-5 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
          {children}
        </div>
      </main>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
        <div className="flex items-center gap-1 overflow-x-auto rounded-[1.4rem] border border-white/70 bg-cream-50/95 p-1.5 shadow-soft-lg backdrop-blur-xl no-scrollbar">
          {FLAT_NAV.map((item) => {
            const active = view === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`tab-item shrink-0 ${active ? 'tab-item-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={19} />
                {item.short}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
