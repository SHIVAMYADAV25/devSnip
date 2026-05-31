import React from 'react';
import {
  TouchableOpacity, Text, View, TextInput,
  StyleSheet, ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';

// ── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label, onPress, variant = 'primary', icon, loading, disabled,
  size = 'md', style, fullWidth,
}: ButtonProps) {
  const bg = {
    primary: Colors.primary,
    secondary: Colors.bgTertiary,
    danger: Colors.dangerBg,
    ghost: 'transparent',
  }[variant];

  const textColor = {
    primary: '#FFFFFF',
    secondary: Colors.textPrimary,
    danger: Colors.danger,
    ghost: Colors.primary,
  }[variant];

  const padding = size === 'sm' ? { paddingVertical: 7, paddingHorizontal: 14 }
    : size === 'lg' ? { paddingVertical: 15, paddingHorizontal: 24 }
    : { paddingVertical: 11, paddingHorizontal: 18 };

  const fontSize = size === 'sm' ? FontSize.sm : size === 'lg' ? FontSize.lg : FontSize.base;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        { backgroundColor: bg, ...padding },
        fullWidth && { width: '100%' },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <View style={styles.btnInner}>
          {icon && <Ionicons name={icon} size={16} color={textColor} style={{ marginRight: 6 }} />}
          <Text style={[styles.btnText, { color: textColor, fontSize }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Language Badge ────────────────────────────────────────────────────────────

const LANG_COLORS: Record<string, { bg: string; text: string; abbr: string }> = {
  TypeScript: { bg: '#DBEAFE', text: '#1D4ED8', abbr: 'TS' },
  JavaScript: { bg: '#FEF3C7', text: '#B45309', abbr: 'JS' },
  Python:     { bg: '#EDE9FE', text: '#6D28D9', abbr: 'PY' },
  React:      { bg: '#DBEAFE', text: '#0369A1', abbr: 'RX' },
  'React Native': { bg: '#DBEAFE', text: '#0369A1', abbr: 'RN' },
  'Node.js':  { bg: '#DCFCE7', text: '#15803D', abbr: 'NO' },
  HTML:       { bg: '#FEE2E2', text: '#B91C1C', abbr: 'HT' },
  CSS:        { bg: '#F3E8FF', text: '#7E22CE', abbr: 'CS' },
  Rust:       { bg: '#FFEDD5', text: '#C2410C', abbr: 'RS' },
  Go:         { bg: '#E0F2FE', text: '#075985', abbr: 'GO' },
  SQL:        { bg: '#F0FDF4', text: '#166534', abbr: 'SQ' },
  Bash:       { bg: '#F1F5F9', text: '#475569', abbr: 'SH' },
};

interface LangBadgeProps { language: string; size?: 'sm' | 'md' }

export function LangBadge({ language, size = 'md' }: LangBadgeProps) {
  const cfg = LANG_COLORS[language] ?? { bg: '#F3F4F6', text: '#6B7280', abbr: language.slice(0,2).toUpperCase() };
  const small = size === 'sm';
  return (
    <View style={[
      styles.langBadge,
      { backgroundColor: cfg.bg },
      small && { width: 26, height: 26, borderRadius: 6 },
    ]}>
      <Text style={[styles.langBadgeText, { color: cfg.text }, small && { fontSize: 9 }]}>
        {cfg.abbr}
      </Text>
    </View>
  );
}

export function LangLabel({ language }: { language: string }) {
  const cfg = LANG_COLORS[language] ?? { bg: '#F3F4F6', text: '#6B7280' };
  return (
    <View style={[styles.langLabel, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.langLabelText, { color: cfg.text }]}>{language}</Text>
    </View>
  );
}

// ── Tag Chip ──────────────────────────────────────────────────────────────────

export function TagChip({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <View style={styles.tagChip}>
      <Text style={styles.tagChipText}>{tag}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={{ marginLeft: 4 }}>
          <Ionicons name="close" size={12} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search snippets...', onFilterPress }: SearchBarProps) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={Colors.textTertiary} style={{ marginRight: 8 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          style={styles.searchInput}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {onFilterPress && (
        <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={32} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {action && (
        <Button label={action.label} onPress={action.onPress} style={{ marginTop: 16 }} />
      )}
    </View>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

export function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>View all</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnInner: { flexDirection: 'row', alignItems: 'center' },
  btnText: { fontWeight: '600' },

  langBadge: {
    width: 36, height: 36, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  langBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  langLabel: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  langLabelText: { fontSize: FontSize.xs, fontWeight: '600' },

  tagChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  tagChipText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500' },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.lg, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  filterBtn: {
    width: 42, height: 42, borderRadius: Radius.lg,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center', justifyContent: 'center',
  },

  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500' },

  divider: { height: 1, backgroundColor: Colors.border },
});
