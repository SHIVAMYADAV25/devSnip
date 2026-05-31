import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { getSnippet, toggleFavorite, deleteSnippet } from '../database/SQLiteService';
import { exportSnippet } from '../services/ExportService';
import { useAppStore } from '../store/useAppStore';
import { CodeViewer } from '../components/snippet/CodeEditor';
import { LangLabel, TagChip, Button } from '../components/ui';
import type { Snippet, ExportFormat } from '../types';

export default function SnippetDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setSelectedSnippet } = useAppStore();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      const s = await getSnippet(route.params?.id);
      setSnippet(s);
    })();
  }, [route.params?.id]));

  if (!snippet) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tags = snippet.tags ? snippet.tags.split(',').filter(Boolean) : [];

  const handleFavorite = async () => {
    await toggleFavorite(snippet.id, snippet.favorite);
    const updated = await getSnippet(snippet.id);
    setSnippet(updated);
  };

  const handleDelete = async () => {
    await deleteSnippet(snippet.id);
    navigation.goBack();
  };

  const handleExport = async (format: ExportFormat) => {
    setShowExport(false);
    try {
      await exportSnippet(snippet, format, true);
      Alert.alert('Exported!', `Snippet exported as .${format} and saved to Exports folder.`);
    } catch (e) {
      Alert.alert('Error', 'Export failed. Please try again.');
    } finally {
    }
  };

  const handleExplain = () => {
    setSelectedSnippet(snippet);
    navigation.navigate('Explain');
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleFavorite} style={styles.iconBtn}>
            <Ionicons
              name={snippet.favorite === 1 ? 'star' : 'star-outline'}
              size={22}
              color={snippet.favorite === 1 ? Colors.warning : Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditSnippet', { snippet })}
            style={styles.iconBtn}
          >
            <Ionicons name="create-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowDelete(true)}
            style={[styles.iconBtn, { backgroundColor: Colors.dangerBg }]}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title & Language */}
        <View style={styles.titleSection}>
          <LangLabel language={snippet.language} />
          <Text style={styles.title}>{snippet.title}</Text>
          <Text style={styles.date}>Created {formatDate(snippet.created_at)}</Text>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((t) => <TagChip key={t} tag={t.trim()} />)}
          </View>
        )}

        {/* Code */}
        <View style={styles.section}>
          <CodeViewer code={snippet.code} language={snippet.language} maxHeight={400} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          <ActionBtn icon="sparkles-outline" label="Explain" color="#8B5CF6" onPress={handleExplain} />
          <ActionBtn icon="share-outline" label="Share" color={Colors.info} onPress={() => setShowExport(true)} />
          <ActionBtn icon="download-outline" label="Export" color={Colors.success} onPress={() => setShowExport(true)} />
        </View>
      </ScrollView>

      {/* Export Modal */}
      <Modal visible={showExport} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Export Snippet As</Text>
            {(['txt', 'js', 'json'] as ExportFormat[]).map((fmt) => (
              <TouchableOpacity
                key={fmt}
                onPress={() => handleExport(fmt)}
                style={styles.exportOption}
              >
                <View style={[styles.fmtIcon, { backgroundColor: fmt === 'txt' ? Colors.infoBg : fmt === 'js' ? Colors.warningBg : Colors.successBg }]}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={fmt === 'txt' ? Colors.info : fmt === 'js' ? Colors.warning : Colors.success}
                  />
                </View>
                <View>
                  <Text style={styles.fmtName}>
                    {fmt === 'txt' ? 'Text File (.txt)' : fmt === 'js' ? 'JavaScript File (.js)' : 'JSON File (.json)'}
                  </Text>
                  <Text style={styles.fmtDesc}>Saves to Exports folder & shares</Text>
                </View>
              </TouchableOpacity>
            ))}
            <Button label="Cancel" onPress={() => setShowExport(false)} variant="secondary" fullWidth style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal visible={showDelete} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.deleteCard}>
            <View style={styles.deleteIcon}>
              <Ionicons name="warning-outline" size={32} color={Colors.danger} />
            </View>
            <Text style={styles.deleteTitle}>Delete Snippet?</Text>
            <Text style={styles.deleteMsg}>This action cannot be undone.</Text>
            <View style={styles.deleteActions}>
              <Button label="Cancel" onPress={() => setShowDelete(false)} variant="secondary" style={{ flex: 1 }} />
              <Button label="Delete" onPress={handleDelete} variant="danger" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ActionBtn({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionBtn} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.actionBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.bgTertiary, alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 40 },

  titleSection: { marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, marginTop: 8, marginBottom: 4 },
  date: { fontSize: FontSize.sm, color: Colors.textTertiary },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.lg },

  section: { marginBottom: Spacing.xl },

  actionGrid: {
    flexDirection: 'row', gap: 12,
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  actionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, gap: 6,
  },
  actionBtnText: { fontSize: FontSize.xs, fontWeight: '600' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  exportOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  fmtIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  fmtName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  fmtDesc: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },

  deleteCard: {
    margin: 32, backgroundColor: Colors.bg, borderRadius: Radius.xl,
    padding: Spacing.xxl, alignItems: 'center',
  },
  deleteIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.dangerBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  deleteTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  deleteMsg: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: 24 },
  deleteActions: { flexDirection: 'row', gap: 12, width: '100%' },
});
