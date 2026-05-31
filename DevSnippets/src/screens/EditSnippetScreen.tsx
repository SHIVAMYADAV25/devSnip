import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { LANGUAGES, TAGS } from '../constants/theme';
import { updateSnippet } from '../database/SQLiteService';
import { CodeEditor } from '../components/snippet/CodeEditor';
import { Button, TagChip } from '../components/ui';
import type { Snippet } from '../types';

export default function EditSnippetScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const original: Snippet = route.params?.snippet;

  const [title, setTitle] = useState(original?.title ?? '');
  const [language, setLanguage] = useState(original?.language ?? 'TypeScript');
  const [code, setCode] = useState(original?.code ?? '');
  const [tags, setTags] = useState<string[]>(
    original?.tags ? original.tags.split(',').filter(Boolean) : []
  );
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) { Alert.alert('Title required', 'Please enter a title.'); return; }
    if (!code.trim()) { Alert.alert('Code required', 'Please enter some code.'); return; }
    setSaving(true);
    try {
      await updateSnippet(original.id, title.trim(), language, code, tags.join(','));
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to update snippet.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Snippet</Text>
          <TouchableOpacity onPress={handleUpdate} disabled={saving}>
            <Text style={[styles.saveText, saving && { opacity: 0.5 }]}>
              {saving ? 'Saving...' : 'Update'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Language</Text>
            <TouchableOpacity onPress={() => setShowLangPicker(true)} style={styles.selector}>
              <Text style={styles.selectorText}>{language}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <TagChip key={tag} tag={tag} onRemove={() => toggleTag(tag)} />
              ))}
              <TouchableOpacity onPress={() => setShowTagPicker(true)} style={styles.addTagBtn}>
                <Ionicons name="add" size={14} color={Colors.primary} />
                <Text style={styles.addTagText}>Add Tag</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Code</Text>
            <CodeEditor value={code} onChangeText={setCode} minHeight={220} />
          </View>

          <Button label="Update Snippet" onPress={handleUpdate} loading={saving} fullWidth size="lg" style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showLangPicker} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Select Language</Text>
            <ScrollView>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => { setLanguage(lang); setShowLangPicker(false); }}
                  style={styles.option}
                >
                  <Text style={[styles.optionText, language === lang && { color: Colors.primary, fontWeight: '600' }]}>{lang}</Text>
                  {language === lang && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showTagPicker} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Select Tags</Text>
            <View style={styles.tagsGrid}>
              {TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tagOption, tags.includes(tag) && styles.tagOptionActive]}
                >
                  <Text style={[styles.tagOptionText, tags.includes(tag) && { color: Colors.primary }]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button label="Done" onPress={() => setShowTagPicker(false)} fullWidth style={{ marginTop: 16 }} />
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
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cancelText: { fontSize: FontSize.base, color: Colors.textSecondary },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary },
  saveText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 48 },
  field: { marginBottom: Spacing.xl },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.bgTertiary, borderRadius: Radius.lg,
    padding: Spacing.md, fontSize: FontSize.base, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgTertiary, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  selectorText: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: '500' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addTagBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.primary, borderStyle: 'dashed',
  },
  addTagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, maxHeight: '80%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  option: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  optionText: { fontSize: FontSize.base, color: Colors.textPrimary },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingVertical: 8 },
  tagOption: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.bgTertiary, borderWidth: 1, borderColor: Colors.border,
  },
  tagOptionActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  tagOptionText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
});
