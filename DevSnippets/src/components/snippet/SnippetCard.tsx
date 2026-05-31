import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { LangBadge, TagChip } from '../ui';
import type { Snippet } from '../../types';

interface SnippetCardProps {
  snippet: Snippet;
  onPress: () => void;
  onFavorite: () => void;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function SnippetCard({ snippet, onPress, onFavorite }: SnippetCardProps) {
  const tags = snippet.tags ? snippet.tags.split(',').filter(Boolean).slice(0, 3) : [];

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <View style={styles.row}>
        {/* Language badge */}
        <LangBadge language={snippet.language} />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{snippet.title}</Text>
          <Text style={styles.lang}>{snippet.language}</Text>
        </View>

        {/* Time + Favorite */}
        <View style={styles.right}>
          <Text style={styles.time}>{timeAgo(snippet.updated_at || snippet.created_at)}</Text>
          <TouchableOpacity onPress={onFavorite} style={styles.favBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={snippet.favorite === 1 ? 'star' : 'star-outline'}
              size={18}
              color={snippet.favorite === 1 ? Colors.warning : Colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.tags}>
          {tags.map((tag) => (
            <TagChip key={tag} tag={tag.trim()} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadow.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  content: { flex: 1, marginLeft: Spacing.md },
  title: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  lang: { fontSize: FontSize.sm, color: Colors.textSecondary },
  right: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: FontSize.xs, color: Colors.textTertiary },
  favBtn: { marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.sm },
});
