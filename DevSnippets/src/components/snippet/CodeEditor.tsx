import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';

interface CodeViewerProps {
  code: string;
  language?: string;
  maxHeight?: number;
}

export function CodeViewer({ code, language = '', maxHeight = 300 }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
          <View style={[styles.dot, { backgroundColor: '#FEBC2E' }]} />
          <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
        </View>
        {language && <Text style={styles.lang}>{language}</Text>}
        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={15}
            color={copied ? Colors.success : '#9CA3AF'}
          />
          <Text style={[styles.copyText, copied && { color: Colors.success }]}>
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Code area */}
      <ScrollView
        style={[styles.codeScroll, { maxHeight }]}
        horizontal={false}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.codeInner}>
            {/* Line numbers */}
            <View style={styles.lineNums}>
              {lines.map((_, i) => (
                <Text key={i} style={styles.lineNum}>{i + 1}</Text>
              ))}
            </View>
            {/* Code */}
            <Text style={styles.codeText}>{code}</Text>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

interface CodeEditorProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function CodeEditor({ value, onChangeText, placeholder = 'Paste or type your code here...', minHeight = 200 }: CodeEditorProps) {
  return (
    <View style={styles.editorContainer}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
          <View style={[styles.dot, { backgroundColor: '#FEBC2E' }]} />
          <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
        </View>
        <Text style={styles.lang}>editor</Text>
      </View>

      {/* Editor */}
      <ScrollView style={{ flex: 1 }} nestedScrollEnabled>
        <View style={styles.editorRow}>
          {/* Line numbers */}
          <View style={styles.lineNums}>
            {(value || '').split('\n').map((_, i) => (
              <Text key={i} style={styles.lineNum}>{i + 1}</Text>
            ))}
            {/* extra line number for cursor */}
            <Text style={styles.lineNum}>{(value || '').split('\n').length + 1}</Text>
          </View>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            multiline
            style={[styles.editor, { minHeight }]}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E2E',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  editorContainer: {
    backgroundColor: '#1E1E2E',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: '#2A2A3E',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A50',
  },
  dots: { flexDirection: 'row', gap: 5, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  lang: {
    fontSize: FontSize.xs,
    color: '#9CA3AF',
    fontWeight: '500',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: '#2A2A3E',
  },
  copyText: { fontSize: FontSize.xs, color: '#9CA3AF' },

  codeScroll: { paddingVertical: Spacing.md },
  codeInner: { flexDirection: 'row', paddingHorizontal: Spacing.md },

  lineNums: { marginRight: Spacing.md, alignItems: 'flex-end' },
  lineNum: {
    fontSize: FontSize.sm,
    color: '#4B5563',
    lineHeight: 20,
    fontFamily: 'monospace',
  },

  codeText: {
    fontSize: FontSize.sm,
    color: '#E2E8F0',
    lineHeight: 20,
    fontFamily: 'monospace',
  },

  editorRow: { flexDirection: 'row', padding: Spacing.md },
  editor: {
    flex: 1,
    fontSize: FontSize.sm,
    color: '#E2E8F0',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});
