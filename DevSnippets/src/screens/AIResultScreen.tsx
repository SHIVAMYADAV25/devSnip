import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { saveFile } from '../services/FileService';
import { Button } from '../components/ui';

type Tab = 'overview' | 'how' | 'improvements';

function parseResult(result: string): { overview: string; how: string; improvements: string } {
  // Try to split AI response into sections intelligently
  const lower = result.toLowerCase();

  let overview = '';
  let how = '';
  let improvements = '';

  // Check for section headers
  const hasHow = lower.includes('how it works') || lower.includes('step') || lower.includes('line by line');
  const hasImprov = lower.includes('improve') || lower.includes('suggestion') || lower.includes('recommend');

  if (hasHow || hasImprov) {
    // Split on common section headers
    const sections = result.split(/\n(?=#{1,3}\s|[0-9]+\.\s+(?:How|Overview|Improve|Summary)|(?:How It Works|Overview|Improvements?|Summary|Suggestions?)\s*[:：\n])/i);

    if (sections.length >= 3) {
      overview = sections[0].trim();
      how = sections[1].trim();
      improvements = sections.slice(2).join('\n').trim();
    } else if (sections.length === 2) {
      overview = sections[0].trim();
      how = sections[1].trim();
      improvements = '';
    } else {
      // No clear sections — put everything in overview
      const half = Math.floor(result.length / 2);
      overview = result.slice(0, half).trim();
      how = result.slice(half).trim();
    }
  } else {
    // Summarize action — put all in overview
    overview = result;
  }

  return { overview, how, improvements };
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'how', label: 'How It Works' },
  { key: 'improvements', label: 'Improvements' },
];

export default function AIResultScreen() {
  const navigation = useNavigation<any>();
  const { aiResult } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState(false);

  if (!aiResult) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No AI result found.</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const sections = parseResult(aiResult.result);

  const activeContent = {
    overview: sections.overview,
    how: sections.how,
    improvements: sections.improvements,
  }[activeTab];

  const handleCopy = async () => {
    await Clipboard.setStringAsync(aiResult.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      const fileName = `ai-result-${aiResult.snippetId}-${Date.now()}.txt`;
      await saveFile('Exports', fileName, `AI Result — ${aiResult.snippetTitle}\nAction: ${aiResult.action}\n\n${aiResult.result}`);
      Alert.alert('Saved!', 'AI result saved to Exports folder.');
    } catch {
      Alert.alert('Error', 'Could not save file.');
    }
  };

  const handleExport = async () => {
    try {
      await Share.share({
        message: `${aiResult.snippetTitle} — AI ${aiResult.action}\n\n${aiResult.result}`,
        title: `DevSnippets AI — ${aiResult.snippetTitle}`,
      });
    } catch {
      Alert.alert('Error', 'Could not share.');
    }
  };

  const actionColor = aiResult.action === 'explain' ? Colors.primary
    : aiResult.action === 'summarize' ? Colors.info : Colors.success;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Result</Text>
        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={20} color={copied ? Colors.success : Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Snippet info */}
      <View style={styles.snippetInfo}>
        <View style={[styles.actionBadge, { backgroundColor: actionColor + '18' }]}>
          <Ionicons
            name={aiResult.action === 'explain' ? 'bulb-outline' : aiResult.action === 'summarize' ? 'document-text-outline' : 'trending-up-outline'}
            size={14}
            color={actionColor}
          />
          <Text style={[styles.actionLabel, { color: actionColor }]}>
            {aiResult.action.charAt(0).toUpperCase() + aiResult.action.slice(1)}
          </Text>
        </View>
        <Text style={styles.snippetTitle} numberOfLines={1}>{aiResult.snippetTitle}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeContent ? (
          <Text style={styles.resultText}>{activeContent}</Text>
        ) : (
          <View style={styles.emptyTab}>
            <Ionicons name="document-outline" size={28} color={Colors.textTertiary} />
            <Text style={styles.emptyTabText}>No content for this section</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleCopy} style={[styles.footerBtn, { backgroundColor: Colors.bgTertiary }]}>
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={Colors.textPrimary} />
          <Text style={styles.footerBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={[styles.footerBtn, { backgroundColor: Colors.infoBg }]}>
          <Ionicons name="bookmark-outline" size={18} color={Colors.info} />
          <Text style={[styles.footerBtnText, { color: Colors.info }]}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleExport} style={[styles.footerBtn, { backgroundColor: Colors.primaryBg, flex: 1.5 }]}>
          <Ionicons name="share-outline" size={18} color={Colors.primary} />
          <Text style={[styles.footerBtnText, { color: Colors.primary }]}>Export</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: { padding: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  copyBtn: { padding: 4 },

  snippetInfo: {
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    gap: 6,
  },
  actionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
  },
  actionLabel: { fontSize: FontSize.xs, fontWeight: '600' },
  snippetTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.full,
  },
  tabActive: { backgroundColor: Colors.primaryBg },
  tabText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },

  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 100 },

  resultText: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 24,
  },

  emptyTab: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTabText: { fontSize: FontSize.base, color: Colors.textTertiary },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10,
    padding: Spacing.xl, backgroundColor: Colors.bg,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  footerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: Radius.lg,
  },
  footerBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: Spacing.xxl },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary },
});
