import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

import { Colors, Spacing, FontSize, Radius, Shadow } from '../constants/theme';
import { getAllSnippets } from '../database/SQLiteService';
import { runAIAction, hasApiKey } from '../services/AIService';
import { useAppStore } from '../store/useAppStore';
import { LangBadge, Button, EmptyState } from '../components/ui';
import type { Snippet, AIAction } from '../types';

const AI_ACTIONS: { key: AIAction; label: string; desc: string; icon: string; color: string }[] = [
  { key: 'explain',   label: 'Explain',   desc: 'Understand the code',  icon: 'bulb-outline',      color: Colors.primary },
  { key: 'summarize', label: 'Summarize', desc: 'Short summary',        icon: 'document-text-outline', color: Colors.info },
  { key: 'improve',   label: 'Improve',   desc: 'Get suggestions',      icon: 'trending-up-outline', color: Colors.success },
];

export default function ExplainScreen() {
  const navigation = useNavigation<any>();
  const { selectedSnippet, setSelectedSnippet, aiProvider, setAiResult, setIsAILoading } = useAppStore();

  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [activeAction, setActiveAction] = useState<AIAction>('explain');
  const [isOnline, setIsOnline] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showSnippetPicker, setShowSnippetPicker] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useFocusEffect(useCallback(() => {
    getAllSnippets('', '', false, 'updated_at', 'DESC').then(setSnippets);
    hasApiKey(aiProvider).then(setHasKey);
    NetInfo.fetch().then((state) => setIsOnline(!!state.isConnected));
  }, [aiProvider]));

  const handleGenerate = async () => {
    if (!selectedSnippet) {
      Alert.alert('Select a snippet', 'Please select a code snippet first.');
      return;
    }
    if (!isOnline) {
      Alert.alert('No Internet', 'AI explanation requires an internet connection.');
      return;
    }
    if (!hasKey) {
      Alert.alert(
        'API Key Required',
        `Please add your ${aiProvider} API key in Settings → AI to use this feature.`,
        [
          { text: 'Go to Settings', onPress: () => navigation.navigate('Settings') },
          { text: 'Cancel' },
        ]
      );
      return;
    }

    setGenerating(true);
    setIsAILoading(true);
    try {
      const result = await runAIAction(activeAction, selectedSnippet.code, selectedSnippet.language, aiProvider);
      setAiResult({
        snippetId: selectedSnippet.id,
        snippetTitle: selectedSnippet.title,
        action: activeAction,
        result,
        timestamp: new Date().toISOString(),
      });
      navigation.navigate('AIResult');
    } catch (e: any) {
      Alert.alert('AI Error', e?.message ?? 'Something went wrong. Check your API key and try again.');
    } finally {
      setGenerating(false);
      setIsAILoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explain Code</Text>
        <View style={[styles.badge, { backgroundColor: isOnline ? Colors.successBg : Colors.dangerBg }]}>
          <View style={[styles.dot, { backgroundColor: isOnline ? Colors.success : Colors.danger }]} />
          <Text style={[styles.badgeText, { color: isOnline ? Colors.success : Colors.danger }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1 - Choose Snippet */}
        <View style={styles.step}>
          <Text style={styles.stepLabel}>1. Choose Snippet</Text>
          <TouchableOpacity
            onPress={() => setShowSnippetPicker(true)}
            style={styles.snippetSelector}
          >
            {selectedSnippet ? (
              <View style={styles.selectedSnippet}>
                <LangBadge language={selectedSnippet.language} size="sm" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.selectedTitle} numberOfLines={1}>{selectedSnippet.title}</Text>
                  <Text style={styles.selectedLang}>{selectedSnippet.language}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </View>
            ) : (
              <View style={styles.placeholderRow}>
                <Ionicons name="code-slash-outline" size={20} color={Colors.textTertiary} />
                <Text style={styles.placeholderText}>Select a snippet...</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Step 2 - Choose Action */}
        <View style={styles.step}>
          <Text style={styles.stepLabel}>2. What do you want to do?</Text>
          <View style={styles.actionsGrid}>
            {AI_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.key}
                onPress={() => setActiveAction(action.key)}
                style={[
                  styles.actionCard,
                  activeAction === action.key && {
                    backgroundColor: action.color + '12',
                    borderColor: action.color,
                  },
                ]}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, activeAction === action.key && { color: action.color }]}>
                  {action.label}
                </Text>
                <Text style={styles.actionDesc}>{action.desc}</Text>
                {activeAction === action.key && (
                  <View style={[styles.activeCheck, { backgroundColor: action.color }]}>
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Offline banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={18} color={Colors.danger} />
            <Text style={styles.offlineText}>Internet required for AI features</Text>
          </View>
        )}

        {/* No API key warning */}
        {!hasKey && isOnline && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.keyWarning}
          >
            <Ionicons name="key-outline" size={18} color={Colors.warning} />
            <Text style={styles.keyWarningText}>
              No API key set for {aiProvider}. Tap to configure in Settings.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
          </TouchableOpacity>
        )}

        {/* Recent explanations (placeholder) */}
        <View style={styles.step}>
          <Text style={styles.stepLabel}>Recent Explanations</Text>
          {snippets.slice(0, 2).map((s) => (
            <View key={s.id} style={styles.recentRow}>
              <LangBadge language={s.language} size="sm" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.recentTitle} numberOfLines={1}>{s.title}</Text>
                <Text style={styles.recentTime}>Tap to explain</Text>
              </View>
              <TouchableOpacity
                onPress={() => { setSelectedSnippet(s); }}
                style={styles.useBtn}
              >
                <Text style={styles.useBtnText}>Use</Text>
              </TouchableOpacity>
            </View>
          ))}
          {snippets.length === 0 && (
            <Text style={styles.emptyRecent}>No snippets yet</Text>
          )}
        </View>
      </ScrollView>

      {/* Generate button */}
      <View style={styles.footer}>
        <Button
          label={generating ? 'Generating...' : `Generate ${activeAction.charAt(0).toUpperCase() + activeAction.slice(1)}`}
          onPress={handleGenerate}
          loading={generating}
          disabled={!isOnline || !selectedSnippet}
          fullWidth
          size="lg"
          icon="sparkles-outline"
        />
      </View>

      {/* Snippet Picker Modal */}
      {showSnippetPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.handle} />
            <Text style={styles.pickerTitle}>Select Snippet</Text>
            {snippets.length === 0 ? (
              <EmptyState icon="code-slash-outline" title="No snippets" subtitle="Create a snippet first" />
            ) : (
              <FlatList
                data={snippets}
                keyExtractor={(s) => String(s.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => { setSelectedSnippet(item); setShowSnippetPicker(false); }}
                    style={styles.pickerItem}
                  >
                    <LangBadge language={item.language} size="sm" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.pickerItemTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.pickerItemLang}>{item.language}</Text>
                    </View>
                    {selectedSnippet?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 400 }}
              />
            )}
            <Button
              label="Cancel"
              onPress={() => setShowSnippetPicker(false)}
              variant="secondary"
              fullWidth
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },

  content: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },

  step: { marginBottom: Spacing.xxl },
  stepLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md },

  snippetSelector: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  selectedSnippet: { flexDirection: 'row', alignItems: 'center' },
  selectedTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  selectedLang: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  placeholderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  placeholderText: { flex: 1, fontSize: FontSize.base, color: Colors.textTertiary },

  actionsGrid: { flexDirection: 'row', gap: Spacing.sm },
  actionCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', position: 'relative', ...Shadow.sm,
  },
  actionIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  actionDesc: { fontSize: 10, color: Colors.textTertiary, textAlign: 'center' },
  activeCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },

  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerBg, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.danger + '30',
  },
  offlineText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: '500' },

  keyWarning: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.warningBg, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.warning + '40',
  },
  keyWarningText: { flex: 1, fontSize: FontSize.sm, color: Colors.warning, fontWeight: '500' },

  recentRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  recentTitle: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  recentTime: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 1 },
  useBtn: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.primaryBg, borderRadius: Radius.full },
  useBtnText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  emptyRecent: { fontSize: FontSize.sm, color: Colors.textTertiary, textAlign: 'center', paddingVertical: 16 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xl, backgroundColor: Colors.bg, borderTopWidth: 1, borderTopColor: Colors.border },

  pickerOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  pickerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  pickerItemTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  pickerItemLang: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
