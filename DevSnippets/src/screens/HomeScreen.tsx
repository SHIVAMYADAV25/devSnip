import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Colors, Spacing, FontSize, Radius, Shadow } from '../constants/theme';
import { getAllSnippets, getStats } from '../database/SQLiteService';
import { getFolderCount } from '../services/FileService';
import { StatsRow } from '../components/ui/StatCard';
import { SnippetCard } from '../components/snippet/SnippetCard';
import { SectionHeader, EmptyState } from '../components/ui';
import { toggleFavorite } from '../database/SQLiteService';
import type { Snippet, Stats } from '../types';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  
  const [stats, setStats] = useState<Stats>({ totalSnippets: 0, totalFavorites: 0, totalFiles: 0, totalExports: 0 });
  const [recentSnippets, setRecentSnippets] = useState<Snippet[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, snippets, fc] = await Promise.all([
        getStats(),
        getAllSnippets('', '', false, 'created_at', 'DESC'),
        getFolderCount('Screenshots').then(async (c) => {
          let total = c;
          for (const f of ['Templates', 'Resources', 'Exports', 'Projects']) {
            total += await getFolderCount(f);
          }
          return total;
        }),
      ]);
      setStats({ ...s, totalFiles: fc });
      setRecentSnippets(snippets.slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleFavorite = async (snippet: Snippet) => {
    await toggleFavorite(snippet.id, snippet.favorite);
    load();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => {}}>
            <Ionicons name="menu" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bellBtn} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <View style={styles.greetingRow}>
            <Text style={styles.name}>Developer 👋</Text>
          </View>
          <Text style={styles.subtitle}>Workspace Overview</Text>
        </View>

        {/* Stats */}
        <StatsRow
          snippets={stats.totalSnippets}
          favorites={stats.totalFavorites}
          files={stats.totalFiles}
          exports={stats.totalExports}
        />

        {/* Recent Snippets */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Snippets"
            onSeeAll={() => navigation.navigate('Snippets')}
          />
          {recentSnippets.length === 0 ? (
            <EmptyState
              icon="code-slash-outline"
              title="No snippets yet"
              subtitle="Create your first snippet to get started"
            />
          ) : (
            recentSnippets.map((s) => (
              <SnippetCard
                key={s.id}
                snippet={s}
                onPress={() => navigation.navigate('SnippetDetail', { id: s.id })}
                onFavorite={() => handleFavorite(s)}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actions}>
            <QuickAction
              icon="add-circle"
              label="New Snippet"
              color={Colors.primary}
              onPress={() => navigation.navigate('CreateSnippet')}
            />
            <QuickAction
              icon="folder-open"
              label="Open Files"
              color={Colors.info}
              onPress={() => navigation.navigate('Files')}
            />
            <QuickAction
              icon="sparkles"
              label="Explain Code"
              color="#8B5CF6"
              onPress={() => navigation.navigate('Explain')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.quickAction} activeOpacity={0.7}>
      <View style={[styles.qaIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  menuBtn: { padding: 4 },
  bellBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center', justifyContent: 'center',
  },

  greetingSection: { marginBottom: Spacing.xl },
  greeting: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: '400' },
  greetingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 4 },

  section: { marginTop: Spacing.xxl },

  actions: { flexDirection: 'row', gap: Spacing.md },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  qaIcon: {
    width: 48, height: 48, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  qaLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
});
