import { create } from 'zustand';
import type { Snippet, AIResult, AppSettings, AIProvider } from '../types';
import { getSettings, saveSettings } from '../services/PreferencesService';
import { getSavedProvider, saveProvider } from '../services/AIService';

interface AppState {
  // Selected snippet (for AI, detail, etc.)
  selectedSnippet: Snippet | null;
  setSelectedSnippet: (s: Snippet | null) => void;

  // Search state
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Filter state
  activeLanguage: string;
  setActiveLanguage: (l: string) => void;

  // AI state
  aiResult: AIResult | null;
  setAiResult: (r: AIResult | null) => void;
  isAILoading: boolean;
  setIsAILoading: (v: boolean) => void;

  // Current folder (Files)
  currentFolder: string;
  setCurrentFolder: (f: string) => void;

  // Settings
  settings: AppSettings;
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;

  // AI provider
  aiProvider: AIProvider;
  loadAiProvider: () => Promise<void>;
  setAiProvider: (p: AIProvider) => Promise<void>;

  // Refresh trigger
  snippetRefreshKey: number;
  triggerSnippetRefresh: () => void;

  fileRefreshKey: number;
  triggerFileRefresh: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  selectedSnippet: null,
  setSelectedSnippet: (s) => set({ selectedSnippet: s }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  activeLanguage: '',
  setActiveLanguage: (l) => set({ activeLanguage: l }),

  aiResult: null,
  setAiResult: (r) => set({ aiResult: r }),
  isAILoading: false,
  setIsAILoading: (v) => set({ isAILoading: v }),

  currentFolder: 'Templates',
  setCurrentFolder: (f) => set({ currentFolder: f }),

  settings: {
    theme: 'light',
    aiProvider: 'gemini',
    fontSize: 'medium',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  },

  loadSettings: async () => {
    const settings = await getSettings();
    set({ settings });
  },

  updateSetting: async (key, value) => {
    const current = get().settings;
    const updated = { ...current, [key]: value };
    set({ settings: updated });
    await saveSettings({ [key]: value });
  },

  aiProvider: 'gemini',

  loadAiProvider: async () => {
    const provider = await getSavedProvider();
    set({ aiProvider: provider });
  },

  setAiProvider: async (p) => {
    set({ aiProvider: p });
    await saveProvider(p);
  },

  snippetRefreshKey: 0,
  triggerSnippetRefresh: () =>
    set((state) => ({ snippetRefreshKey: state.snippetRefreshKey + 1 })),

  fileRefreshKey: 0,
  triggerFileRefresh: () =>
    set((state) => ({ fileRefreshKey: state.fileRefreshKey + 1 })),
}));
