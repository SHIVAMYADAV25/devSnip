import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Colors, Spacing, FontSize, Radius, Shadow } from '../constants/theme';
import { FOLDERS } from '../constants/theme';
import { readFolder, formatFileSize, getFileType } from '../services/FileService';
import type { FileItem } from '../types';

const FOLDER_COLORS: Record<string, { bg: string; icon: string }> = {
  Templates:   { bg: Colors.primary,   icon: 'document-text' },
  Resources:   { bg: Colors.info,       icon: 'layers' },
  Exports:     { bg: Colors.success,    icon: 'cloud-upload' },
  Screenshots: { bg: '#8B5CF6',         icon: 'camera' },
  Projects:    { bg: Colors.danger,     icon: 'folder-open' },
};

interface FolderCardProps {
  name: string;
  count: number;
  lastModified?: string;
  onPress: () => void;
}

function FolderCard({ name, count, lastModified, onPress }: FolderCardProps) {
  const cfg = FOLDER_COLORS[name] ?? { bg: Colors.textSecondary, icon: 'folder' };
  return (
    <TouchableOpacity onPress={onPress} style={styles.folderCard} activeOpacity={0.7}>
      <View style={[styles.folderIcon, { backgroundColor: cfg.bg + '18' }]}>
        <Ionicons name={cfg.icon as any} size={28} color={cfg.bg} />
      </View>
      <View style={styles.folderInfo}>
        <Text style={styles.folderName}>{name}</Text>
        <Text style={styles.folderCount}>{count} items</Text>
      </View>
      {lastModified && <Text style={styles.folderDate}>{lastModified}</Text>}
    </TouchableOpacity>
  );
}

function FileRow({ file }: { file: FileItem }) {
  const type = getFileType(file.name);
  const iconMap = { image: 'image', code: 'code-slash', text: 'document-text', other: 'document' } as const;
  const icon = iconMap[type];

  return (
    <View style={styles.fileRow}>
      <View style={[styles.fileIcon, { backgroundColor: Colors.bgTertiary }]}>
        <Ionicons name={icon} size={18} color={Colors.textSecondary} />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
        <Text style={styles.fileSize}>{file.size ? formatFileSize(file.size) : '—'}</Text>
      </View>
    </View>
  );
}

export default function FilesScreen() {
  const navigation = useNavigation<any>();
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);

  const load = useCallback(async () => {
    const counts: Record<string, number> = {};
    const recent: FileItem[] = [];

    for (const folder of FOLDERS) {
      const files = await readFolder(folder);
      counts[folder] = files.length;
      recent.push(...files.slice(0, 2).map((f) => ({ ...f, folder })));
    }

    setFolderCounts(counts);
    setRecentFiles(
      recent
        .sort((a, b) => (b.modificationTime ?? 0) - (a.modificationTime ?? 0))
        .slice(0, 4)
    );
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Files</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
            <Ionicons name="grid-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Folders */}
        {FOLDERS.map((folder) => (
          <FolderCard
            key={folder}
            name={folder}
            count={folderCounts[folder] ?? 0}
            onPress={() => navigation.navigate('FolderBrowser', { folder })}
          />
        ))}

        {/* Recent Files */}
        {recentFiles.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Files</Text>
              <Text style={styles.seeAll}>View all</Text>
            </View>
            {recentFiles.map((file) => (
              <FileRow key={file.uri} file={file} />
            ))}
          </View>
        )}
      </ScrollView>
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
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.bgTertiary, alignItems: 'center', justifyContent: 'center',
  },

  content: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },

  folderCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg, padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  folderIcon: {
    width: 52, height: 52, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  folderInfo: { flex: 1 },
  folderName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  folderCount: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  folderDate: { fontSize: FontSize.xs, color: Colors.textTertiary },

  recentSection: { marginTop: Spacing.xxl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500' },

  fileRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  fileIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  fileSize: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
});
