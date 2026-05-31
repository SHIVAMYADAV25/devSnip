export const Colors = {
  // Primary brand — orange/amber from design
  primary: '#F97316',
  primaryLight: '#FED7AA',
  primaryDark: '#EA580C',
  primaryBg: '#FFF7ED',

  // Backgrounds
  bg: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgTertiary: '#F3F4F6',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  // Language badge colors
  langTS: '#3178C6',
  langJS: '#F59E0B',
  langPY: '#3B82F6',
  langRust: '#F97316',
  langGo: '#06B6D4',
  langHTML: '#EF4444',
  langCSS: '#8B5CF6',
  langDefault: '#6B7280',

  // Semantic
  success: '#22C55E',
  successBg: '#F0FDF4',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderFocus: '#F97316',

  // Tab bar
  tabActive: '#F97316',
  tabInactive: '#9CA3AF',
  tabBg: '#FFFFFF',

  // Folder colors matching design
  folderTemplates: '#F97316',
  folderResources: '#3B82F6',
  folderExports: '#22C55E',
  folderScreenshots: '#8B5CF6',
  folderProjects: '#EC4899',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

export const Radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'React', 'React Native',
  'Node.js', 'HTML', 'CSS', 'Rust', 'Go', 'Java', 'Swift',
  'Kotlin', 'SQL', 'Bash', 'Other',
];

export const TAGS = [
  'react', 'hooks', 'storage', 'auth', 'api', 'utility',
  'algorithm', 'state', 'context', 'animation', 'navigation',
  'database', 'node', 'express', 'typescript', 'javascript',
  'python', 'testing', 'performance', 'security',
];

export const FOLDERS = ['Templates', 'Resources', 'Screenshots', 'Exports', 'Projects'];
