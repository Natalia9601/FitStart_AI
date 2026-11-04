import { useEffect, useMemo, useState } from 'react';
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

  function handleSaveSettings(s: AISettings) {
    setSettings(s);
  }

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
      <Layout
        view={view}
        profile={profile}
        aiReady={aiReady}
        onNavigate={navigate}
        onOpenSettings={() => setShowSettings(true)}
        onOpenProfile={() => setShowProfile(true)}
      >
        <ErrorBoundary key={view}>
          {view === 'home' && (
            <Dashboard
              onNavigate={navigate}
              habits={habits}
              favoritesCount={favorites.length}
              profile={profile}
              onOpenProfile={() => setShowProfile(true)}
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
          onClose={() => setShowSettings(false)}
        />
      )}

      {showProfile && (
        <ProfileModal
          profile={profile}
          onSave={setProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}
