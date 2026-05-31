import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '../types';

const SETTINGS_KEY = 'app_settings';
const RECENT_SEARCHES_KEY = 'recent_searches';
const ONBOARDED_KEY = 'onboarded';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  aiProvider: 'gemini',
  fontSize: 'medium',
  sortBy: 'created_at',
  sortOrder: 'DESC',
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const current = await getSettings();
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
  } catch {
    // silent fail
  }
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addRecentSearch(query: string): Promise<void> {
  try {
    const searches = await getRecentSearches();
    const updated = [query, ...searches.filter((s) => s !== query)].slice(0, 10);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // silent fail
  }
}

export async function clearRecentSearches(): Promise<void> {
  await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
}

export async function isOnboarded(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDED_KEY);
  return val === 'true';
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
}
