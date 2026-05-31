import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Colors, Spacing, FontSize } from '../constants/theme';
import { getAllSnippets, toggleFavorite } from '../database/SQLiteService';
import { SnippetCard } from '../components/snippet/SnippetCard';
import { EmptyState, SearchBar } from '../components/ui';
import type { Snippet } from '../types';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const results = await getAllSnippets(search, '', true, 'updated_at', 'DESC');
    setSnippets(results);
  }, [search]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleFavorite = async (s: Snippet) => {
    await toggleFavorite(s.id, s.favorite);
    load();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Favorites</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.search}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search favorites..." />
      </View>

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
            icon="star-outline"
            title="No favorites yet"
            subtitle="Star any snippet to find it here quickly"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  back: { padding: 4 },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  search: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
});
