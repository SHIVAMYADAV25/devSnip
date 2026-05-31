import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Modal, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Colors, Spacing, FontSize, Radius, Shadow } from '../constants/theme';
import { saveApiKey, getApiKey, deleteApiKey } from '../services/AIService';
import { getDatabaseSize, clearDatabase } from '../database/SQLiteService';
import { getAllFilesSize } from '../services/FileService';
import { useAppStore } from '../store/useAppStore';
import type { Theme, AIProvider } from '../types';

const THEMES: { key: Theme; label: string; icon: string }[] = [
  { key: 'light',  label: 'Light',  icon: 'sunny-outline' },
  { key: 'dark',   label: 'Dark',   icon: 'moon-outline' },
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

const PROVIDERS: { key: AIProvider; label: string; color: string }[] = [
  { key: 'gemini', label: 'Google Gemini', color: '#4285F4' },
  { key: 'openai', label: 'OpenAI GPT',    color: '#10A37F' },
  { key: 'claude', label: 'Anthropic Claude', color: '#CC785C' },
];

export default function SettingsScreen() {
  const { settings, updateSetting, aiProvider, setAiProvider } = useAppStore();

  const [dbSize, setDbSize] = useState('—');
  const [fileSize, setFileSize] = useState('—');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [currentKey, setCurrentKey] = useState('');
  const [keyVisible, setKeyVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    getDatabaseSize().then(setDbSize);
    getAllFilesSize().then(setFileSize);
    getApiKey(aiProvider).then((k) => setCurrentKey(k ?? ''));
  }, [aiProvider]));

  const openKeyModal = async () => {
    const existing = await getApiKey(aiProvider);
    setKeyInput('');
    setCurrentKey(existing ?? '');
    setKeyVisible(false);
    setShowKeyModal(true);
  };

  const handleSaveKey = async () => {
    if (!keyInput.trim()) { Alert.alert('Required', 'Please enter an API key.'); return; }
    await saveApiKey(aiProvider, keyInput.trim());
    setCurrentKey(keyInput.trim());
    setKeyInput('');
    setShowKeyModal(false);
    Alert.alert('Saved!', 'API key saved securely.');
  };

  const handleDeleteKey = async () => {
    Alert.alert('Delete Key?', 'Are you sure you want to remove the API key?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteApiKey(aiProvider);
          setCurrentKey('');
          setShowKeyModal(false);
        }
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data?',
      'This will delete ALL snippets and cannot be undone.',
      [
        { text: 'Cancel' },
        { text: 'Clear', style: 'destructive', onPress: async () => { await clearDatabase(); } },
      ]
    );
  };

  const maskKey = (key: string) => {
    if (!key) return 'Not set';
    return '•'.repeat(Math.min(key.length - 4, 20)) + key.slice(-4);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* APPEARANCE */}
        <SettingsSection title="Appearance">
          <View style={styles.themeRow}>
            {THEMES.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => updateSetting('theme', t.key)}
                style={[styles.themeCard, settings.theme === t.key && styles.themeCardActive]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={t.icon as any}
                  size={22}
                  color={settings.theme === t.key ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.themeLabel, settings.theme === t.key && { color: Colors.primary, fontWeight: '700' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsSection>

        {/* AI */}
        <SettingsSection title="AI">
          <SettingsRow
            icon="sparkles-outline"
            label="Provider"
            value={PROVIDERS.find((p) => p.key === aiProvider)?.label ?? 'Gemini'}
            onPress={() => {}}
          />
          {/* Provider selector */}
          <View style={styles.providerRow}>
            {PROVIDERS.map((p) => (
              <TouchableOpacity
                key={p.key}
                onPress={() => setAiProvider(p.key)}
                style={[styles.providerChip, aiProvider === p.key && { backgroundColor: p.color + '18', borderColor: p.color }]}
              >
                <View style={[styles.providerDot, { backgroundColor: p.color }]} />
                <Text style={[styles.providerLabel, aiProvider === p.key && { color: p.color, fontWeight: '700' }]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <SettingsRow
            icon="key-outline"
            label="API Key"
            value={currentKey ? maskKey(currentKey) : 'Not configured'}
            onPress={openKeyModal}
            valueColor={currentKey ? Colors.success : Colors.danger}
          />
        </SettingsSection>

        {/* STORAGE */}
        <SettingsSection title="Storage">
          <SettingsRow icon="server-outline" label="Database Size" value={dbSize} />
          <SettingsRow icon="folder-outline" label="File Storage" value={fileSize} />
          <SettingsRow
            icon="trash-outline"
            label="Clear Cache & Data"
            onPress={handleClearData}
            labelColor={Colors.danger}
            iconColor={Colors.danger}
          />
        </SettingsSection>

        {/* OTHER */}
        <SettingsSection title="Other">
          <SettingsRow icon="arrow-up-circle-outline" label="Backup & Restore" onPress={() => {}} />
          <SettingsRow icon="settings-outline" label="Export Settings" onPress={() => {}} />
          <SettingsRow icon="information-circle-outline" label="About DevSnippets" value="v1.0.0" onPress={() => {}} />
        </SettingsSection>

      </ScrollView>

      {/* API Key Modal */}
      <Modal visible={showKeyModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>
              {PROVIDERS.find((p) => p.key === aiProvider)?.label} API Key
            </Text>
            <Text style={styles.sheetSubtitle}>
              {currentKey
                ? `Current key: ${maskKey(currentKey)}`
                : 'No key configured. Add your API key below.'}
            </Text>

            <View style={styles.keyInputRow}>
              <TextInput
                value={keyInput}
                onChangeText={setKeyInput}
                placeholder="Paste your API key here..."
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry={!keyVisible}
                style={styles.keyInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setKeyVisible(!keyVisible)} style={styles.eyeBtn}>
                <Ionicons name={keyVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.keyActions}>
              <TouchableOpacity onPress={handleSaveKey} style={styles.saveKeyBtn}>
                <Text style={styles.saveKeyText}>Save Key</Text>
              </TouchableOpacity>
              {currentKey && (
                <TouchableOpacity onPress={handleDeleteKey} style={styles.deleteKeyBtn}>
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={() => setShowKeyModal(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sStyles.section}>
      <Text style={sStyles.sectionTitle}>{title}</Text>
      <View style={sStyles.card}>{children}</View>
    </View>
  );
}

interface RowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  labelColor?: string;
  valueColor?: string;
  iconColor?: string;
}

function SettingsRow({ icon, label, value, onPress, labelColor, valueColor, iconColor }: RowProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} style={sStyles.row} activeOpacity={0.7}>
      <Ionicons name={icon as any} size={20} color={iconColor ?? Colors.textSecondary} style={{ marginRight: 12 }} />
      <Text style={[sStyles.rowLabel, labelColor && { color: labelColor }]}>{label}</Text>
      <View style={sStyles.rowRight}>
        {value && <Text style={[sStyles.rowValue, valueColor && { color: valueColor }]} numberOfLines={1}>{value}</Text>}
        {onPress && <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />}
      </View>
    </Wrapper>
  );
}

const sStyles = StyleSheet.create({
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadow.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  rowLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '50%' },
  rowValue: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'right' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgSecondary },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },

  content: { paddingHorizontal: Spacing.xl, paddingBottom: 40, paddingTop: Spacing.md },

  themeRow: { flexDirection: 'row', gap: 10, padding: Spacing.md },
  themeCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: Radius.lg, backgroundColor: Colors.bgTertiary,
    borderWidth: 1.5, borderColor: 'transparent', gap: 6,
  },
  themeCardActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  themeLabel: { fontSize: FontSize.xs, fontWeight: '500', color: Colors.textSecondary },

  providerRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: 8 },
  providerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.lg,
    backgroundColor: Colors.bgTertiary, borderWidth: 1.5, borderColor: 'transparent',
  },
  providerDot: { width: 8, height: 8, borderRadius: 4 },
  providerLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  sheetSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 20 },

  keyInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgTertiary, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  keyInput: {
    flex: 1, padding: Spacing.md,
    fontSize: FontSize.sm, color: Colors.textPrimary, fontFamily: 'monospace',
  },
  eyeBtn: { padding: Spacing.md },

  keyActions: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  saveKeyBtn: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: 13, alignItems: 'center',
  },
  saveKeyText: { fontSize: FontSize.base, fontWeight: '600', color: '#FFF' },
  deleteKeyBtn: {
    width: 46, backgroundColor: Colors.dangerBg, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },

  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary },
});
