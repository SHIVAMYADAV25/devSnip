export interface Snippet {
  id: number;
  title: string;
  language: string;
  code: string;
  tags: string; // comma-separated
  favorite: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: number;
  snippet_id: number;
  file_path: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

export interface ExportRecord {
  id: number;
  snippet_id: number;
  file_path: string;
  format: string;
  created_at: string;
}

export interface FileItem {
  name: string;
  uri: string;
  isDirectory: boolean;
  size?: number;
  modificationTime?: number;
  folder?: string;
}

export interface FolderInfo {
  name: string;
  count: number;
  color: string;
  icon: string;
  lastModified?: string;
}

export type Language =
  | 'JavaScript' | 'TypeScript' | 'Python' | 'React' | 'React Native'
  | 'Node.js' | 'HTML' | 'CSS' | 'Rust' | 'Go' | 'Java'
  | 'Swift' | 'Kotlin' | 'SQL' | 'Bash' | 'Other';

export type ExportFormat = 'txt' | 'js' | 'json';

export type AIAction = 'explain' | 'summarize' | 'improve';

export type Theme = 'light' | 'dark' | 'system';

export type AIProvider = 'gemini' | 'openai' | 'claude';

export interface AppSettings {
  theme: Theme;
  aiProvider: AIProvider;
  fontSize: 'small' | 'medium' | 'large';
  sortBy: 'created_at' | 'updated_at' | 'title';
  sortOrder: 'ASC' | 'DESC';
}

export interface AIResult {
  snippetId: number;
  snippetTitle: string;
  action: AIAction;
  result: string;
  timestamp: string;
}

export interface Stats {
  totalSnippets: number;
  totalFavorites: number;
  totalFiles: number;
  totalExports: number;
}
