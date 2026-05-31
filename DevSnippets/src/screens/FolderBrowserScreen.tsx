import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import { Colors, Spacing, FontSize, Radius } from '../constants/theme';
import { FOLDERS } from '../constants/theme';
import { readFolder, deleteFile, moveFile, shareFile, formatFileSize, getFileType } from '../services/FileService';
import { Button, EmptyState } from '../components/ui';
import type { FileItem } from '../types';

export default function FolderBrowserScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const folderName: string = route.params?.folder ?? 'Templates';

  const [files, setFiles] = useState<FileItem[]>([]);
  const [selected, setSelected] = useState<FileItem | null>(null);
  const [showMove, setShowMove] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const load = useCallback(async () => {
    const f = await readFolder(folderName);
    setFiles(f);
  }, [folderName]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = async () => {
    if (!selected) return;
    setShowDelete(false);
    await deleteFile(selected.uri);
    setSelected(null);
    load();
  };

  const handleMove = async (toFolder: string) => {
    if (!selected) return;
    setShowMove(false);
    await moveFile(selected.uri, toFolder, selected.name);
    setSelected(null);
    load();
  };

  const handleShare = async (file: FileItem) => {
    try {
      await shareFile(file.uri);
    } catch {
      Alert.alert('Error', 'Could not share this file.');
    }
  };

  const typeIcon = (name: string) => {
    const t = getFileType(name);
    return t === 'image' ? 'image-outline' : t === 'code' ? 'code-slash-outline' : 'document-text-outline';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{folderName}</Text>
        <TouchableOpacity style={styles.moreBtn} onPress={() => {}}>
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={files}
        keyExtractor={(f) => f.uri}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.fileRow}
            onLongPress={() => { setSelected(item); }}
            activeOpacity={0.7}
          >
            <View style={styles.fileIcon}>
              <Ionicons name={typeIcon(item.name) as any} size={20} color={Colors.primary} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.fileMeta}>
                {item.size ? formatFileSize(item.size) : '—'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => { setSelected(item); }}
              style={styles.actionMenu}
            >
              <Ionicons name="ellipsis-vertical" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="Folder is empty"
            subtitle="Files you save here will appear in this folder"
          />
        }
      />

      {/* File action sheet */}
      {selected && !showMove && !showDelete && (
        <Modal transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetFileName} numberOfLines={1}>{selected.name}</Text>

              <TouchableOpacity onPress={() => handleShare(selected)} style={styles.sheetOption}>
                <Ionicons name="share-outline" size={22} color={Colors.info} />
                <Text style={styles.sheetOptionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowMove(true)} style={styles.sheetOption}>
                <Ionicons name="folder-open-outline" size={22} color={Colors.warning} />
                <Text style={styles.sheetOptionText}>Move to folder</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDelete(true)} style={styles.sheetOption}>
                <Ionicons name="trash-outline" size={22} color={Colors.danger} />
                <Text style={[styles.sheetOptionText, { color: Colors.danger }]}>Delete</Text>
              </TouchableOpacity>

              <Button label="Cancel" onPress={() => setSelected(null)} variant="secondary" fullWidth style={{ marginTop: 8 }} />
            </View>
          </View>
        </Modal>
      )}

      {/* Move modal */}
      <Modal visible={showMove} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Move to</Text>
            {FOLDERS.filter((f) => f !== folderName).map((folder) => (
              <TouchableOpacity
                key={folder}
                onPress={() => handleMove(folder)}
                style={styles.folderOption}
              >
                <Ionicons name="folder" size={22} color={Colors.primary} />
                <Text style={styles.folderOptionText}>{folder}</Text>
              </TouchableOpacity>
            ))}
            <Button label="Cancel" onPress={() => setShowMove(false)} variant="secondary" fullWidth style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

      {/* Delete confirm */}
      <Modal visible={showDelete} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.deleteCard}>
            <View style={styles.deleteIcon}>
              <Ionicons name="warning-outline" size={32} color={Colors.danger} />
            </View>
            <Text style={styles.deleteTitle}>Delete File?</Text>
            <Text style={styles.deleteMsg}>This action cannot be undone.</Text>
            <View style={styles.deleteBtns}>
              <Button label="Cancel" onPress={() => setShowDelete(false)} variant="secondary" style={{ flex: 1 }} />
              <Button label="Delete" onPress={handleDelete} variant="danger" style={{ flex: 1 }} />
            </View>
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
  back: { padding: 4 },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  moreBtn: { padding: 4 },

  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 40 },

  fileRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  fileIcon: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.primaryBg, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  fileMeta: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  actionMenu: { padding: 8 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  sheetFileName: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginBottom: 20 },
  sheetTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  sheetOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  sheetOptionText: { fontSize: FontSize.base, color: Colors.textPrimary },

  folderOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  folderOptionText: { fontSize: FontSize.base, color: Colors.textPrimary },

  deleteCard: {
    margin: 32, backgroundColor: Colors.bg, borderRadius: 20,
    padding: Spacing.xxl, alignItems: 'center',
  },
  deleteIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.dangerBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  deleteTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  deleteMsg: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: 24 },
  deleteBtns: { flexDirection: 'row', gap: 12, width: '100%' },
});
