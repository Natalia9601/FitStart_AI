import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AISettings, FavoriteRecipe, Habit, Recipe, UserProfile, View } from '@/types';
import { storage } from '@/lib/storage';
import { DEFAULT_HABITS } from '@/lib/mockData';
import { isAIReady } from '@/lib/api';
import Layout from '@/components/Layout';
import SettingsModal from '@/components/SettingsModal';
import ProfileModal from '@/components/ProfileModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import Dashboard from '@/components/Dashboard';
import RecipeGenerator from '@/components/RecipeGenerator';
import FitBuddy from '@/components/FitBuddy';
import Fitness from '@/components/Fitness';
import Habits from '@/components/Habits';
import Favorites from '@/components/Favorites';
import WaterTracker from '@/components/WaterTracker';
import StepCounter from '@/components/StepCounter';
import NutritionTracker from '@/components/NutritionTracker';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [settings, setSettings] = useState<AISettings>(storage.getAISettings());
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>(storage.getFavorites());
  const [habits, setHabits] = useState<Habit[]>(() => {
    const stored = storage.getHabits();
    return stored.length ? stored : DEFAULT_HABITS;
  });
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const aiReady = useMemo(() => isAIReady(settings), [settings]);

  useEffect(() => {
    storage.setAISettings(settings);
  }, [settings]);

  useEffect(() => {
    storage.setProfile(profile);
  }, [profile]);

  useEffect(() => {
    storage.setHabits(habits);
  }, [habits]);

  useEffect(() => {
    storage.setFavorites(favorites);
  }, [favorites]);

  const handleSaveSettings = useCallback((s: AISettings) => {
    setSettings(s);
  }, []);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);
  const openProfile = useCallback(() => setShowProfile(true), []);
  const closeProfile = useCallback(() => setShowProfile(false), []);

  function isFavorite(id: string) {
    return favorites.some((f) => f.id === id);
  }

  function toggleFavorite(r: Recipe) {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === r.id)) {
        return prev.filter((f) => f.id !== r.id);
      }
      return [{ ...r, savedAt: Date.now() }, ...prev];
    });
  }

  function removeFavorite(id: string) {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  function navigate(v: View) {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-50 bg-amber-soft/90 text-choco-800 text-center text-sm font-medium py-2 px-4 shadow-soft">
          Офлайн-режим: AI-функції працюють у демо-режимі. Дані зберігаються локально.
        </div>
      )}
      <Layout
        view={view}
        profile={profile}
        aiReady={aiReady}
        onNavigate={navigate}
        onOpenSettings={openSettings}
        onOpenProfile={openProfile}
      >
        <ErrorBoundary key={view}>
          {view === 'home' && (
            <Dashboard
              onNavigate={navigate}
              habits={habits}
              favoritesCount={favorites.length}
              profile={profile}
              onOpenProfile={openProfile}
            />
          )}
          {view === 'recipes' && (
            <RecipeGenerator
              settings={settings}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          )}
          {view === 'fitbuddy' && <FitBuddy settings={settings} profile={profile} />}
          {view === 'fitness' && <Fitness settings={settings} />}
          {view === 'habits' && <Habits habits={habits} onHabitsChange={setHabits} />}
          {view === 'favorites' && <Favorites favorites={favorites} onRemove={removeFavorite} />}
          {view === 'water' && <WaterTracker />}
          {view === 'steps' && <StepCounter />}
          {view === 'nutrition' && <NutritionTracker settings={settings} />}
        </ErrorBoundary>

        <footer className="mt-12 border-t border-cream-400/40 pt-6 text-center text-xs leading-relaxed text-choco-400">
          <p>FitStart AI — твій маленький крок до кращого самопочуття</p>
          <p className="mt-1 opacity-80">AI-образ і IMT — лише візуалізація та орієнтир, не медична порада.</p>
        </footer>
      </Layout>

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={closeSettings}
        />
      )}

      {showProfile && (
        <ProfileModal
          profile={profile}
          onSave={setProfile}
          onClose={closeProfile}
        />
      )}
    </>
  );
}
