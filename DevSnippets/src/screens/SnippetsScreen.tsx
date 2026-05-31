import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Colors, Spacing, FontSize, Radius, Shadow } from '../constants/theme';
import { LANGUAGES } from '../constants/theme';
import { getAllSnippets, toggleFavorite } from '../database/SQLiteService';
import { SnippetCard } from '../components/snippet/SnippetCard';
import { SearchBar, EmptyState, Button } from '../components/ui';
import type { Snippet } from '../types';

export default function SnippetsScreen() {
  const navigation = useNavigation<any>();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [search, setSearch] = useState('');
  const [activeLang, setActiveLang] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const load = useCallback(async () => {
    const results = await getAllSnippets(search, activeLang, false, 'updated_at', 'DESC');
    setSnippets(results);
  }, [search, activeLang]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => { load(); }, [search, activeLang]);

  const handleFavorite = async (s: Snippet) => {
    await toggleFavorite(s.id, s.favorite);
    load();
  };

  const usedLanguages = [...new Set(snippets.map((s) => s.language))];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>All Snippets</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateSnippet')}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search snippets..."
          onFilterPress={() => setShowFilter(true)}
        />
      </View>

      {/* Language filter chips */}
      {usedLanguages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.langScroll}
          contentContainerStyle={styles.langRow}
        >
          <TouchableOpacity
            onPress={() => setActiveLang('')}
            style={[styles.allChip, !activeLang && styles.allChipActive]}
          >
            <Text style={[styles.allChipText, !activeLang && styles.allChipTextActive]}>All</Text>
          </TouchableOpacity>
          {usedLanguages.map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => setActiveLang(activeLang === lang ? '' : lang)}
              style={[styles.langChip, activeLang === lang && styles.langChipActive]}
            >
              <Text style={[styles.langChipText, activeLang === lang && styles.langChipTextActive]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Snippet list */}
      <FlatList
        data={snippets}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => (
          <SnippetCard
            snippet={item}
            onPress={() => navigation.navigate('SnippetDetail', { id: item.id })}
            onFavorite={() => handleFavorite(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="code-slash-outline"
            title={search ? 'No results found' : 'No snippets yet'}
            subtitle={search ? 'Try a different search term' : 'Tap + to create your first snippet'}
            action={!search ? { label: 'Create Snippet', onPress: () => navigation.navigate('CreateSnippet') } : undefined}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateSnippet')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Filter by Language</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => { setActiveLang(''); setShowFilter(false); }}
                style={[styles.filterOption, !activeLang && styles.filterOptionActive]}
              >
                <Text style={[styles.filterOptionText, !activeLang && { color: Colors.primary, fontWeight: '600' }]}>
                  All Languages
                </Text>
                {!activeLang && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
              </TouchableOpacity>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => { setActiveLang(lang); setShowFilter(false); }}
                  style={[styles.filterOption, activeLang === lang && styles.filterOptionActive]}
                >
                  <Text style={[styles.filterOptionText, activeLang === lang && { color: Colors.primary, fontWeight: '600' }]}>
                    {lang}
                  </Text>
                  {activeLang === lang && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button label="Done" onPress={() => setShowFilter(false)} fullWidth style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },

  searchContainer: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm },

  langScroll: { maxHeight: 44 },
  langRow: { paddingHorizontal: Spacing.xl, gap: 8, paddingBottom: 8 },
  allChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: Colors.bgTertiary,
  },
  allChipActive: { backgroundColor: Colors.primary },
  allChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  allChipTextActive: { color: '#FFF' },
  langChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full,
    backgroundColor: Colors.bgTertiary, borderWidth: 1, borderColor: Colors.border,
  },
  langChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  langChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  langChipTextActive: { color: Colors.primary },

  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 100 },

  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.lg,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, maxHeight: '75%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  filterOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  filterOptionActive: {},
  filterOptionText: { fontSize: FontSize.base, color: Colors.textPrimary },
});
